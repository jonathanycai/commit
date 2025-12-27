import { FormEvent, MouseEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import homepageBg from "@/assets/homepage-bg.svg";
import mascotBuilder from "@/assets/mascot-builder.svg";
import ProgressSidebar from "@/components/registration/ProgressSidebar";
import { checkUsername } from "@/lib/api";

const profileSchema = z.object({
  username: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  experience: z.string().min(1, "Experience level is required"),
  role: z.string().min(1, "Role is required"),
  time_commitment: z.string().min(1, "Time commitment is required"),
});

const RegisterStep1 = () => {
  const [username, setUsername] = useState("");
  const [experience, setExperience] = useState("");
  const [role, setRole] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const pendingRegistration = sessionStorage.getItem('pendingRegistration');
    if (!pendingRegistration) {
      navigate('/auth', { replace: true });
      return;
    }

    const storedStep1 = sessionStorage.getItem('registerStep1');
    if (storedStep1) {
      try {
        const parsed = JSON.parse(storedStep1);
        setUsername(parsed.username || "");
        setExperience(parsed.experience || "");
        setRole(parsed.role || "");
        setTimeCommitment(parsed.timeCommitment || "");
      } catch (error) {
        console.error('Failed to parse stored step 1 data', error);
      }
    }
  }, [navigate]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      profileSchema.parse({
        username,
        experience,
        role,
        time_commitment: timeCommitment,
      });

      setIsLoading(true);

      const { available } = await checkUsername(username);

      if (!available) {
        toast({
          title: "Username taken",
          description: "This username is already in use. Please choose another.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem(
        'registerStep1',
        JSON.stringify({
          username,
          experience,
          role,
          timeCommitment,
        })
      );

      toast({
        title: "Basics saved",
        description: "Next, add your past projects.",
      });
      navigate('/register/step2');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile creation failed",
          description: "Something went wrong. Please try again.",
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

      <ProgressSidebar currentStep={1} />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 md:pl-24 md:pr-[100px]">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Left side - Mascot */}
          <div className="hidden md:flex flex-1 justify-center">
            <img
              src={mascotBuilder}
              alt="Builder mascot"
              className="w-64 md:w-96 h-auto"
            />
          </div>

          {/* Right side - Form Card */}
          <div
            className="w-full max-w-md rounded-2xl p-6 md:p-10"
            style={{
              backgroundColor: 'rgba(20, 22, 35, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1.35px solid rgba(103, 137, 236, 1)'
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
                build your profile.
              </h2>
              <p className="text-sm text-white/70">
                who are you and what are you looking for?
              </p>
            </div>

            <form onSubmit={handleNext} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username *
                </label>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Experience Level *
                </label>
                <Select value={experience} onValueChange={setExperience} required>
                  <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 z-50" style={{ backgroundColor: 'rgba(30, 33, 57, 0.95)' }}>
                    <SelectItem value="beginner" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Beginner</SelectItem>
                    <SelectItem value="intermediate" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Intermediate</SelectItem>
                    <SelectItem value="advanced" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Role *
                </label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 z-50" style={{ backgroundColor: 'rgba(30, 33, 57, 0.95)' }}>
                    <SelectItem value="designer" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Designer</SelectItem>
                    <SelectItem value="front-end" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Front-end</SelectItem>
                    <SelectItem value="back-end" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Back-end</SelectItem>
                    <SelectItem value="full-stack" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Full Stack</SelectItem>
                    <SelectItem value="idea-guy" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Idea Guy</SelectItem>
                    <SelectItem value="pitch-wizard" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">Pitch Wizard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Time Commitment *
                </label>
                <Select value={timeCommitment} onValueChange={setTimeCommitment} required>
                  <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                    <SelectValue placeholder="Select hours per week" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 z-50" style={{ backgroundColor: 'rgba(30, 33, 57, 0.95)' }}>
                    <SelectItem value="1-2 hrs/week" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">1-2 hrs/week</SelectItem>
                    <SelectItem value="3-4 hrs/week" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">3-4 hrs/week</SelectItem>
                    <SelectItem value="5-6 hrs/week" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">5-6 hrs/week</SelectItem>
                    <SelectItem value="7-8 hrs/week" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">7-8 hrs/week</SelectItem>
                    <SelectItem value="8+ hrs/week" className="text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white">8+ hrs/week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 z-20 right-4 md:right-[100px]">
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
        >
          {isLoading ? 'Creating Profile...' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default RegisterStep1;
