import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const error = searchParams.get("error");

      if (error) {
        toast({
          title: "Authentication failed",
          description: error || "Something went wrong with Google authentication.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      if (!accessToken || !refreshToken) {
        toast({
          title: "Authentication failed",
          description: "No authentication tokens received.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        await handleOAuthCallback(accessToken, refreshToken);
        
        toast({
          title: "Login successful",
          description: "Welcome!",
        });

        // Check if user has a profile, if not redirect to profile setup
        // For now, just redirect to home - the profile check can be done there
        navigate("/home");
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast({
          title: "Authentication failed",
          description: "Failed to complete authentication. Please try again.",
          variant: "destructive",
        });
        navigate("/auth");
      }
    };

    handleCallback();
  }, [searchParams, handleOAuthCallback, navigate, toast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4">Completing authentication...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;

