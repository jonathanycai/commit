import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

// Mock data - in real app would fetch based on id
const mockProject = {
  id: "1",
  title: "AI-Powered Code Review Tool",
  description: "Building an intelligent code review assistant that helps developers write better code through automated suggestions and best practices. This tool will analyze code patterns, suggest improvements, and learn from your team's coding style over time. We're aiming to integrate with popular version control systems and IDEs.",
  creator: "Sarah Chen",
  technologies: ["React", "Python", "TensorFlow", "FastAPI", "Docker", "PostgreSQL"],
  lookingFor: ["ML Engineer", "Backend Dev", "DevOps Engineer"],
  postedDate: "2 days ago",
  applicants: 12,
  interestedUsers: [
    {
      id: "1",
      name: "Jordan Lee",
      devType: ["Full Stack", "ML Engineer"],
      blurb: "I've been working with TensorFlow and Python for 3+ years and would love to contribute to the ML model. Built similar code analysis tools before.",
    },
    {
      id: "2",
      name: "Sam Martinez",
      devType: ["Backend Dev"],
      blurb: "FastAPI expert here! I can help build the backend infrastructure and API design. Also have experience with code analysis tools.",
    },
  ],
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blurb, setBlurb] = useState("");

  const handleSubmitInterest = () => {
    if (!blurb.trim()) {
      toast.error("Please write a brief introduction");
      return;
    }
    toast.success("Interest submitted! The project owner will review your profile.");
    setBlurb("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="p-8 border-border bg-card shadow-card">
            <div className="flex items-start gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-glow">
                {mockProject.creator.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{mockProject.title}</h1>
                <p className="text-muted-foreground">by {mockProject.creator}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">About the Project</h2>
                <p className="text-muted-foreground">{mockProject.description}</p>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Tech Stack</h2>
                <div className="flex flex-wrap gap-2">
                  {mockProject.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-3">Looking For</h2>
                <div className="flex flex-wrap gap-2">
                  {mockProject.lookingFor.map((role) => (
                    <Badge key={role} className="bg-accent/20 text-accent border-accent/30">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-border text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Posted {mockProject.postedDate}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {mockProject.applicants} developers interested
                </span>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Your Interest
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Introduce Yourself</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Tell the project owner why you're interested and what you can bring to the team..."
                      className="min-h-32"
                      value={blurb}
                      onChange={(e) => setBlurb(e.target.value)}
                    />
                    <Button
                      onClick={handleSubmitInterest}
                      className="w-full bg-gradient-primary hover:opacity-90"
                    >
                      Submit Interest
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Interested Developers ({mockProject.interestedUsers.length})</h2>
            {mockProject.interestedUsers.map((user) => (
              <Card key={user.id} className="p-6 border-border bg-card">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h3 className="font-bold">{user.name}</h3>
                      <div className="flex gap-2 mt-1">
                        {user.devType.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.blurb}</p>
                    <Button variant="outline" size="sm">
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
