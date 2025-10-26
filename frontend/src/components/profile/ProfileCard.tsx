import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";

interface Project {
  name: string;
  description: string;
  link: string;
}

interface ProfileCardProps {
  name: string;
  avatar?: string;
  devType: string[];
  bio: string;
  technologies: string[];
  projects: Project[];
  github?: string;
  linkedin?: string;
  email?: string;
}

const ProfileCard = ({
  name,
  devType,
  bio,
  technologies,
  projects,
  github,
  linkedin,
  email,
}: ProfileCardProps) => {
  return (
    <Card className="p-8 border-border bg-card shadow-card">
      <div className="flex items-start gap-6 mb-6">
        <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-glow">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-bold mb-2">{name}</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {devType.map((type) => (
              <Badge key={type} className="bg-accent/20 text-accent border-accent/30">
                {type}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            {github && (
              <Button variant="ghost" size="icon" asChild>
                <a href={github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5" />
                </a>
              </Button>
            )}
            {linkedin && (
              <Button variant="ghost" size="icon" asChild>
                <a href={linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                </a>
              </Button>
            )}
            {email && (
              <Button variant="ghost" size="icon" asChild>
                <a href={`mailto:${email}`}>
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">About</h3>
          <p className="text-sm text-foreground">{bio}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">Projects</h3>
          <div className="space-y-3">
            {projects.map((project) => (
              <Card key={project.name} className="p-4 bg-secondary border-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{project.name}</h4>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileCard;
