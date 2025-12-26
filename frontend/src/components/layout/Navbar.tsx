import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 from your AuthContext
  const [username, setUsername] = useState<string>("");

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    console.log('Navbar - user object:', user);
    // If user already has a username (e.g., from OAuth), use it immediately
    if (user?.username) {
      console.log('Navbar - using username from user object:', user.username);
      setUsername(user.username);
      return;
    }

    // Otherwise, try to fetch the profile
    const fetchProfile = async () => {
      try {
        const res = await apiService.getUserProfile(); // fetch current user
        const displayName = res.profile.username || user?.username || user?.email?.split("@")[0] || "User";
        console.log('Navbar - using username from profile:', displayName);
        setUsername(displayName);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        // Fallback to email username or "User"
        const displayName = user?.username || user?.email?.split("@")[0] || "User";
        console.log('Navbar - using fallback username:', displayName);
        setUsername(displayName);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm font-lexend">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex flex-col gap-1">
          <span
            className="text-2xl font-bold bg-gradient-hero bg-clip-text"
            style={{
              fontSize: "32px",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            commit
          </span>
          <span
            className="text-xs text-muted-foreground tracking-[0.32em]"
            style={{ fontSize: "9px" }}
          >
            make sh*t happen
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
          {[
            { path: "/home", label: "home" },
            { path: "/match", label: "swipe" },
            { path: "/projects", label: "browse projects" },
            { path: "/profile", label: "my commits" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors ${isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Profile Dropdown */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                <div className="h-8 w-8 rounded-full bg-gradient-primary" />
                <span className="text-sm">{username || "..."}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-border z-50">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-foreground hover:bg-accent"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background border-l border-border">
              <div className="flex flex-col gap-8 mt-8">
                <div className="flex flex-col gap-4">
                  {[
                    { path: "/home", label: "home" },
                    { path: "/match", label: "swipe" },
                    { path: "/projects", label: "browse projects" },
                    { path: "/profile", label: "my commits" },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`text-lg font-medium transition-colors ${isActive(item.path)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary" />
                    <span className="text-sm font-medium">{username || "..."}</span>
                  </div>
                  <Button
                    variant="ghost"
                    className="justify-start px-0 text-muted-foreground hover:text-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
