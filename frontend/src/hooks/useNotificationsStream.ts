import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/authToken";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Opens a fetch-based SSE stream to GET /notifications/stream.
 *
 * We can't use the native EventSource API because it doesn't support
 * custom headers (we need `Authorization: Bearer <token>`).
 *
 * On receiving a `notification_created` event the hook invalidates
 * the React-Query ["notifications"] cache so any mounted query
 * refetches automatically.
 *
 * Reconnects automatically on disconnect with a 3-5 s backoff.
 */
export function useNotificationsStream({ enabled }: { enabled: boolean }) {
    const queryClient = useQueryClient();
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;
        let reconnectTimeout: ReturnType<typeof setTimeout>;

        async function connect() {
            const token = getAccessToken();
            if (!token || cancelled) return;

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                    signal: controller.signal,
                });

                if (!response.ok || !response.body) {
                    throw new Error(`SSE stream failed: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { value, done } = await reader.read();
                    if (done || cancelled) break;

                    buffer += decoder.decode(value, { stream: true });

                    // SSE frames are separated by double newlines
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop() ?? "";

                    for (const part of parts) {
                        const dataLine = part
                            .split("\n")
                            .find((l) => l.startsWith("data: "));
                        if (!dataLine) continue;

                        try {
                            const payload = JSON.parse(dataLine.slice(6));
                            if (payload.type === "notification_created") {
                                queryClient.invalidateQueries({
                                    queryKey: ["notifications"],
                                });
                            }
                            // "ping" and "connected" are silently ignored
                        } catch {
                            // Ignore malformed frames
                        }
                    }
                }
            } catch (err: any) {
                if (err?.name === "AbortError" || cancelled) return;
                console.warn("Notifications stream error, reconnecting...", err?.message);
            }

            // Reconnect after a short delay (3-5 s jitter)
            if (!cancelled) {
                const delay = 3000 + Math.random() * 2000;
                reconnectTimeout = setTimeout(connect, delay);
            }
        }

        connect();

        return () => {
            cancelled = true;
            clearTimeout(reconnectTimeout);
            abortRef.current?.abort();
        };
    }, [enabled, queryClient]);
}
