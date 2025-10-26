import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";
import { z } from "zod";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotCharging from "@/assets/mascot-charging.svg";
import ProgressSidebar from "@/components/registration/ProgressSidebar";

const socialsSchema = z.object({
  linkedin: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL"
  }),
  discord: z.string().trim().max(100, "Discord handle must be less than 100 characters"),
  github: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL"
  }),
  devpost: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL"
  }),
});

const RegisterStep3 = () => {
  const [linkedin, setLinkedin] = useState("");
  const [discord, setDiscord] = useState("");
  const [github, setGithub] = useState("");
  const [devpost, setDevpost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const handleBack = () => {
    navigate('/register/step2');
  };

  const handleSubmit = async () => {
    try {
      const socialsData = {
        linkedin,
        discord,
        github,
        devpost,
      };

      socialsSchema.parse(socialsData);
      
      setIsLoading(true);
      
      // Update user profile with socials data
      await apiService.updateUserProfile({
        socials: socialsData
      });
      
      toast({
        title: "Registration complete!",
        description: "Your profile has been created successfully.",
      });
      
      // Clear session storage
      sessionStorage.removeItem('registerStep1');
      sessionStorage.removeItem('registerStep2');
      sessionStorage.removeItem('registerStep3');
      
      // Navigate to home page
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile update failed",
          description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
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
      
      <ProgressSidebar currentStep={3} />
      
      <div className="relative z-10 min-h-screen flex items-center px-4 pl-24" style={{ paddingRight: '100px' }}>
        <div className="w-full flex items-center justify-between gap-16">
          {/* Left side - Mascot */}
          <div className="flex-1 flex justify-center">
            <img 
              src={mascotCharging} 
              alt="Builder mascot charging" 
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
                link your socials.
              </h2>
              <p className="text-sm text-white/70">
                link where you live online.
              </p>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  LinkedIn
                </label>
                <Input
                  type="url"
                  placeholder="link"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Discord
                </label>
                <Input
                  type="text"
                  placeholder="link"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  GitHub
                </label>
                <Input
                  type="url"
                  placeholder="link"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Devpost
                </label>
                <Input
                  type="url"
                  placeholder="link"
                  value={devpost}
                  onChange={(e) => setDevpost(e.target.value)}
                  className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>
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
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
        >
          {isLoading ? 'Updating Profile...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default RegisterStep3;
