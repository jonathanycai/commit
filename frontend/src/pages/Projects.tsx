import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import homepageBg from "@/assets/homepage-bg.svg";
import { toast } from "sonner";
import { getAllProjects, getFilteredProjects, applyToProjectBoard, createProject } from "@/lib/api";

// Options for checkboxes
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const roleOptions = ['Front-End', 'Back-End', 'Full Stack', 'Designer', 'Idea Guy', 'Pitch Wizard'];
const timeCommitmentOptions = ['1-2 hrs/week', '3-4 hrs/week', '5-6 hrs/week', '7-8 hrs/week', '8+ hrs/week'];

// Mock data
const mockProjects = [
  {
    id: "1",
    title: "Title of Project",
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.",
    creator: "Kashish Garg",
    roles: ["Designer", "Idea Guy", "Front-End"],
  },
  {
    id: "2",
    title: "Title of Project",
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.",
    creator: "Kashish Garg",
    roles: ["Designer", "Idea Guy", "Front-End"],
  },
  {
    id: "3",
    title: "Title of Project",
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.",
    creator: "Kashish Garg",
    roles: ["Designer", "Idea Guy", "Front-End"],
  },
];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null); // track which project is applying

  // Filters + search (for sidebar - multi-select)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterExperience, setFilterExperience] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<string[]>([]);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  
  // State for dialog checkboxes (single select for exp/time, multi for roles)
  const [dialogExperience, setDialogExperience] = useState<string>("");
  const [dialogRoles, setDialogRoles] = useState<string[]>([]);
  const [dialogTimeCommitment, setDialogTimeCommitment] = useState<string>("");

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const hasFilters =
          searchQuery.trim() ||
          filterRoles.length > 0 ||
          filterExperience.length > 0 ||
          filterTime.length > 0;

        const data = hasFilters
          ? await getFilteredProjects({
            search: searchQuery,
            role: filterRoles,
            experience: filterExperience,
            time_commitment: filterTime,
          })
          : await getAllProjects();

        setProjects(data.projects || []);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [searchQuery, filterRoles, filterExperience, filterTime]);

  const handleApply = async (projectId: string) => {
    setApplying(projectId);
    try {
      await applyToProjectBoard(projectId);
      toast.success("You've successfully applied to this project!");
    } catch (err) {
      console.error("Failed to apply:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to apply";
      if (errorMessage.includes("No token") || errorMessage.includes("Unauthorized")) {
        toast.error("Please log in to apply for a project!");
      } else if (errorMessage.includes("already exists")) {
        toast.error("You've already applied to this project");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setApplying(null);
    }
  };

  // Submit handler for creating project
  const handleSubmit = async () => {
    if (!projectTitle || !projectDescription) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const projectData = {
        title: projectTitle,
        description: projectDescription,
        tags: [],
        looking_for: dialogRoles,
      };

      await createProject(projectData);
      toast.success("Project posted successfully!");
      setIsDialogOpen(false);
      setProjectTitle("");
      setProjectDescription("");
      setDialogExperience("");
      setDialogRoles([]);
      setDialogTimeCommitment("");
      
      // Refresh projects list
      const response = await getAllProjects();
      setProjects(response.projects || []);
    } catch (err) {
      console.error("Error creating project:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create project";
      if (errorMessage.includes("No token") || errorMessage.includes("Unauthorized")) {
        toast.error("Please log in to create a project");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const toggleExperience = (level: string) => {
    setDialogExperience(prev => prev === level ? "" : level);
  };

  const toggleRole = (role: string) => {
    setDialogRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleTimeCommitment = (time: string) => {
    setDialogTimeCommitment(prev => prev === time ? "" : time);
  };

  return (
    <div className="min-h-screen bg-background font-lexend">
      {/* background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${homepageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-6 pt-32 pb-12">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-80 space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ whiteSpace: "nowrap" }}>
                  your next commit
                </h1>
                <h2
                  className="text-3xl font-bold bg-gradient-hero bg-clip-text"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  starts here.
                </h2>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Search by Project Name</Label>
                <Input
                  placeholder="Project name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background/50 border-border rounded-xl"
                />
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Experience Level</Label>
                <div className="space-y-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox id={level} />
                      <label
                        htmlFor={level}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Role</Label>
                <div className="space-y-3">
                  {['Front-End', 'Back-End', 'Full Stack', 'Designer', 'Idea Guy', 'Pitch Wizard'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox id={role} />
                      <label
                        htmlFor={role}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Time Commitment</Label>
                <div className="space-y-3">
                  {['1-2 hrs/week', '3-4 hrs/week', '5-6 hrs/week'].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox id={time} />
                      <label
                        htmlFor={time}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {projects.length || 0} results
                </p>
                <Button
                  size="lg"
                  className="rounded-xl"
                  style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
                  onClick={() => setIsDialogOpen(true)}
                >
                  + Post your project
                </Button>
              </div>

              <div className="space-y-6">
                {loading ? (
                  <p className="text-muted-foreground">Loading projects...</p>
                ) : projects.length > 0 ? (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-3xl p-[2px]"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(157, 156, 255, 0.6), rgba(166, 244, 197, 0.6))",
                      }}
                    >
                      <div
                        className="rounded-3xl p-8"
                        style={{ backgroundColor: "#1E2139" }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-2xl font-bold">{project.title}</h3>
                          <Button
                            size="sm"
                            disabled={applying === project.id}
                            onClick={() => handleApply(project.id)}
                            className="rounded-xl"
                            style={{
                              backgroundColor: "#A6F4C5",
                              color: "#111118",
                              opacity: applying === project.id ? 0.7 : 1,
                            }}
                          >
                            {applying === project.id ? "Applying..." : "✓ Down to commit!"}
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
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No projects found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Project Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="max-w-4xl p-0 gap-0 border-2 font-lexend backdrop-blur-xl"
          style={{ 
            backgroundColor: 'rgba(30, 33, 57, 0.4)',
            borderColor: '#6789EC'
          }}
        >
          <div className="p-8 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold">
                This is a project kick!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Project Name
                </Label>
                <Input
                  id="title"
                  placeholder="Project name"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-background/50 border-border rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Experience Level</Label>
                <div className="flex flex-wrap gap-3">
                  {experienceOptions.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`dialog-exp-${level}`} 
                        checked={dialogExperience === level} 
                        onCheckedChange={() => toggleExperience(level)}
                      />
                      <label
                        htmlFor={`dialog-exp-${level}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Role</Label>
                <div className="flex flex-wrap gap-3">
                  {roleOptions.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`dialog-role-${role}`} 
                        checked={dialogRoles.includes(role)} 
                        onCheckedChange={() => toggleRole(role)}
                      />
                      <label
                        htmlFor={`dialog-role-${role}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Time Commitment</Label>
                <div className="flex flex-wrap gap-3">
                  {timeCommitmentOptions.map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`dialog-time-${time}`} 
                        checked={dialogTimeCommitment === time} 
                        onCheckedChange={() => toggleTimeCommitment(time)}
                      />
                      <label
                        htmlFor={`dialog-time-${time}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description of the project you want to build!
                </Label>
                <Textarea
                  id="description"
                  placeholder="This is a project that..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="bg-background/50 border-border rounded-xl min-h-[150px] resize-none"
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full h-14 text-base font-medium rounded-xl"
                style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
              >
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
