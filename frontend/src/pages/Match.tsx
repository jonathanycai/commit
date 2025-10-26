import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import SwipeCard from "@/components/match/SwipeCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotHappy from "@/assets/mascot-happy-new.svg";
import mascotSad from "@/assets/mascot-sad.svg";

// Mock data
const mockProjects = [
  {
    id: "1",
    title: "Title of Project",
    creator: "Kashish Garg",
    roles: ["Designer", "Idea Guy", "Front-End"],
    timestamp: "30 mins ago",
    description: "This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for. This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.This is a description of the project that the person will write and share a little bit about what they want for the people that they're looking for.\n\nSomething else that's really important yay :)",
  },
  {
    id: "2",
    title: "E-Commerce Platform",
    creator: "Alex Chen",
    roles: ["Back-End", "Full Stack"],
    timestamp: "1 hour ago",
    description: "Building a modern e-commerce platform with real-time inventory management and AI-powered recommendations. Looking for developers who are passionate about building scalable systems.",
  },
  {
    id: "3",
    title: "Social Media App",
    creator: "Sarah Johnson",
    roles: ["Designer", "Front-End"],
    timestamp: "2 hours ago",
    description: "Creating a next-gen social platform focused on authentic connections. Need creative minds who want to reimagine how people interact online.",
  },
  {
    id: "4",
    title: "AI Writing Assistant",
    creator: "Mike Torres",
    roles: ["Back-End", "ML Engineer"],
    timestamp: "3 hours ago",
    description: "Building an AI-powered writing tool that helps content creators. Looking for developers interested in NLP and machine learning.",
  },
];

const Match = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProject = mockProjects[currentIndex];

  const handleSwipeLeft = () => {
    toast.error("Not my thing");
    if (currentIndex < mockProjects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.info("No more projects!");
    }
  };

  const handleSwipeRight = () => {
    toast.success("Down to commit! 🎉");
    if (currentIndex < mockProjects.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      toast.info("No more projects!");
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
              {currentProject ? (
                <>
                  {/* Card 3 (back) */}
                  {currentIndex + 2 < mockProjects.length && (
                    <div 
                      className="absolute top-6 left-0 right-0 transition-all duration-300"
                      style={{ 
                        transform: 'scale(0.92)',
                        opacity: 0.5,
                        zIndex: 1
                      }}
                    >
                      <SwipeCard
                        project={mockProjects[currentIndex + 2]}
                        onSwipeLeft={() => {}}
                        onSwipeRight={() => {}}
                        isInteractive={false}
                      />
                    </div>
                  )}
                  
                  {/* Card 2 (middle) */}
                  {currentIndex + 1 < mockProjects.length && (
                    <div 
                      className="absolute top-3 left-0 right-0 transition-all duration-300"
                      style={{ 
                        transform: 'scale(0.96)',
                        opacity: 0.7,
                        zIndex: 2
                      }}
                    >
                      <SwipeCard
                        project={mockProjects[currentIndex + 1]}
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
                      isInteractive={true}
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
                    className="h-12 px-6 rounded-xl font-medium"
                    style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                  >
                    ✓ Down to commit
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
                    variant="outline"
                    className="h-12 px-6 rounded-xl font-medium border-2"
                    style={{ borderColor: '#5B7FFF', color: '#5B7FFF' }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Not my thing
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
