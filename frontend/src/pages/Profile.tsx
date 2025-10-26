import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Check, X, Mail, Linkedin, ExternalLink } from "lucide-react";
import MatchCard from "@/components/profile/MatchCard";
import { getMatches, Match } from "@/lib/api";
import homepageBg from "@/assets/homepage-bg.svg";
import { getReceivedRequests, getMyProjects, approveApplication, rejectApplication } from "@/lib/api";
import { toast } from "sonner";

// Mock data for matches
const mockMatches = [
  {
    id: "1",
    title: "BudgetBuddies",
    creator: "Angela Cheng",
    roles: ["Designer", "Intermediate", "1-2 hrs/week"],
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. ......",
    contact: {
      email: "angelacheng123@gmail.com",
      discord: "@angelacheng",
      linkedin: "Angela Cheng"
    }
  },
  {
    id: "2",
    title: "SuperCool",
    creator: "Kashish Garg",
    roles: ["Designer", "Intermediate", "1-2 hrs/week"],
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. ......",
    contact: {
      email: "kashishgarg123@gmail.com",
      discord: "@kashishgarg",
      linkedin: "Kashish Garg"
    }
  },
  {
    id: "3",
    title: "HackMaster",
    creator: "Kashish Garg",
    roles: ["Designer", "Intermediate", "1-2 hrs/week"],
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. ......",
    contact: {
      email: "kashishgarg123@gmail.com",
      discord: "@kashishgarg",
      linkedin: "Kashish Garg"
    }
  }
];

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
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
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
        console.log('Received requests response:', response);
        console.log('received_requests array:', response.received_requests);
        console.log('Number of requests:', response.received_requests?.length);
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

  // Get current request and project details
  const currentRequest = receivedRequests[currentRequestIndex];
  const currentProject = currentRequest ? projects.find(p => p.id === currentRequest.project_id) : projects[0];
  
  console.log('Current request index:', currentRequestIndex, 'Total requests:', receivedRequests.length);
  console.log('Current request:', currentRequest);

  // Fetch matches when component mounts
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await getMatches();
        setMatches(response.matches || []);
        setError(null);
      } catch (err: unknown) {
        console.error('Error fetching matches:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch matches');
        // Fallback to mock data if API fails
        setMatches(mockMatches.map(match => ({
          id: match.id,
          type: 'successful' as const,
          project: {
            id: match.id,
            title: match.title,
            description: match.description,
            tags: match.roles,
            looking_for: match.roles
          },
          user: {
            id: match.id,
            username: match.creator,
            email: match.contact.email,
            socials: {
              discord: match.contact.discord,
              linkedin: match.contact.linkedin
            }
          },
          created_at: new Date().toISOString()
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handlePrevious = () => {
    setCurrentRequestIndex((prev) => (prev > 0 ? prev - 1 : receivedRequests.length - 1));
  };

  const handleNext = () => {
    setCurrentRequestIndex((prev) => (prev < receivedRequests.length - 1 ? prev + 1 : 0));
  };

  const handleApprove = async () => {
    console.log('handleApprove called, currentRequest:', currentRequest);
    if (!currentRequest) {
      console.log('No current request, returning');
      return;
    }
    try {
      console.log('Approving application:', currentRequest.id);
      await approveApplication(currentRequest.id);
      toast.success('Application approved!');
      // Remove from list and move to next
      setReceivedRequests(prev => prev.filter((_, idx) => idx !== currentRequestIndex));
      if (currentRequestIndex >= receivedRequests.length - 1 && currentRequestIndex > 0) {
        setCurrentRequestIndex(currentRequestIndex - 1);
      }
    } catch (error) {
      console.error('Error approving application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve application';
      toast.error(errorMessage);
    }
  };

  const handleDecline = async () => {
    console.log('handleDecline called, currentRequest:', currentRequest);
    if (!currentRequest) {
      console.log('No current request, returning');
      return;
    }
    try {
      console.log('Rejecting application:', currentRequest.id);
      await rejectApplication(currentRequest.id);
      toast.error('Application rejected');
      // Remove from list and move to next
      setReceivedRequests(prev => prev.filter((_, idx) => idx !== currentRequestIndex));
      if (currentRequestIndex >= receivedRequests.length - 1 && currentRequestIndex > 0) {
        setCurrentRequestIndex(currentRequestIndex - 1);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject application';
      toast.error(errorMessage);
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
                  {activeTab === "matches" ? "you matched. now what?" : "they saw your idea. now they want in."}
                </span>
              </h1>

              <div className="flex gap-6 text-sm font-medium border-b border-border">
                <button
                  onClick={() => setActiveTab("matches")}
                  className={`pb-3 transition-colors ${
                    activeTab === "matches" 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Matches
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`pb-3 transition-colors ${
                    activeTab === "requests" 
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

            {activeTab === "requests" && (
              <div className="mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: User's Project */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Your Project</h3>
                    <div 
                      className="rounded-2xl p-[2px]"
                      style={{ 
                        background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
                      }}
                    >
                      <div 
                        className="rounded-2xl p-6"
                        style={{ 
                          backgroundColor: 'rgba(20, 22, 35, 0.95)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <div className="space-y-3">
                          <h2 className="text-2xl font-bold text-white">{currentProject?.title}</h2>
                          <div className="flex flex-wrap gap-2">
                            {currentProject?.tags?.map((tag, idx) => (
                              <span 
                                key={idx}
                                className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                style={{ 
                                  backgroundColor: '#79B1DF',
                                  color: '#111118'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div 
                            className="aspect-video rounded-xl"
                            style={{ 
                              background: 'linear-gradient(180deg, #A6F4C5 0%, #79B1DF 100%)'
                            }}
                          />

                          <p className="text-sm text-white/90 leading-relaxed">
                            {currentProject?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Interested People Carousel */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Ready to commit with you</h3>
                    <div className="relative">
                      <div 
                        className="rounded-2xl p-[2px]"
                        style={{ 
                          background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
                        }}
                      >
                        <div 
                          className="rounded-2xl p-6"
                          style={{ 
                            backgroundColor: 'rgba(20, 22, 35, 0.95)',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-bold text-white">{currentRequest?.users?.username || ''}</h3>
                              <div className="flex flex-wrap gap-2">
                                {currentRequest?.users?.role && (
                                  <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{ 
                                      backgroundColor: '#5B7FFF',
                                      color: '#111118'
                                    }}
                                  >
                                    {currentRequest.users.role}
                                  </span>
                                )}
                                {currentRequest?.users?.experience && (
                                  <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{ 
                                      backgroundColor: '#A6F4C5',
                                      color: '#111118'
                                    }}
                                  >
                                    {currentRequest.users.experience}
                                  </span>
                                )}
                                {currentRequest?.users?.time_commitment && (
                                  <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{ 
                                      backgroundColor: '#79B1DF',
                                      color: '#111118'
                                    }}
                                  >
                                    {currentRequest.users.time_commitment}
                                  </span>
                                )}
                                {currentRequest?.users?.tech_tags?.map((tag, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-medium"
                                    style={{ 
                                      backgroundColor: '#79B1DF',
                                      color: '#111118'
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {currentRequest?.users?.tech_tags && currentRequest.users.tech_tags.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-white mb-2">Tech Stack</h4>
                                <div className="flex flex-wrap gap-2">
                                  {currentRequest.users.tech_tags.map((tag, idx) => (
                                    <span key={idx} className="text-xs text-white/80">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2">Socials</h4>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-white">
                                  <div className="h-7 w-7 rounded-full" style={{ backgroundColor: '#0A66C2' }}>
                                    <Linkedin className="h-7 w-7 p-1.5" />
                                  </div>
                                  <span className="text-xs">{currentRequest?.users?.socials?.linkedin || ''}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white">
                                  <div className="h-7 w-7 rounded-full" style={{ backgroundColor: '#5865F2' }}>
                                    <svg viewBox="0 0 24 24" className="h-7 w-7 p-1.5" fill="white">
                                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs">{currentRequest?.users?.socials?.discord || ''}</span>
                                </div>
                              </div>
                            </div>

                            {/* Pagination dots */}
                            <div className="flex justify-center gap-2 py-2">
                              {receivedRequests.map((_, idx) => (
                                <div 
                                  key={idx}
                                  className="w-2 h-2 rounded-full transition-colors"
                                  style={{ 
                                    backgroundColor: idx === currentRequestIndex ? '#5B7FFF' : 'rgba(255, 255, 255, 0.3)' 
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Arrows */}
                      <button 
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#5B7FFF' }}
                      >
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                      <button 
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#5B7FFF' }}
                      >
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <Button 
                        onClick={handleApprove}
                        className="flex-1 h-11 rounded-xl font-medium text-sm"
                        style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Build together
                      </Button>
                      <Button 
                        onClick={handleDecline}
                        variant="outline"
                        className="flex-1 h-11 rounded-xl font-medium border-2 text-sm"
                        style={{ borderColor: '#5B7FFF', color: '#5B7FFF' }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Not this time
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
