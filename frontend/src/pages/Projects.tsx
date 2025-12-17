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
import FeedProjectCard from "@/components/projects/FeedProjectCard";

// Options for checkboxes
const experienceOptions = ['Beginner', 'Intermediate', 'Advanced'];
const roleOptions = ['Front-End', 'Back-End', 'Full Stack', 'Designer', 'Idea Guy', 'Pitch Wizard'];
const timeCommitmentOptions = ['1-2 hrs/week', '3-4 hrs/week', '5-6 hrs/week', '7-8 hrs/week', '8+ hrs/week'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null); // track which project is applying
  const [appliedProjects, setAppliedProjects] = useState<Set<string>>(new Set());

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

  // Fetch projects with debounced search
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const hasFilters =
          searchQuery.trim() ||
          filterRoles.length > 0 ||
          filterExperience.length > 0 ||
          filterTime.length > 0;

        console.log('Fetching with filters:', {
          search: searchQuery,
          hasFilters,
          filterRoles,
          filterExperience,
          filterTime
        });

        const data = hasFilters
          ? await getFilteredProjects({
            search: searchQuery.trim() || undefined, // Pass undefined for empty strings
            role: filterRoles.length > 0 ? filterRoles : undefined,
            experience: filterExperience.length > 0 ? filterExperience : undefined,
            time_commitment: filterTime.length > 0 ? filterTime : undefined,
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

    // Debounce the search query to avoid too many API calls
    // Filter changes (not search) happen immediately
    if (searchQuery.trim()) {
      timeoutId = setTimeout(() => {
        fetchProjects();
      }, 500); // 500ms debounce for search
    } else {
      // No search query, fetch immediately (for filters)
      fetchProjects();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchQuery, filterRoles, filterExperience, filterTime]);

  const handleApply = async (projectId: string) => {
    setApplying(projectId);
    try {
      await applyToProjectBoard(projectId);
      toast.success("You've successfully applied to this project!");
      setAppliedProjects(prev => new Set(prev).add(projectId));
    } catch (err) {
      console.error("Failed to apply:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to apply";
      if (errorMessage.includes("No token") || errorMessage.includes("Unauthorized")) {
        toast.error("Please log in to apply for a project!");
      } else if (errorMessage.includes("already exists")) {
        toast.error("You've already applied to this project");
        setAppliedProjects(prev => new Set(prev).add(projectId)); // Mark as applied if already exists
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
        time_commitment: dialogTimeCommitment,
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

  // Filter toggle handlers for sidebar
  const toggleExperienceFilter = (level: string) => {
    setFilterExperience(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleRoleFilter = (role: string) => {
    setFilterRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleTimeFilter = (time: string) => {
    setFilterTime(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
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

              {/* Search - First */}
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
              {/* <div className="space-y-4">
                <Label className="text-sm font-semibold">Experience Level</Label>
                <div className="space-y-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={filterExperience.includes(level)}
                        onCheckedChange={() => toggleExperienceFilter(level)}
                      />
                      <label
                        htmlFor={level}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Roles */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold">Role</Label>
                <div className="space-y-3">
                  {['Front-End', 'Back-End', 'Full Stack', 'Designer', 'Idea Guy', 'Pitch Wizard'].map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={filterRoles.includes(role)}
                        onCheckedChange={() => toggleRoleFilter(role)}
                      />
                      <label
                        htmlFor={role}
                        className="text-sm font-medium leading-none cursor-pointer"
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
                  {timeCommitmentOptions.map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox
                        id={time}
                        checked={filterTime.includes(time)}
                        onCheckedChange={() => toggleTimeFilter(time)}
                      />
                      <label
                        htmlFor={time}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {time}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-6 min-w-0">
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
                  projects.map((project: any) => (
                    <FeedProjectCard
                      key={project.id}
                      project={project}
                      isApplying={applying === project.id}
                      hasApplied={appliedProjects.has(project.id)}
                      onApply={handleApply}
                    />
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
