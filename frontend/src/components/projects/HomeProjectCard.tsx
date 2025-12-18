import React from "react";

interface HomeProjectCardProps {
    project: {
        id: string;
        title: string;
        description: string;
        looking_for?: string[];
    };
}

const HomeProjectCard = ({ project }: HomeProjectCardProps) => {
    return (
        <div className="relative rounded-3xl transition-all hover:scale-105">
            <div
                className="relative rounded-3xl p-6 h-full"
                style={{
                    background: "linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)",
                    backdropFilter: 'blur(12px)',
                }}
            >
                <h3 className="text-xl font-bold mb-4 text-white">{project.title || 'Untitled Project'}</h3>

                <div className="flex flex-nowrap gap-1.5 mb-4 overflow-x-auto">
                    {(project.looking_for || []).slice(0, 3).map((role, idx) => (
                        <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                                backgroundColor: role === 'Idea Guy' ? '#A6F4C5' : '#6789EC',
                                color: '#111118',
                                fontSize: '10px',
                                fontWeight: '500'
                            }}
                        >
                            {role}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
                    {project.description || 'No description available.'}
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

export default HomeProjectCard;
