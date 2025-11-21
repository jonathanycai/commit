import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import homepageBg from "@/assets/homepage-bg.svg";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      sessionStorage.setItem(
        'pendingRegistration',
        JSON.stringify({ email, password })
      );
      sessionStorage.removeItem('registerStep1');
      sessionStorage.removeItem('registerStep2');
      sessionStorage.removeItem('registerStep3');
      toast({
        title: "Let's build your profile",
        description: "Tell us more about yourself to finish creating your account.",
      });
      navigate('/register/step1');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Google authentication not configured",
      description: "Feature coming soon!",
    });
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-6xl flex items-center justify-between gap-16 pl-24">
          {/* Left side - Logo */}
          <div className="flex-1">
            <div className="flex flex-col gap-1">
              <h1
                className="text-7xl font-bold bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #9D9CFF -16.21%, #FAFAFA 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: '56px'
                }}
              >
                commit
              </h1>
              <p className="text-white tracking-[0.32em]" style={{ fontSize: '18px' }}>
                make sh*t happen
              </p>
            </div>
          </div>

          {/* Right side - Auth Card */}
          <div
            className="flex-1 rounded-2xl p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
            }}
          >
            <div
              className="rounded-2xl p-10"
              style={{
                backgroundColor: 'rgba(20, 22, 35, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">
                  ready, set, commit.
                </h2>
                <p className="text-base" style={{ color: '#9D9CFF' }}>
                  with a register.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 rounded-lg border-white/20 bg-white/5 text-white placeholder:text-white/40"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-medium"
                  style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
                >
                  {isLoading ? 'Creating Account...' : 'Register'}
                </Button>

                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  className="w-full h-11 rounded-xl font-medium border-white/20 bg-white text-black hover:bg-white/90"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Register with Google
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  Already a member? Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
