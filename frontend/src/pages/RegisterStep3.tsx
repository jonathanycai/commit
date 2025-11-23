import { useEffect, useState } from "react";
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
  linkedin: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().url().safeParse(val).success,
      { message: "LinkedIn must be a valid URL" }
    ),
  discord: z.string().trim().max(100, "Discord handle must be less than 100 characters"),
  github: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().url().safeParse(val).success,
      { message: "GitHub must be a valid URL" }
    ),
  devpost: z
    .string()
    .trim()
    .refine(
      (val) => val === "" || z.string().url().safeParse(val).success,
      { message: "Devpost must be a valid URL" }
    ),
});

const RegisterStep3 = () => {
  const [linkedin, setLinkedin] = useState("");
  const [discord, setDiscord] = useState("");
  const [github, setGithub] = useState("");
  const [devpost, setDevpost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  useEffect(() => {
    const pendingRegistration = sessionStorage.getItem("pendingRegistration");
    if (!pendingRegistration) {
      navigate("/auth", { replace: true });
      return;
    }

    const storedStep3 = sessionStorage.getItem("registerStep3");
    if (storedStep3) {
      try {
        const parsed = JSON.parse(storedStep3);
        setLinkedin(parsed.linkedin || "");
        setDiscord(parsed.discord || "");
        setGithub(parsed.github || "");
        setDevpost(parsed.devpost || "");
      } catch (error) {
        console.error("Failed to parse stored step 3 data", error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    sessionStorage.setItem(
      "registerStep3",
      JSON.stringify({ linkedin, discord, github, devpost })
    );
  }, [linkedin, discord, github, devpost]);

  const handleBack = () => navigate("/register/step2");

  const handleSubmit = async () => {
    try {
      const socialsData = { linkedin, discord, github, devpost };
      socialsSchema.parse(socialsData);
      const pendingRegistrationRaw = sessionStorage.getItem("pendingRegistration");
      if (!pendingRegistrationRaw) {
        toast({
          title: "Registration incomplete",
          description: "Please start the registration process again.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const step1DataRaw = sessionStorage.getItem("registerStep1");
      if (!step1DataRaw) {
        toast({
          title: "Missing information",
          description: "Please complete Step 1 before finishing registration.",
          variant: "destructive",
        });
        navigate("/register/step1");
        return;
      }

      let pendingRegistration: { email?: string; password?: string };
      let step1Data: {
        username?: string;
        experience?: string;
        role?: string;
        timeCommitment?: string;
      };

      try {
        pendingRegistration = JSON.parse(pendingRegistrationRaw) ?? {};
      } catch (error) {
        console.error("Failed to parse pending registration", error);
        throw new Error("Registration data is corrupted. Please restart registration.");
      }

      try {
        step1Data = JSON.parse(step1DataRaw) ?? {};
      } catch (error) {
        console.error("Failed to parse step 1 data", error);
        throw new Error("Step 1 data is corrupted. Please restart registration.");
      }

      const { email, password } = pendingRegistration;
      if (!email || !password) {
        throw new Error("Registration data is incomplete. Please restart registration.");
      }

      if (!step1Data.username || !step1Data.experience || !step1Data.role || !step1Data.timeCommitment) {
        throw new Error("Step 1 data is incomplete. Please restart registration.");
      }

      const step2DataRaw = sessionStorage.getItem("registerStep2");
      let project_links: string[] = [];
      let projectsToCreate: Array<{ name: string; link: string }> = [];

      if (step2DataRaw) {
        try {
          const parsedStep2 = JSON.parse(step2DataRaw);
          if (Array.isArray(parsedStep2?.projects)) {
            projectsToCreate = parsedStep2.projects.filter(
              (project: any) => project.name && project.link
            );
            project_links = projectsToCreate.map((project) => project.link);
          }
        } catch (error) {
          console.error("Failed to parse step 2 data", error);
          throw new Error("Project data is corrupted. Please restart registration.");
        }
      }

      setIsLoading(true);

      await register(email, password);

      await apiService.createUserProfile({
        username: step1Data.username,
        experience: step1Data.experience,
        role: step1Data.role,
        time_commitment: step1Data.timeCommitment,
        socials: socialsData,
        project_links
      });

      // if (projectsToCreate.length > 0) {
      //   for (const project of projectsToCreate) {
      //     try {
      //       await apiService.createProject({
      //         title: project.name,
      //         project_name: project.link,
      //         description: `Project created during registration: ${project.name}`,
      //         tags: [],
      //         looking_for: [],
      //         is_active: true,
      //       });
      //     } catch (error) {
      //       console.error("Failed to create project:", project.name, error);
      //     }
      //   }
      // }

      // await apiService.updateUserProfile({
      //   socials: socialsData,
      //   project_links,
      // });

      toast({
        title: "Registration complete!",
        description: "Your account and profile have been created successfully.",
      });

      sessionStorage.removeItem("pendingRegistration");
      sessionStorage.removeItem("registerStep1");
      sessionStorage.removeItem("registerStep2");
      sessionStorage.removeItem("registerStep3");

      setTimeout(() => navigate("/"), 600);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${homepageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <ProgressSidebar currentStep={3} />

      <div className="relative z-10 min-h-screen flex items-center px-4 pl-24" style={{ paddingRight: "100px" }}>
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
              background: "linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)",
              width: "500px",
            }}
          >
            <div
              className="rounded-2xl p-10 relative"
              style={{
                backgroundColor: "rgba(20, 22, 35, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <button
                onClick={() => navigate("/auth")}
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
                    placeholder="https://linkedin.com/in/username"
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
                    placeholder="username#1234"
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
                    placeholder="https://github.com/username"
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
                    placeholder="https://devpost.com/username"
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
      <div className="fixed bottom-4 z-20" style={{ left: "calc(100vw - 600px)" }}>
        <Button
          onClick={handleBack}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: "#1E2139", color: "white" }}
        >
          Back
        </Button>
      </div>

      <div className="fixed bottom-4 z-20" style={{ right: "100px" }}>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-8 h-12 rounded-xl font-medium"
          style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
        >
          {isLoading ? "Updating Profile..." : "Submit"}
        </Button>
      </div>
    </div>
  );
};

export default RegisterStep3;
