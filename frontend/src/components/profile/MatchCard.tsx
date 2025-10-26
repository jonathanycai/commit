import React from "react";
import { Mail, Linkedin } from "lucide-react";
import { Match } from "@/lib/api";

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const { project, user, type } = match;
  
  // Determine the display name and role info based on match type
  const displayName = type === 'successful' ? user.username : user.username;
  const roleInfo = type === 'successful' 
    ? project.looking_for || [] 
    : [user.role, user.experience, user.time_commitment].filter(Boolean);

  return (
    <div 
      className="rounded-2xl p-[2px]"
      style={{ 
        background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
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
          {/* Header: Project name and user name */}
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">{displayName}</span>
            </div>
          </div>

          {/* Role tags */}
          <div className="flex flex-wrap gap-2">
            {roleInfo.map((role, idx) => (
              <span 
                key={idx}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{ 
                  backgroundColor: role === 'Designer' || role === 'Front-End' ? '#5B7FFF' : 
                                  role === 'Intermediate' ? '#A6F4C5' : 
                                  role === 'Advanced' ? '#A6F4C5' : '#79B1DF',
                  color: '#111118'
                }}
              >
                {role}
              </span>
            ))}
          </div>

          {/* Project description */}
          <p className="text-sm text-white/90 leading-relaxed">
            {project.description}
          </p>

          {/* Contact section */}
          <div className="space-y-3">
            <p 
              className="text-base font-medium"
              style={{ color: '#A79CFF' }}
            >
              Reach out to {displayName} by:
            </p>
            <div className="flex items-center gap-6">
              <a 
                href={`mailto:${user.email}`}
                className="flex items-center gap-2 text-white hover:text-primary transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">{user.email}</span>
              </a>
              
              {user.socials?.discord && (
                <div className="flex items-center gap-2 text-white">
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#5865F2' }}>
                    <svg viewBox="0 0 24 24" className="h-8 w-8 p-1.5" fill="white">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </div>
                  <span className="text-sm">{user.socials.discord}</span>
                </div>
              )}

              {user.socials?.linkedin && (
                <a 
                  href={user.socials.linkedin}
                  className="flex items-center gap-2 text-white hover:text-primary transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="h-8 w-8 rounded-full" style={{ backgroundColor: '#0A66C2' }}>
                    <Linkedin className="h-8 w-8 p-1.5" />
                  </div>
                  <span className="text-sm">{user.socials.linkedin}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
