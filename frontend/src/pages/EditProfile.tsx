import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import homepageBg from "@/assets/homepage-bg.svg";
import { apiService, UserProfile, UserProfileResponse } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profileSchema = z.object({
  username: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  experience: z.string().optional(),
  role: z.string().optional(),
  time_commitment: z.string().optional(),
  socials: z.object({
    linkedin: z.string().optional(),
    discord: z.string().optional(),
    github: z.string().optional(),
    devpost: z.string().optional(),
  }).optional(),
});

const getAvatarStorageKey = (userId: string) => `commit_profile_avatar_${userId}`;

// Normalize API profile so form always has the shape we expect (handles null/undefined from DB)
function normalizeProfile(p: UserProfile | Record<string, unknown> | null | undefined): Partial<UserProfile> {
  if (!p || typeof p !== "object") return {};
  const raw = p as Record<string, unknown>;
  const socials = raw.socials as Record<string, string> | undefined;
  return {
    id: raw.id as string,
    email: raw.email as string,
    username: (raw.username ?? "") as string,
    role: (raw.role ?? "") as string,
    experience: (raw.experience ?? "") as string,
    time_commitment: (raw.time_commitment ?? "") as string,
    socials: socials && typeof socials === "object" ? socials : {},
    project_links: Array.isArray(raw.project_links) ? raw.project_links as { name: string; link: string }[] : undefined,
  };
}

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: profileData, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => apiService.getUserProfile(),
    staleTime: 0, // always refetch when opening edit page
  });

  const userId = profileData?.profile?.id ?? authUser?.id;
  const avatarKey = userId ? getAvatarStorageKey(userId) : null;

  const updateProfileMutation = useMutation<UserProfileResponse, Error, Partial<UserProfile>>({
    mutationFn: (data) => apiService.updateUserProfile(data),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to update profile",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  // Refetch profile when opening Edit Profile so we have fresh data
  useEffect(() => {
    refetchProfile();
  }, [refetchProfile]);

  // Populate form from Supabase profile when it loads; otherwise prefill from auth user so fields aren’t empty
  useEffect(() => {
    if (profileData?.profile) {
      setFormData(normalizeProfile(profileData.profile));
    } else if (authUser) {
      setFormData(normalizeProfile({
        id: authUser.id,
        email: authUser.email,
        username: authUser.username ?? "",
        role: authUser.role ?? "",
        experience: authUser.experience ?? "",
        time_commitment: authUser.time_commitment ?? "",
        socials: {},
      }));
    }
  }, [profileData, authUser]);

  // Load per-user avatar from localStorage
  useEffect(() => {
    if (!avatarKey) return;
    const stored = localStorage.getItem(avatarKey);
    setAvatar(stored);
  }, [avatarKey]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !avatarKey) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (result) {
        setAvatar(result);
        localStorage.setItem(avatarKey, result);
        window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: { userId } }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (field: keyof UserProfile, value: string | Record<string, string> | { name: string; link: string }[] | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socials: {
        ...(prev.socials || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      profileSchema.parse({
        username: formData.username,
        experience: formData.experience,
        role: formData.role,
        time_commitment: formData.time_commitment,
        socials: formData.socials,
      });

      setIsSaving(true);
      await updateProfileMutation.mutateAsync({
        username: formData.username?.trim() ?? "",
        experience: formData.experience ?? "",
        role: formData.role ?? "",
        time_commitment: formData.time_commitment ?? "",
        socials: formData.socials ?? {},
        project_links: formData.project_links,
      });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
        toast({
          title: "Could not save",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const usernameInitial = (formData.username || profileData?.profile.username || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-lexend">
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${homepageBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  <span
                    className="bg-clip-text"
                    style={{
                      backgroundImage: "linear-gradient(90deg, #9D9CFF -16.21%, #FAFAFA 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    edit your profile.
                  </span>
                </h1>
                <p className="text-sm text-white/70">
                  update how others see you and review the projects you have joined.
                </p>
              </div>
              <Button
                variant="ghost"
                className="border border-white/10 rounded-xl text-sm"
                onClick={() => navigate("/profile")}
              >
                Back to my commits
              </Button>
            </div>

            <div className="max-w-2xl">
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-2xl p-6"
                style={{
                  backgroundColor: "rgba(20, 22, 35, 0.95)",
                  backdropFilter: "blur(10px)",
                  border: "1.35px solid rgba(103, 137, 236, 1)",
                }}
              >
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-primary text-primary-foreground text-3xl font-bold shadow-glow">
                      {avatar ? (
                        <img src={avatar} alt="Profile avatar" className="h-full w-full object-cover" />
                      ) : (
                        usernameInitial
                      )}
                    </div>
                    <label className="mt-3 block text-xs font-medium text-primary cursor-pointer">
                      change photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-white/70">
                      this photo is unique to your profile and saved in your browser; we will store it server-side soon.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Name
                    </label>
                    <Input
                      disabled={isLoadingProfile}
                      value={formData.username || ""}
                      onChange={(e) => handleFieldChange("username", e.target.value)}
                      placeholder="your name"
                      className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Experience level
                    </label>
                    <Select
                      value={formData.experience || ""}
                      onValueChange={(value) => handleFieldChange("experience", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent className="border-white/20 z-50" style={{ backgroundColor: "rgba(30, 33, 57, 0.95)" }}>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Role
                    </label>
                    <Select
                      value={formData.role || ""}
                      onValueChange={(value) => handleFieldChange("role", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="border-white/20 z-50" style={{ backgroundColor: "rgba(30, 33, 57, 0.95)" }}>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="front-end">Front-end</SelectItem>
                        <SelectItem value="back-end">Back-end</SelectItem>
                        <SelectItem value="full-stack">Full Stack</SelectItem>
                        <SelectItem value="idea-guy">Idea Guy</SelectItem>
                        <SelectItem value="pitch-wizard">Pitch Wizard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Time commitment
                    </label>
                    <Select
                      value={formData.time_commitment || ""}
                      onValueChange={(value) => handleFieldChange("time_commitment", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-white/20 bg-white/5 text-white">
                        <SelectValue placeholder="Select hours per week" />
                      </SelectTrigger>
                      <SelectContent className="border-white/20 z-50" style={{ backgroundColor: "rgba(30, 33, 57, 0.95)" }}>
                        <SelectItem value="1-2 hrs/week">1-2 hrs/week</SelectItem>
                        <SelectItem value="3-4 hrs/week">3-4 hrs/week</SelectItem>
                        <SelectItem value="5-6 hrs/week">5-6 hrs/week</SelectItem>
                        <SelectItem value="7-8 hrs/week">7-8 hrs/week</SelectItem>
                        <SelectItem value="8+ hrs/week">8+ hrs/week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-4">
                  <h2 className="text-sm font-semibold text-white/80">
                    Socials
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        LinkedIn
                      </label>
                      <Input
                        value={formData.socials?.linkedin || ""}
                        onChange={(e) => handleSocialChange("linkedin", e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Discord
                      </label>
                      <Input
                        value={formData.socials?.discord || ""}
                        onChange={(e) => handleSocialChange("discord", e.target.value)}
                        placeholder="username#1234"
                        className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        GitHub
                      </label>
                      <Input
                        value={formData.socials?.github || ""}
                        onChange={(e) => handleSocialChange("github", e.target.value)}
                        placeholder="https://github.com/username"
                        className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Devpost
                      </label>
                      <Input
                        value={formData.socials?.devpost || ""}
                        onChange={(e) => handleSocialChange("devpost", e.target.value)}
                        placeholder="https://devpost.com/username"
                        className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving || isLoadingProfile}
                    className="px-8 h-11 rounded-xl font-medium"
                    style={{ backgroundColor: "#A6F4C5", color: "#111118" }}
                  >
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;

