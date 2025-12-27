import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { toast } from "sonner";

const CreateProject = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  const handleAddTech = () => {
    if (techInput.trim() && !technologies.includes(techInput.trim())) {
      setTechnologies([...technologies, techInput.trim()]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !lookingFor.includes(roleInput.trim())) {
      setLookingFor([...lookingFor, roleInput.trim()]);
      setRoleInput("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setLookingFor(lookingFor.filter((r) => r !== role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || technologies.length === 0 || lookingFor.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success("Project posted successfully!");
    navigate("/projects");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold">Post a Project</h1>
            <p className="text-muted-foreground">
              Share your project idea and find collaborators who want to build with you.
            </p>
          </div>

          <Card className="p-8 border-border bg-card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your project name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, its goals, and what you're trying to build..."
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technologies">Tech Stack *</Label>
                <div className="flex gap-2">
                  <Input
                    id="technologies"
                    placeholder="Add a technology (e.g., React, Python)"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                  />
                  <Button type="button" onClick={handleAddTech}>
                    Add
                  </Button>
                </div>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {technologies.map((tech) => (
                      <Badge key={tech} variant="secondary" className="pl-3 pr-2">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roles">Looking For *</Label>
                <div className="flex gap-2">
                  <Input
                    id="roles"
                    placeholder="Add a role (e.g., Frontend Dev, Designer)"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRole())}
                  />
                  <Button type="button" onClick={handleAddRole}>
                    Add
                  </Button>
                </div>
                {lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {lookingFor.map((role) => (
                      <Badge key={role} className="pl-3 pr-2 bg-accent/20 text-accent border-accent/30">
                        {role}
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(role)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  Post Project
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
