import React from "react";
import { Button } from "@/components/ui/button";

interface FeedProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string;
        users?: {
            username: string;
        };
        looking_for?: string[];
        tags?: string[];
    };
    isApplying: boolean;
    hasApplied: boolean;
    onApply: (id: string) => void;
}

const FeedProjectCard = ({ project, isApplying, hasApplied, onApply }: FeedProjectCardProps) => {
    return (
        <div
            className="rounded-3xl p-[2px]"
            style={{
                background:
                    "linear-gradient(135deg, rgba(157, 156, 255, 0.6), rgba(166, 244, 197, 0.6))",
            }}
        >
            <div
                className="rounded-3xl p-8"
                style={{ backgroundColor: "#1E2139" }}
            >
                <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-2xl font-bold break-words flex-1 min-w-0">{project.title}</h3>
                    <Button
                        size="sm"
                        disabled={isApplying || hasApplied}
                        onClick={() => onApply(project.id)}
                        className="rounded-xl shrink-0"
                        style={{
                            backgroundColor: hasApplied ? "#374151" : "#A6F4C5", // Grey if applied, Green if not
                            color: hasApplied ? "#9CA3AF" : "#111118",
                            opacity: isApplying ? 0.7 : 1,
                            cursor: (isApplying || hasApplied) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isApplying ? "Applying..." : hasApplied ? "Applied" : "✓ Down to commit!"}
                    </Button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary" />
                    <span className="text-sm">
                        {project.users?.username || "Anonymous"}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {(project.looking_for || []).map((role) => (
                        <span
                            key={role}
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor:
                                    role === "Idea Guy" ? "#A6F4C5" : "#6789EC",
                                color: "#111118",
                            }}
                        >
                            {role}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                    {project.description}
                </p>
            </div>
        </div>
    );
};

export default FeedProjectCard;
