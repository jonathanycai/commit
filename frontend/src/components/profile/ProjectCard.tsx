import React from "react";

interface ProjectCardProps {
    project: {
        title: string;
        description?: string;
        tags?: string[];
        looking_for?: string[];
    };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
    return (
        <div>
            <div
                className="rounded-2xl p-[2px]"
                style={{
                    background: "linear-gradient(135deg, rgba(103, 137, 236, 1), rgba(93, 224, 187, 1))"
                }}
            >
                <div
                    className="rounded-2xl p-6"
                    style={{
                        backgroundColor: 'rgba(20, 22, 35, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div className="space-y-3">
                        <h2 className="text-xl font-bold text-white">{project.title}</h2>
                        <div className="flex flex-wrap gap-2">
                            {project.tags?.map((tag, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{
                                        backgroundColor: '#79B1DF',
                                        color: '#111118'
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                            {project.looking_for?.map((role, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{
                                        backgroundColor: '#A6F4C5',
                                        color: '#111118'
                                    }}
                                >
                                    {role}
                                </span>
                            ))}
                        </div>

                        <div
                            className="aspect-video rounded-xl"
                            style={{
                                background: 'linear-gradient(180deg, #A6F4C5 0%, #79B1DF 100%)'
                            }}
                        />

                        <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                            {project.description}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
