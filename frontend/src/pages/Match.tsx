import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import SwipeCard from "@/components/match/SwipeCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotHappy from "@/assets/mascot-happy-new.svg";
import mascotSad from "@/assets/mascot-sad.svg";
import { getNextProject, recordProjectSwipe, applyToProject } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: string;
  title: string;
  creator: string;
  roles: string[];
  timestamp: string;
  description: string;
}
const Match = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const userId = user?.id;

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${diffInSeconds >= 7200 ? 's' : ''} ago`;
      return `${Math.floor(diffInSeconds / 86400)} day${diffInSeconds >= 172800 ? 's' : ''} ago`;
    } catch {
      return "Recently";
    }
  };

  // Fetch next project
  const { data: projectData, isLoading, refetch } = useQuery({
    queryKey: ['nextProject'],
    queryFn: async () => {
      if (!userId) throw new Error("User not logged in");
      const project = await getNextProject(userId);

      if (project.message || !project.id) {
        return null;
      }

      return {
        id: project.id,
        title: project.title || 'Untitled Project',
        creator: project.users?.username || project.users?.email || 'Unknown Creator',
        roles: [
          ...(project.looking_for || []),
          ...(project.tags || []).slice(0, 2)
        ],
        timestamp: formatTimestamp(project.created_at),
        description: project.description || 'No description available.',
      } as Project;
    },
    enabled: !!userId,
    staleTime: Infinity, // Keep the current card until we explicitly invalidate
  });

  // Mutations
  const swipeMutation = useMutation({
    mutationFn: async ({ userId, projectId, direction }: { userId: string, projectId: string, direction: 'like' | 'pass' }) => {
      return recordProjectSwipe(userId, projectId, direction);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nextProject'] });
    },
    onError: () => {
      toast.error("Failed to record swipe");
    }
  });

  const applyMutation = useMutation({
    mutationFn: async (projectId: string) => {
      return applyToProject(projectId);
    },
    onSuccess: () => {
      toast.success("Application sent!");
      // We don't invalidate here because swipeMutation will do it, or we do it manually if we want to be safe
      queryClient.invalidateQueries({ queryKey: ['nextProject'] });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to apply";
      if (errorMessage.includes("already exists")) {
        toast.error("You've already applied to this project");
        queryClient.invalidateQueries({ queryKey: ['nextProject'] });
      } else {
        toast.error(errorMessage);
      }
    }
  });

  const currentProject = projectData || null;

  const handleSwipeLeft = useCallback(async () => {
    if (!currentProject || isProcessing || !userId) return;

    const projectId = currentProject.id;

    try {
      setIsProcessing(true);
      // Record swipe as "pass" (do nothing else)
      await swipeMutation.mutateAsync({ userId, projectId, direction: 'pass' });
      toast.info("Passed");
    } catch (error) {
      console.error("Error recording swipe:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentProject, isProcessing, userId, swipeMutation]);

  const handleSwipeRight = useCallback(async () => {
    if (!currentProject || isProcessing || !userId) return;

    const projectId = currentProject.id;

    try {
      setIsProcessing(true);

      // Create an application request (this also records a "like" swipe on the backend)
      await applyMutation.mutateAsync(projectId);
      toast.success("Down to commit! 🎉");

    } catch (error) {
      console.error("Error applying:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentProject, isProcessing, userId, applyMutation]);
  return (
    <div className="min-h-screen bg-background font-lexend overflow-hidden">
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

        <div className="container mx-auto px-4 pt-24 md:pt-40 pb-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-0 lg:gap-8">
            {/* Mobile Title */}
            <h2
              className="lg:hidden text-2xl font-bold text-center leading-tight bg-gradient-hero bg-clip-text mb-6"
              style={{
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              say yes to the ones that matter.
            </h2>

            {/* Single Card Display */}
            <div className="w-full max-w-[550px] flex-shrink-0 relative">
              {/* Card Stack Effect */}
              {!isLoading && currentProject && (
                <>
                  <div
                    className="hidden lg:block absolute top-0 left-0 w-full h-full rounded-[32px] border border-[#79B1DF]/5"
                    style={{
                      transform: 'translate(-16px, -16px)',
                      zIndex: 0,
                      background: 'linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%)',
                    }}
                  />
                  <div
                    className="hidden lg:block absolute top-0 left-0 w-full h-full rounded-[32px] border border-[#79B1DF]/10"
                    style={{
                      transform: 'translate(-32px, -32px)',
                      zIndex: -1,
                      background: 'linear-gradient(26.82deg, rgba(103, 137, 236, 0.1) 64.12%, rgba(103, 137, 236, 0.2) 89.86%);',
                    }}
                  />

                </>
              )}

              <div className="relative z-10 h-full">
                {isLoading ? (
                  <div
                    className="rounded-[32px] p-[3px]"
                    style={{
                      background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
                    }}
                  >
                    <div
                      className="rounded-[32px] p-8 h-[600px] flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(46, 52, 88, 0.7)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="text-center space-y-4">
                        <h3 className="text-3xl font-bold text-white">Loading...</h3>
                        <p className="text-white/60">Finding projects for you</p>
                      </div>
                    </div>
                  </div>
                ) : currentProject ? (
                  <SwipeCard
                    project={currentProject}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    isInteractive={!isProcessing}
                  />
                ) : (
                  <div
                    className="rounded-[32px] p-[3px]"
                    style={{
                      background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
                    }}
                  >
                    <div
                      className="rounded-[32px] p-8 h-[600px] flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(46, 52, 88, 0.7)',
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <div className="text-center space-y-4">
                        <h3 className="text-3xl font-bold text-white">No projects left</h3>
                        <p className="text-white/60">Check back later for more projects!</p>
                        <Button
                          onClick={() => refetch()}
                          className="mt-4 rounded-xl"
                          style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Mascots and Buttons */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 lg:space-y-12 max-w-none pt-0 lg:pt-16">
              <h2
                className="hidden lg:block text-2xl lg:text-3xl font-bold text-center leading-tight bg-gradient-hero bg-clip-text"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                say yes to the ones that matter.
              </h2>

              <div className="flex items-end justify-center gap-4 md:gap-12 w-full">
                {/* Left Mascot with Button */}
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={mascotHappy}
                    alt=""
                    className="hidden lg:block animate-float w-[150px] md:w-[235px]"
                    style={{
                      animation: 'float 3s ease-in-out infinite',
                      maxWidth: 'none'
                    }}
                  />
                  <Button
                    onClick={handleSwipeRight}
                    disabled={isProcessing || !currentProject}
                    className="h-12 px-6 rounded-xl font-medium"
                    style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                  >
                    {isProcessing ? 'Processing...' : '✓ Down to commit'}
                  </Button>
                </div>

                <span className="hidden lg:block text-2xl md:text-4xl font-bold text-foreground self-center">OR</span>

                {/* Right Mascot with Button */}
                <div className="flex flex-col items-center gap-4">
                  <img
                    src={mascotSad}
                    alt=""
                    className="hidden lg:block w-[130px] md:w-[200px] animate-float ml-6 md:ml-10"
                    style={{ animation: 'float 3s ease-in-out infinite 0.5s' }}
                  />
                  <Button
                    onClick={handleSwipeLeft}
                    disabled={isProcessing || !currentProject}
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-medium border-2"
                    style={{ borderColor: '#5B7FFF', color: '#5B7FFF' }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Processing...' : 'Not my thing'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Match;
