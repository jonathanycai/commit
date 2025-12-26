import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import homepageBg from "@/assets/homepage-bg.svg";
import { toast } from "sonner";
import { getAllProjects, getFilteredProjects, applyToProjectBoard } from "@/lib/api";
import FeedProjectCard from "@/components/projects/FeedProjectCard";
import PostProjectDialog from "@/components/projects/PostProjectDialog";

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

interface FilterContentProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterRoles: string[];
  toggleRoleFilter: (role: string) => void;
  filterTime: string[];
  toggleTimeFilter: (time: string) => void;
}

const FilterContent = ({
  searchQuery,
  setSearchQuery,
  filterRoles,
  toggleRoleFilter,
  filterTime,
  toggleTimeFilter,
}: FilterContentProps) => (
  <div className="space-y-8">
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
);

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null); // track which project is applying
  const [appliedProjects, setAppliedProjects] = useState<Set<string>>(new Set());

  // Filters + search (for sidebar - multi-select)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoles, setFilterRoles] = useState<string[]>([]);
  const [filterExperience, setFilterExperience] = useState<string[]>([]);
  const [filterTime, setFilterTime] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null>(null);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRoles, filterExperience, filterTime]);

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
          filterTime,
          page: currentPage,
          limit: itemsPerPage
        });

        const data = hasFilters
          ? await getFilteredProjects({
            search: searchQuery.trim() || undefined, // Pass undefined for empty strings
            role: filterRoles.length > 0 ? filterRoles : undefined,
            experience: filterExperience.length > 0 ? filterExperience : undefined,
            time_commitment: filterTime.length > 0 ? filterTime : undefined,
            page: currentPage,
            limit: itemsPerPage,
          })
          : await getAllProjects(currentPage, itemsPerPage);

        setProjects(data.projects || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
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
  }, [searchQuery, filterRoles, filterExperience, filterTime, currentPage, itemsPerPage]);

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

        <div className="container mx-auto px-6 pt-24 md:pt-32 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Button */}
            <div className="lg:hidden w-full">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 h-12 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                    <Filter className="h-4 w-4" />
                    Filters & Search
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto bg-background border-r border-border">
                  <div className="py-6">
                    <FilterContent
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filterRoles={filterRoles}
                      toggleRoleFilter={toggleRoleFilter}
                      filterTime={filterTime}
                      toggleTimeFilter={toggleTimeFilter}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Sidebar Filters */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <FilterContent
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterRoles={filterRoles}
                toggleRoleFilter={toggleRoleFilter}
                filterTime={filterTime}
                toggleTimeFilter={toggleTimeFilter}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 space-y-8 lg:space-y-14 min-w-0">
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
                {loading ? (
                  <p className="text-muted-foreground">Loading projects...</p>
                ) : projects.length > 0 ? (
                  projects.map((project) => (
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
                      disabled={!pagination.hasPreviousPage}
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
                      disabled={!pagination.hasNextPage}
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
