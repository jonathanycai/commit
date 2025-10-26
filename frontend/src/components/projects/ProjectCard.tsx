import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar?: string;
  technologies: string[];
  lookingFor: string[];
  postedDate: string;
  applicants: number;
}

const ProjectCard = ({
  id,
  title,
  description,
  creator,
  creatorAvatar,
  technologies,
  lookingFor,
  postedDate,
  applicants,
}: ProjectCardProps) => {
  return (
    <Card className="p-6 hover:shadow-glow transition-all duration-300 border-border bg-card group cursor-pointer">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
          {creator.charAt(0)}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">by {creator}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {description}
      </p>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Tech Stack</p>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Looking For</p>
          <div className="flex flex-wrap gap-2">
            {lookingFor.map((role) => (
              <Badge key={role} className="text-xs bg-accent/20 text-accent border-accent/30">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {postedDate}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {applicants} interested
          </span>
        </div>
        <Link to={`/projects/${id}`}>
          <Button variant="ghost" size="sm" className="group/btn">
            View Details
            <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ProjectCard;
