/**
 * In-memory SSE connection hub for realtime notifications.
 *
 * Stores userId → Set<express.Response> so the server can push
 * events to every open stream for a given user.
 *
 * NOTE: This is single-process only.  If you scale to multiple
 * backend instances, swap this for Redis pub/sub or Supabase Realtime.
 */

/** @type {Map<string, Set<import('express').Response>>} */
const clients = new Map();

/**
 * Register an open SSE response for a user.
 */
export function addClient(userId, res) {
    if (!clients.has(userId)) {
        clients.set(userId, new Set());
    }
    clients.get(userId).add(res);
}

/**
 * Remove an SSE response when the connection closes.
 */
export function removeClient(userId, res) {
    const set = clients.get(userId);
    if (!set) return;
    set.delete(res);
    if (set.size === 0) clients.delete(userId);
}

/**
 * Push an SSE event to every open connection for a user.
 * @param {string} userId
 * @param {object} payload  – will be JSON-stringified into a `data:` frame
 */
export function broadcastToUser(userId, payload) {
    const set = clients.get(userId);
    if (!set || set.size === 0) return;

    const frame = `data: ${JSON.stringify(payload)}\n\n`;

    for (const res of set) {
        try {
            res.write(frame);
        } catch {
            // Connection already dead – clean up
            set.delete(res);
        }
    }

    if (set.size === 0) clients.delete(userId);
}
