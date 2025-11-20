import { FormEvent, MouseEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotLaptop from "@/assets/mascot-laptop.svg";
import ProgressSidebar from "@/components/registration/ProgressSidebar";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  link: z.string().trim().url("Must be a valid URL").max(500, "Link must be less than 500 characters"),
});

interface Project {
  name: string;
  link: string;
}

const RegisterStep2 = () => {
  const [projects, setProjects] = useState<Project[]>([
    { name: "", link: "" },
    { name: "", link: "" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const pendingRegistration = sessionStorage.getItem('pendingRegistration');
    if (!pendingRegistration) {
      navigate('/auth', { replace: true });
      return;
    }

    const storedStep2 = sessionStorage.getItem('registerStep2');
    if (storedStep2) {
      try {
        const parsed = JSON.parse(storedStep2);
        if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
          setProjects(parsed.projects);
        }
      } catch (error) {
        console.error('Failed to parse stored step 2 data', error);
      }
    }
  }, [navigate]);

  const handleAddProject = () => {
    setProjects([...projects, { name: "", link: "" }]);
  };

  const handleProjectChange = (index: number, field: 'name' | 'link', value: string) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const handleBack = () => {
    sessionStorage.setItem(
      'registerStep2',
      JSON.stringify({ projects })
    );
    navigate('/register/step1');
  };

  const handleNext = async (e?: FormEvent | MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    
    try {
      // Validate only projects that have at least one field filled
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        if (project.name || project.link) {
          if (!project.name || !project.link) {
            toast({
              title: "Validation error",
              description: `Project #${i + 1} must have both name and link`,
              variant: "destructive",
            });
            return;
          }
          projectSchema.parse(project);
        }
      }
      
      setIsLoading(true);
      
      const validProjects = projects.filter(p => p.name && p.link);
      
      if (validProjects.length > 0) {
        toast({
          title: "Projects saved",
          description: `${validProjects.length} project(s) will be created once you finish registration.`,
        });
      }
      
      // Store data and navigate to next step
      sessionStorage.setItem('registerStep2', JSON.stringify({
        projects: validProjects
      }));
      
      navigate('/register/step3');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating projects",
          description: "Some projects may not have been created. You can add them later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div 
        className="fixed inset-0 z-0"
        style={{ 
          backgroundImage: `url(${homepageBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <ProgressSidebar currentStep={2} />
      
      <div className="relative z-10 min-h-screen flex items-center px-4 pl-24" style={{ paddingRight: '100px' }}>
        <div className="w-full flex items-center justify-between gap-16">
          {/* Left side - Mascot */}
          <div className="flex-1 flex justify-center">
            <img 
              src={mascotLaptop} 
              alt="Builder mascot with laptop" 
              className="w-96 h-auto"
            />
          </div>

          {/* Right side - Form Card */}
          <div 
            className="rounded-2xl p-[2px]"
            style={{ 
              background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)',
              width: '500px'
            }}
          >
            <div 
              className="rounded-2xl p-10 relative"
              style={{ 
                backgroundColor: 'rgba(20, 22, 35, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
            <button
              onClick={() => navigate('/auth')}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">
                show your work.
              </h2>
              <p className="text-sm text-white/70">
                proof you've built before (or tried).
              </p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              {projects.map((project, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project #{index + 1} Name
                    </label>
                    <Input
                      type="text"
                      placeholder="link"
                      value={project.name}
                      onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                      className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Project #{index + 1} Link
                    </label>
                    <Input
                      type="url"
                      placeholder="link"
                      value={project.link}
                      onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                      className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                onClick={handleAddProject}
                variant="ghost"
                className="w-full h-11 rounded-xl font-medium text-white border border-white/20 hover:bg-white/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add project
              </Button>
            </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 z-20" style={{ left: 'calc(100vw - 600px)' }}>
        <Button
          onClick={handleBack}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: '#1E2139', color: 'white' }}
        >
          Back
        </Button>
      </div>
      <div className="fixed bottom-4 z-20" style={{ right: '100px' }}>
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
        >
          {isLoading ? 'Creating Projects...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default RegisterStep2;
