import React from "react";
import { Trash2 } from "lucide-react";

interface MyProjectCardProps {
    project: {
        id: string;
        title: string;
        description?: string;
        tags?: string[];
        looking_for?: string[];
        time_commitment?: string;
    };
    onDelete?: (id: string) => void;
}

const MyProjectCard = ({ project, onDelete }: MyProjectCardProps) => {
    return (
        <div className="relative rounded-2xl w-full">
            <div
                className="relative rounded-2xl p-6"
                style={{
                    background: "linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)",
                    backdropFilter: "blur(12px)"
                }}
            >
                <div className="space-y-4">
                    {/* Header: Project name and Delete button */}
                    <div className="flex items-start justify-between gap-4">
                        <h2 className="text-2xl font-bold text-white break-words flex-1 min-w-0">{project.title}</h2>
                        <button
                            onClick={() => onDelete?.(project.id)}
                            className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors shrink-0"
                            title="Delete Project"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Role and Tag tags */}
                    <div className="flex flex-wrap gap-2">
                        {(project.looking_for || []).map((role, idx) => (
                            <span
                                key={`role-${idx}`}
                                className="px-3 py-1 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: role === "Idea Guy" ? "#A6F4C5" : "#6789EC",
                                    color: "#111118",
                                }}
                            >
                                {role}
                            </span>
                        ))}
                        {(project.tags || []).map((tag, idx) => (
                            <span
                                key={`tag-${idx}`}
                                className="px-3 py-1 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: "#79B1DF",
                                    color: "#111118",
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                        {project.time_commitment && (
                            <span
                                className="px-3 py-1 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: "#A79CFF",
                                    color: "#111118",
                                }}
                            >
                                {project.time_commitment}
                            </span>
                        )}
                    </div>

                    {/* Project description */}
                    <p className="text-sm text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                        {project.description}
                    </p>
                </div>
            </div>
            <div
                className="absolute inset-0 rounded-2xl pointer-events-none"
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

export default MyProjectCard;
