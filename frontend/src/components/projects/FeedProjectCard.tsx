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
        time_commitment?: string;
    };
    isApplying: boolean;
    hasApplied: boolean;
    onApply: (id: string) => void;
}

const FeedProjectCard = ({ project, isApplying, hasApplied, onApply }: FeedProjectCardProps) => {
    return (
        <div className="relative rounded-3xl">
            <div
                className="relative rounded-3xl p-8"
                style={{
                    background: "linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)",
                    backdropFilter: "blur(12px)"
                }}
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
                    {project.time_commitment && (
                        <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: "#79B1DF",
                                color: "#111118",
                            }}
                        >
                            {project.time_commitment}
                        </span>
                    )}
                </div>

                <p className="text-sm text-white leading-relaxed break-words whitespace-pre-wrap">
                    {project.description}
                </p>
            </div>
            <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                    padding: "1px",
                    background: "linear-gradient(135deg, rgba(103, 137, 236, 1), rgba(93, 224, 187, 1))",
                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    WebkitMaskComposite: "xor",
                    maskComposite: "exclude",
                }}
            />
        </div>
    );
};

export default FeedProjectCard;
