import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const { handleOAuthCallback } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // const handleCallback = async () => {
    //   // Helper function to decode JWT token
    //   const decodeJWT = (token: string) => {
    //     try {
    //       const base64Url = token.split('.')[1];
    //       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    //       const jsonPayload = decodeURIComponent(
    //         atob(base64)
    //           .split('')
    //           .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
    //           .join('')
    //       );
    //       return JSON.parse(jsonPayload);
    //     } catch (e) {
    //       console.error('Failed to decode JWT:', e);
    //       return null;
    //     }
    //   };

    //   // Supabase OAuth can return tokens in either URL hash or query params
    //   // Check hash first (more secure, Supabase's default), then query params
    //   const hashParams = new URLSearchParams(window.location.hash.substring(1));
    //   const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
    //   const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
    //   const error = hashParams.get("error") || searchParams.get("error");
    //   const errorDescription = hashParams.get("error_description") || searchParams.get("error_description");

    //   // Extract user info from URL params (passed from backend OAuth callback) OR from JWT token
    //   let userId = searchParams.get("user_id");
    //   let userEmail = searchParams.get("user_email");
    //   let userName = searchParams.get("user_name");

    //   // If user info not in URL params, decode from JWT token
    //   if (accessToken && (!userId || !userEmail || !userName)) {
    //     const tokenData = decodeJWT(accessToken);
    //     if (tokenData) {
    //       userId = userId || tokenData.sub || '';
    //       userEmail = userEmail || tokenData.email || '';
    //       // Try multiple sources for name from JWT
    //       userName = userName 
    //         || tokenData.user_metadata?.full_name 
    //         || tokenData.user_metadata?.name
    //         || tokenData.name
    //         || userEmail?.split('@')[0] 
    //         || 'User';
    //     }
    //   }

    //   console.log('OAuth callback - Extracted user info:', { userId, userEmail, userName });

    //   // If we have tokens, ignore error parameter (Supabase sometimes includes error even when tokens are present)
    //   if (error && !accessToken && !refreshToken) {
    //     toast({
    //       title: "Authentication failed",
    //       description: errorDescription || error || "Something went wrong with Google authentication.",
    //       variant: "destructive",
    //     });
    //     navigate("/auth");
    //     return;
    //   }

    //   if (!accessToken || !refreshToken) {
    //     console.error("OAuth callback - Missing tokens. Hash:", window.location.hash, "Query:", window.location.search);
    //     toast({
    //       title: "Authentication failed",
    //       description: "No authentication tokens received.",
    //       variant: "destructive",
    //     });
    //     navigate("/auth");
    //     return;
    //   }

    //   try {
    //     await handleOAuthCallback(accessToken, refreshToken, {
    //       id: userId || '',
    //       email: userEmail || '',
    //       name: userName || '',
    //     });

    //     toast({
    //       title: "Login successful",
    //       description: "Welcome!",
    //     });

    //     // Check if user has a profile, if not redirect to profile setup
    //     // For now, just redirect to home - the profile check can be done there
    //     navigate("/home");
    //   } catch (error) {
    //     console.error("OAuth callback error:", error);
    //     toast({
    //       title: "Authentication failed",
    //       description: "Failed to complete authentication. Please try again.",
    //       variant: "destructive",
    //     });
    //     navigate("/auth");
    //   }
    // };

    // handleCallback();
    navigate("/auth");
  }, [searchParams, navigate, toast]);

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

