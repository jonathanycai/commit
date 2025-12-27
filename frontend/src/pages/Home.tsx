import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import HomeProjectCard from "@/components/projects/HomeProjectCard";
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
        <section className="pt-24 md:pt-40 pb-0 px-4">
          <div className="container mx-auto">
            <div className="max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-0">
              <div className="max-w-2xl space-y-6 text-center lg:text-left">
                <div>
                  <h1 className="font-bold leading-tight text-4xl md:text-5xl lg:text-[48px]" style={{ whiteSpace: 'normal' }}>
                    Stop overthinking.
                  </h1>
                  <h1
                    className="font-bold leading-tight bg-gradient-hero bg-clip-text text-4xl md:text-5xl lg:text-[48px]"
                    style={{
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

              <div className="relative w-full max-w-[650px] h-[300px] md:h-[400px] scale-75 md:scale-100 origin-top lg:origin-center hidden md:block">
                <img
                  src={mascot}
                  alt=""
                  className="absolute left-[20px] top-[100px] w-[240px] animate-float"
                  style={{ animation: 'float 3s ease-in-out infinite' }}
                />
                <img
                  src={mascot1}
                  alt=""
                  className="absolute left-[300px] top-[50px] w-[250px] animate-float"
                  style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}
                />
                <img
                  src={mascot2}
                  alt=""
                  className="absolute left-[580px] top-[110px] w-[290px] animate-float"
                  style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}
                />

                {/* Role badges with cursor pointers */}
                {/* Designer badge */}
                <div className="absolute left-[20px] top-[340px]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="absolute -top-10 left-5" style={{ transform: 'rotate(75deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#6789EC" stroke="white" strokeWidth="1" />
                  </svg>
                  <div
                    className="px-4 py-1.5 rounded text-sm font-medium border-2"
                    style={{ backgroundColor: '#6789EC', color: '#111118', borderColor: 'white' }}
                  >
                    designer
                  </div>
                </div>

                {/* Front-end badge */}
                <div className="absolute left-[320px] top-[0px]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="absolute -bottom-10 left-8" style={{ transform: 'rotate(135deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#6789EC" stroke="white" strokeWidth="1" />
                  </svg>
                  <div
                    className="px-4 py-1.5 rounded text-sm font-medium border-2"
                    style={{ backgroundColor: '#6789EC', color: '#111118', borderColor: 'white' }}
                  >
                    front-end
                  </div>
                </div>

                {/* Idea guy badge */}
                <div className="absolute left-[660px] top-[330px]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="absolute -top-10 left-8" style={{ transform: 'rotate(-20deg)' }}>
                    <path d="M3 3L7 15L10 12L14 15L3 3Z" fill="#A6F4C5" stroke="white" strokeWidth="1" />
                  </svg>
                  <div
                    className="px-4 py-1.5 rounded text-sm font-medium border-2"
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
        <section className="pt-16 md:pt-2 pb-4 px-4">
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
                  <HomeProjectCard key={project.id} project={project} />
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
