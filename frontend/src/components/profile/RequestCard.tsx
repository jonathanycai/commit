import React from "react";
import { Linkedin, ChevronLeft, ChevronRight, Check, X, Mail, Link as LinkIcon, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestCardProps {
    applicant: any; // Replace with proper Application['users'] type
    onApprove: () => void;
    onReject: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    showNavigation?: boolean;
}

const RequestCard = ({
    applicant,
    onApprove,
    onReject,
    onNext,
    onPrevious,
    showNavigation
}: RequestCardProps) => {
    if (!applicant) return null;

    return (
        <div>
            <div className="relative">
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
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">{applicant.username}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {[applicant.role, applicant.experience, applicant.time_commitment].filter(Boolean).map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                            style={{
                                                backgroundColor: idx === 0 ? '#5B7FFF' : idx === 1 ? '#A6F4C5' : '#79B1DF',
                                                color: '#111118'
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {applicant.project_links && applicant.project_links.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-white mb-2">Projects</h4>
                                    <div className="flex flex-col gap-2">
                                        {applicant.project_links.map((link: string, idx: number) => (
                                            <a
                                                key={idx}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-white hover:text-primary transition-colors group"
                                            >
                                                <div className="h-7 w-7 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <LinkIcon className="h-3.5 w-3.5 text-white group-hover:text-primary transition-colors" />
                                                </div>
                                                <span className="text-xs truncate opacity-90 group-hover:opacity-100 transition-opacity" title={link}>
                                                    {link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                                                </span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Socials</h4>
                                <div className="flex flex-col gap-2">
                                    {applicant.email && (
                                        <a
                                            href={`mailto:${applicant.email}`}
                                            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                                        >
                                            <div className="h-7 w-7 rounded-full flex-shrink-0 bg-white flex items-center justify-center">
                                                <Mail className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-xs break-words truncate" title={applicant.email}>
                                                {applicant.email}
                                            </span>
                                        </a>
                                    )}
                                    {applicant.socials?.github && (
                                        <a
                                            href={applicant.socials.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                                        >
                                            <div className="h-7 w-7 rounded-full flex-shrink-0 bg-black flex items-center justify-center">
                                                <Github className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="text-xs break-words truncate" title={applicant.socials.github}>
                                                {applicant.socials.github}
                                            </span>
                                        </a>
                                    )}
                                    {applicant.socials?.linkedin && (
                                        <a
                                            href={applicant.socials.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                                        >
                                            <div className="h-7 w-7 rounded-full flex-shrink-0" style={{ backgroundColor: '#0A66C2' }}>
                                                <Linkedin className="h-7 w-7 p-1.5" />
                                            </div>
                                            <span className="text-xs break-words truncate" title={applicant.socials.linkedin}>
                                                {applicant.socials.linkedin}
                                            </span>
                                        </a>
                                    )}
                                    {applicant.socials?.discord && (
                                        <div className="flex items-center gap-2 text-white">
                                            <div className="h-7 w-7 rounded-full flex-shrink-0" style={{ backgroundColor: '#5865F2' }}>
                                                <svg viewBox="0 0 24 24" className="h-7 w-7 p-1.5" fill="white">
                                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs break-words truncate" title={applicant.socials.discord}>
                                                {applicant.socials.discord}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {showNavigation && (
                    <>
                        <button
                            onClick={onPrevious}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#5B7FFF' }}
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={onNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#5B7FFF' }}
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
                <Button
                    onClick={onApprove}
                    className="flex-1 h-11 rounded-xl font-medium text-sm"
                    style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                >
                    <Check className="w-4 h-4 mr-2" />
                    Build together
                </Button>
                <Button
                    onClick={onReject}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-medium border-2 text-sm"
                    style={{ borderColor: '#5B7FFF', color: '#5B7FFF' }}
                >
                    <X className="w-4 h-4 mr-2" />
                    Not this time
                </Button>
            </div>
        </div>
    );
};

export default RequestCard;
