import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import SwipeCard from "@/components/match/SwipeCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotHappy from "@/assets/mascot-happy-new.svg";
import mascotSad from "@/assets/mascot-sad.svg";
import { getNextProject, recordProjectSwipe, applyToProject } from "@/lib/api";

interface Project {
  id: string;
  title: string;
  creator: string;
  roles: string[];
  timestamp: string;
  description: string;
}

const Match = () => {
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  // TODO: Get actual user ID from auth context
  const userId = localStorage.getItem('user_id') || '550e8400-e29b-41d4-a716-446655440000';

  const currentProject = currentProjects[currentIndex];

  // Fetch initial project when component mounts
  useEffect(() => {
    // Check if user is logged in
    if (!userId) {
      toast.error("Please log in to view projects");
      return;
    }
    fetchNextProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNextProject = async () => {
    try {
      setIsLoading(true);
      
      const project = await getNextProject(userId);
      
      if (project.message || !project.id) {
        // No more projects available
        setIsLoading(false);
        return;
      }

      // Transform API response to match SwipeCard interface
      const transformedProject: Project = {
        id: project.id,
        title: project.title || 'Untitled Project',
        creator: project.users?.username || project.users?.email || 'Unknown Creator',
        roles: [
          ...(project.looking_for || []),
          ...(project.tags || []).slice(0, 2)
        ],
        timestamp: formatTimestamp(project.created_at),
        description: project.description || 'No description available.',
      };

      setCurrentProjects(prev => [...prev, transformedProject]);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error fetching project:", error);
      const errorMessage = error?.message || "Failed to load project";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

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

  const handleSwipeLeft = async () => {
    if (!currentProject || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Record swipe as "pass"
      await recordProjectSwipe(userId, currentProject.id, 'pass');
      toast.error("Not my thing");
      
      // Move to next card or fetch new project
      if (currentIndex < currentProjects.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await fetchNextProject();
      }
    } catch (error: any) {
      console.error("Error recording swipe:", error);
      const errorMessage = error?.message || "Failed to record swipe";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwipeRight = async () => {
    if (!currentProject || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Record swipe as "like"
      await recordProjectSwipe(userId, currentProject.id, 'like');
      
      // Also create an application request to the project owner
      try {
        await applyToProject(currentProject.id);
      } catch (appError: any) {
        // Don't fail the swipe if application fails (e.g., already applied)
        console.log("Application note:", appError);
      }
      
      toast.success("Down to commit! 🎉");
      
      // Move to next card or fetch new project
      if (currentIndex < currentProjects.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await fetchNextProject();
      }
    } catch (error: any) {
      console.error("Error recording swipe:", error);
      const errorMessage = error?.message || "Failed to record swipe";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

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
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-start justify-between gap-8">
            {/* Swipe Card Stack */}
            <div className="w-[550px] flex-shrink-0 relative" style={{ minHeight: '650px' }}>
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
                <>
                  {/* Card 3 (back) */}
                  {currentIndex + 2 < currentProjects.length && (
                    <div 
                      className="absolute top-6 left-0 right-0 transition-all duration-300"
                      style={{ 
                        transform: 'scale(0.92)',
                        opacity: 0.5,
                        zIndex: 1
                      }}
                    >
                      <SwipeCard
                        project={currentProjects[currentIndex + 2]}
                        onSwipeLeft={() => {}}
                        onSwipeRight={() => {}}
                        isInteractive={false}
                      />
                    </div>
                  )}
                  
                  {/* Card 2 (middle) */}
                  {currentIndex + 1 < currentProjects.length && (
                    <div 
                      className="absolute top-3 left-0 right-0 transition-all duration-300"
                      style={{ 
                        transform: 'scale(0.96)',
                        opacity: 0.7,
                        zIndex: 2
                      }}
                    >
                      <SwipeCard
                        project={currentProjects[currentIndex + 1]}
                        onSwipeLeft={() => {}}
                        onSwipeRight={() => {}}
                        isInteractive={false}
                      />
                    </div>
                  )}
                  
                  {/* Card 1 (front) */}
                  <div 
                    className="relative transition-all duration-300"
                    style={{ zIndex: 3 }}
                  >
                    <SwipeCard
                      project={currentProject}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      isInteractive={!isProcessing}
                    />
                  </div>
                </>
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
                        onClick={() => setCurrentIndex(0)}
                        className="mt-4 rounded-xl"
                        style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Mascots */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-12 max-w-none pt-16">
              <h2 
                className="text-5xl font-bold text-center leading-tight bg-gradient-hero bg-clip-text"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                say yes to the ones that matter.
              </h2>

              <div className="flex items-end justify-center gap-12 w-full">
                {/* Left Mascot with Button */}
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={mascotHappy} 
                    alt="" 
                    className="animate-float"
                    style={{ 
                      animation: 'float 3s ease-in-out infinite',
                      width: '235px',
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

                <span className="text-4xl font-bold text-foreground self-center">OR</span>

                {/* Right Mascot with Button */}
                <div className="flex flex-col items-center gap-4">
                  <img 
                    src={mascotSad} 
                    alt="" 
                    className="w-[200px] animate-float"
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
  );
};

export default Match;
