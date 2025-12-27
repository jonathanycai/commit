import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import homepageBg from "@/assets/homepage-bg.svg";
import { toast } from "sonner";
import { getAllProjects, getFilteredProjects, applyToProjectBoard } from "@/lib/api";
import FeedProjectCard from "@/components/projects/FeedProjectCard";
import PostProjectDialog from "@/components/projects/PostProjectDialog";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

// Options for checkboxes
const timeCommitmentOptions = ['1-2 hrs/week', '3-4 hrs/week', '5-6 hrs/week', '7-8 hrs/week', '8+ hrs/week'];

interface Project {
  id: string;
  title: string;
  description: string;
  users?: {
    username: string;
  };
  looking_for?: string[];
  tags?: string[];
  time_commitment?: string;
}

const Projects = () => {
  // State for UI interactions
  const [applying, setApplying] = useState<string | null>(null);
  const [appliedProjects, setAppliedProjects] = useState<Set<string>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterExperience, setFilterExperience] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterRoles, filterExperience, filterTime]);

  // React Query Implementation
  const {
    data,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['projects', {
      search: debouncedSearch,
      role: filterRoles,
      experience: filterExperience,
      time: filterTime,
      page: currentPage,
      limit: itemsPerPage
    }],
    queryFn: async () => {
      const hasFilters =
        debouncedSearch.trim() ||
        filterRoles.length > 0 ||
        filterExperience.length > 0 ||
        filterTime.length > 0;

      console.log('Fetching with filters:', {
        search: debouncedSearch,
        hasFilters,
        filterRoles,
        filterExperience,
        filterTime,
        page: currentPage,
        limit: itemsPerPage
      });

      if (hasFilters) {
        return getFilteredProjects({
          search: debouncedSearch.trim() || undefined,
          role: filterRoles.length > 0 ? filterRoles : undefined,
          experience: filterExperience.length > 0 ? filterExperience : undefined,
          time_commitment: filterTime.length > 0 ? filterTime : undefined,
          page: currentPage,
          limit: itemsPerPage,
        });
      } else {
        return getAllProjects(currentPage, itemsPerPage);
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const projects = data?.projects || [];
  const pagination = data?.pagination || null;

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
            <div className="flex-1 space-y-14 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">
                  {pagination ? (
                    <>
                      Showing {projects.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                      {(currentPage - 1) * itemsPerPage + projects.length} of {pagination.total} results
                    </>
                  ) : (
                    `Showing ${projects.length || 0} results`
                  )}
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
                {isLoading ? (
                  <p className="text-muted-foreground">Loading projects...</p>
                ) : isError ? (
                  <p className="text-red-500">Failed to load projects.</p>
                ) : projects.length > 0 ? (
                  projects.map((project: Project) => (
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

              {/* Pagination Controls */}
              {pagination && (
                <div className="space-y-4">
                  {/* Large Next/Previous Buttons */}
                  <div className="flex items-center justify-between gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        if (pagination.hasPreviousPage) {
                          setCurrentPage((prev) => Math.max(1, prev - 1));
                        }
                      }}
                      disabled={!pagination.hasPreviousPage || isLoading}
                      className="rounded-xl flex items-center gap-2"
                    >
                      <span>←</span>
                      <span>Previous</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        if (pagination.hasNextPage) {
                          setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1));
                        }
                      }}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="rounded-xl flex items-center gap-2"
                    >
                      <span>Next</span>
                      <span>→</span>
                    </Button>
                  </div>

                  {/* Page indicator below buttons */}
                  <div className="flex justify-center">
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Project Dialog */}
      <PostProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Projects;
