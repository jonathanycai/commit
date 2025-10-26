import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import homepageBg from "@/assets/homepage-bg.svg";
import mascot from "@/assets/mascot.svg";
import mascot1 from "@/assets/mascot-1.svg";
import mascot2 from "@/assets/mascot-2.svg";
import { useState, useEffect } from "react";
import { getAllProjects } from "@/lib/api";

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getAllProjects();
        // Get first 4 projects
        setProjects((response.projects || []).slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);
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
        
        {/* Hero Section */}
        <section className="pt-24 pb-4 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl flex items-center justify-between">
              <div className="max-w-2xl space-y-6">
                <div>
                  <h1 className="font-bold leading-tight" style={{ fontSize: '48px', whiteSpace: 'nowrap' }}>
                    Stop overthinking.
                  </h1>
                  <h1 
                    className="font-bold leading-tight bg-gradient-hero bg-clip-text"
                    style={{ 
                      fontSize: '48px',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    Start building.
                  </h1>
                </div>
                
                <div className="space-y-1">
                  <p className="text-foreground/90 text-lg">
                    you've had ideas before. we all have.
                  </p>
                  <p className="text-foreground/90 text-lg">
                    the difference is — this time, you're building it.
                  </p>
                </div>

                <div className="mt-8">
                  <Link to="/match">
                    <Button 
                      size="lg" 
                      className="h-14 px-8 text-base font-medium rounded-xl"
                      style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                    >
                      Find people crazy enough to join you
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative w-[650px] h-[400px]">
                <img 
                  src={mascot} 
                  alt="" 
                  className="absolute left-[20px] top-[100px] w-[190px] animate-float"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                />
                <img 
                  src={mascot1} 
                  alt="" 
                  className="absolute left-[220px] top-[50px] w-[200px] animate-float"
                  style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
                />
                <img 
                  src={mascot2} 
                  alt="" 
                  className="absolute left-[430px] top-[110px] w-[240px] animate-float"
                  style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}
                />
                
                {/* Role badges with cursor pointers */}
                {/* Designer badge */}
                <div className="absolute left-[20px] top-[290px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute -top-8 left-4" style={{ transform: 'rotate(75deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#6789EC" stroke="white" strokeWidth="1"/>
                  </svg>
                  <div 
                    className="px-3 py-1 rounded text-xs font-medium border-2"
                    style={{ backgroundColor: '#6789EC', color: '#111118', borderColor: 'white' }}
                  >
                    designer
                  </div>
                </div>

                {/* Front-end badge */}
                <div className="absolute left-[230px] top-[40px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute -bottom-8 left-6" style={{ transform: 'rotate(135deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#6789EC" stroke="white" strokeWidth="1"/>
                  </svg>
                  <div 
                    className="px-3 py-1 rounded text-xs font-medium border-2"
                    style={{ backgroundColor: '#6789EC', color: '#111118', borderColor: 'white' }}
                  >
                    front-end
                  </div>
                </div>

                {/* Idea guy badge */}
                <div className="absolute left-[490px] top-[290px]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="absolute -top-8 left-6" style={{ transform: 'rotate(-20deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#A6F4C5" stroke="white" strokeWidth="1"/>
                  </svg>
                  <div 
                    className="px-3 py-1 rounded text-xs font-medium border-2"
                    style={{ backgroundColor: '#A6F4C5', color: '#111118', borderColor: 'white' }}
                  >
                    idea guy
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Projects Section */}
        <section className="py-4 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold">
                <span className="text-foreground">browse </span>
                <span 
                  className="bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #9D9CFF -16.21%, #FAFAFA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  projects
                </span>
              </h2>
              <Link to="/projects">
                <Button 
                  size="lg"
                  className="rounded-xl"
                  style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                >
                  Explore All
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Loading projects...
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div 
                    key={project.id}
                    className="rounded-3xl p-[2px] transition-all hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(157, 156, 255, 0.6), rgba(166, 244, 197, 0.6))'
                    }}
                  >
                    <div 
                      className="rounded-3xl p-6 h-full"
                      style={{ backgroundColor: '#1E2139' }}
                    >
                      <h3 className="text-xl font-bold mb-4">{project.title || 'Untitled Project'}</h3>
                    
                      <div className="flex flex-nowrap gap-1.5 mb-4 overflow-x-auto">
                        {(project.looking_for || []).slice(0, 3).map((role, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ 
                              backgroundColor: role === 'Idea Guy' ? '#A6F4C5' : '#6789EC', 
                              color: '#111118', 
                              fontSize: '10px', 
                              fontWeight: '500' 
                            }}
                          >
                            {role}
                          </span>
                        ))}
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description || 'No description available.'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No projects available yet
                </div>
              )}
            </div>
          </div>
        </section>
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

export default Home;
