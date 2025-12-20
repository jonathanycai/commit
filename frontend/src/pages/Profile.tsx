import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import MatchCard from "@/components/profile/MatchCard";
import RequestCard from "@/components/profile/RequestCard";
import ProjectCard from "@/components/profile/ProjectCard";
import MyProjectCard from "@/components/profile/MyProjectCard";
import homepageBg from "@/assets/homepage-bg.svg";
import { getReceivedRequests, getMyProjects, approveApplication, rejectApplication, deleteProject, getMatches, Match } from "@/lib/api";
import { toast } from "sonner";
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
  };
}

interface Project {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  looking_for?: string[];
}


const Profile = () => {
  const [activeTab, setActiveTab] = useState("matches");
  const [projects, setProjects] = useState<Project[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<Application[]>([]);
  const [applicantIndices, setApplicantIndices] = useState<Record<string, number>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  // Fetch user's projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoadingProjects(true);
        const response = await getMyProjects();
        setProjects(response.my_projects || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load your projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch received requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setIsLoadingRequests(true);
        const response = await getReceivedRequests();
        // console.log('Received requests response:', response);
        // console.log('received_requests array:', response.received_requests);
        // console.log('Number of requests:', response.received_requests?.length);
        setReceivedRequests(response.received_requests || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast.error('Failed to load requests');
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchRequests();
  }, []);

  // Group requests by project and create project-request pairs
  const projectsWithRequests = projects
    .map(project => {
      const requestsForProject = receivedRequests.filter(req => req.project_id === project.id);
      return { project, requests: requestsForProject };
    })
    .filter(pair => pair.requests.length > 0); // Only show projects with requests

  // Function to fetch matches
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await getMatches();
      setMatches(response.matches || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching matches:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches when component mounts
  useEffect(() => {
    fetchMatches();
  }, []);

  // Fetch matches when matches tab is clicked
  useEffect(() => {
    if (activeTab === "matches") {
      fetchMatches();
    }
  }, [activeTab]);

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This will also delete all associated matches and applications.")) {
      return;
    }

    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      // Update local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      // Also refresh matches and requests since they might be affected
      fetchMatches();
      const requestsResponse = await getReceivedRequests();
      setReceivedRequests(requestsResponse.received_requests || []);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
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

              <div className="flex gap-6 text-sm font-medium border-b border-border">
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
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-white/60">Loading matches...</div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-red-400">Error: {error}</div>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-white/60">No matches yet. Start swiping to find your perfect project!</div>
                  </div>
                ) : (
                  matches.map((match) => (
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
                      onDelete={handleDeleteProject}
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
                      try {
                        await approveApplication(currentApplicant.id);
                        toast.success('Application approved!');
                        const updatedRequests = receivedRequests.filter(app => app.id !== currentApplicant.id);
                        setReceivedRequests(updatedRequests);
                      } catch (error) {
                        console.error('Error approving application:', error);
                        toast.error('Failed to approve application');
                      }
                    };

                    const handleDecline = async () => {
                      if (!currentApplicant) return;
                      try {
                        await rejectApplication(currentApplicant.id);
                        toast.error('Application rejected');
                        const updatedRequests = receivedRequests.filter(app => app.id !== currentApplicant.id);
                        setReceivedRequests(updatedRequests);
                      } catch (error) {
                        console.error('Error rejecting application:', error);
                        toast.error('Failed to reject application');
                      }
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
    </div>
  );
};

export default Profile;
