import { Notification } from "@/lib/api";

interface NotificationCardProps {
    notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
    const senderName =
        notification.users?.username || notification.users?.email || "Someone";

    const formatTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffInSeconds = Math.floor(
                (now.getTime() - date.getTime()) / 1000
            );

            if (diffInSeconds < 60) return "Just now";
            if (diffInSeconds < 3600)
                return `${Math.floor(diffInSeconds / 60)}m ago`;
            if (diffInSeconds < 86400)
                return `${Math.floor(diffInSeconds / 3600)}h ago`;
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
        } catch {
            return "Recently";
        }
    };

    const typeLabel: Record<string, string> = {
        project_liked: "Down to commit",
        approval: "Match!",
        rejection: "Not accepted",
    };

    const typeBadgeColor: Record<string, string> = {
        project_liked: "#5B7FFF",
        approval: "#A6F4C5",
        rejection: "#FF6B6B",
    };

    return (
        <div
            className={`relative rounded-2xl p-5 transition-opacity ${notification.is_read ? "opacity-70" : ""
                }`}
            style={{
                background:
                    "linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)",
                backdropFilter: "blur(12px)",
            }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                    {/* Type badge */}
                    <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase"
                        style={{
                            backgroundColor: typeBadgeColor[notification.type] ?? "#79B1DF",
                            color: "#111118",
                        }}
                    >
                        {typeLabel[notification.type] ?? notification.type}
                    </span>

                    {/* Message */}
                    <p className="text-sm text-white/90 break-words">
                        {notification.message || `${senderName} interacted with your project`}
                    </p>
                </div>

                {/* Sender avatar + timestamp */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {senderName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-white/40">
                        {formatTimeAgo(notification.created_at)}
                    </span>
                </div>
            </div>

            {/* Unread dot */}
            {!notification.is_read && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#5B7FFF]" />
            )}
        </div>
    );
};

export default NotificationCard;
