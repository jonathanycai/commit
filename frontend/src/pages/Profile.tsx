import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/profile/MatchCard";
import RequestCard from "@/components/profile/RequestCard";
import ProjectCard from "@/components/profile/ProjectCard";
import MyProjectCard from "@/components/profile/MyProjectCard";
import PostProjectDialog from "@/components/projects/PostProjectDialog";
import homepageBg from "@/assets/homepage-bg.svg";
import { getReceivedRequests, getMyProjects, approveApplication, rejectApplication, deleteProject, getMatches, Match } from "@/lib/api";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Application {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  created_at: string;
  projects: {
    id: string;
    title: string;
    description?: string;
    tags?: string[];
    looking_for?: string[];
  };
  users: {
    id: string;
    username: string;
    email: string;
    role?: string;
    experience?: string;
    time_commitment?: string;
    socials?: {
      linkedin?: string;
      discord?: string;
    };
    tech_tags?: string[];
    project_links?: { name: string; link: string }[] | string[];
  };
}

interface Project {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  looking_for?: string[];
  time_commitment?: string;
}


const Profile = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [applicantIndices, setApplicantIndices] = useState<Record<string, number>>({});
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const { data: myProjectsData, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['myProjects'],
    queryFn: getMyProjects,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: requestsData, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['receivedRequests'],
    queryFn: getReceivedRequests,
    staleTime: 1000 * 60 * 5,
  });

  const { data: matchesData, isLoading: isLoadingMatches, error: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
    staleTime: 1000 * 60 * 5,
  });

  const projects = myProjectsData?.my_projects || [];
  const receivedRequests = requestsData?.received_requests || [];
  const matches = matchesData?.matches || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: approveApplication,
    onSuccess: () => {
      toast.success('Application approved!');
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: () => toast.error('Failed to approve application'),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectApplication,
    onSuccess: () => {
      toast.error('Application rejected');
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
    },
    onError: () => toast.error('Failed to reject application'),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['myProjects'] });
      queryClient.invalidateQueries({ queryKey: ['receivedRequests'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      setProjectToDelete(null);
    },
    onError: () => toast.error("Failed to delete project"),
  });

  // Group requests by project and create project-request pairs
  const projectsWithRequests = projects
    .map((project: Project) => {
      const requestsForProject = receivedRequests.filter((req: Application) => req.project_id === project.id);
      return { project, requests: requestsForProject };
    })
    .filter((pair: { requests: any[] }) => pair.requests.length > 0);

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    deleteProjectMutation.mutate(projectToDelete);
  };


  return (
    <div className="min-h-screen bg-background font-lexend">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${homepageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-6 font-lexend">
                <span
                  className="bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9D9CFF -16.21%, #FAFAFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {activeTab === "matches"
                    ? "you matched. now what?"
                    : activeTab === "requests"
                      ? "they saw your idea. now they want in."
                      : "your ideas. your vision."}
                </span>
              </h1>

              <div className="flex gap-6 text-sm font-medium border-b border-border overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("matches")}
                  className={`pb-3 transition-colors ${activeTab === "matches"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`pb-3 transition-colors ${activeTab === "projects"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  My Projects
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`pb-3 transition-colors ${activeTab === "requests"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Requests
                </button>
              </div>
            </div>

            {activeTab === "matches" && (
              <div className="mt-8 space-y-4">
                {isLoadingMatches ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-white/60">Loading matches...</div>
                  </div>
                ) : matchesError ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-red-400">Error: {matchesError instanceof Error ? matchesError.message : 'Failed to load matches'}</div>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-white/60">No matches yet. Start swiping to find your perfect project!</div>
                  </div>
                ) : (
                  matches.map((match: Match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                )}
              </div>
            )}

            {activeTab === "projects" && (
              <div className="mt-8 space-y-6">
                {isLoadingProjects ? (
                  <div className="text-white/60">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-white/60">You haven't created any projects yet.</div>
                ) : (
                  projects.map((project) => (
                    <MyProjectCard
                      key={project.id}
                      project={project}
                      onDelete={(id) => setProjectToDelete(id)}
                      onEdit={(project) => {
                        setProjectToEdit(project);
                        setIsEditDialogOpen(true);
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="mt-8 space-y-8">
                {isLoadingProjects || isLoadingRequests ? (
                  <div className="text-white/60">Loading...</div>
                ) : projectsWithRequests.length === 0 ? (
                  <div className="text-white/60">No projects with requests yet.</div>
                ) : (
                  projectsWithRequests.map((pair, projectIdx) => {
                    const currentIndex = applicantIndices[pair.project.id] || 0;
                    const currentApplicant = pair.requests[currentIndex] || pair.requests[0];

                    const handlePrevious = () => {
                      setApplicantIndices(prev => ({
                        ...prev,
                        [pair.project.id]: currentIndex > 0 ? currentIndex - 1 : pair.requests.length - 1
                      }));
                    };

                    const handleNext = () => {
                      setApplicantIndices(prev => ({
                        ...prev,
                        [pair.project.id]: currentIndex < pair.requests.length - 1 ? currentIndex + 1 : 0
                      }));
                    };

                    const handleApprove = async () => {
                      if (!currentApplicant) return;
                      approveMutation.mutate(currentApplicant.id);
                    };

                    const handleDecline = async () => {
                      if (!currentApplicant) return;
                      rejectMutation.mutate(currentApplicant.id);
                    };

                    return (
                      <div key={pair.project.id} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Project Card */}
                        <ProjectCard project={pair.project} />

                        {/* Right: Requests Card for This Project */}
                        <RequestCard
                          applicant={currentApplicant?.users}
                          onApprove={handleApprove}
                          onReject={handleDecline}
                          onNext={handleNext}
                          onPrevious={handlePrevious}
                          showNavigation={pair.requests.length > 1}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent className="bg-[#111118] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete your project
              and remove all associated matches and applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PostProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={projectToEdit}
        onProjectCreated={() => queryClient.invalidateQueries({ queryKey: ['myProjects'] })}
      />
    </div>
  );
};

export default Profile;
