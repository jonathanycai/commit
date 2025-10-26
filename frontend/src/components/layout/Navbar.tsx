import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/lib/api";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 from your AuthContext
  const [username, setUsername] = useState<string>("");

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiService.getUserProfile(); // fetch current user
        setUsername(res.profile.username || user?.email?.split("@")[0] || "User");
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setUsername(user?.email?.split("@")[0] || "User");
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/welcome");
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

        {/* Center Nav Links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          {[
            { path: "/", label: "home" },
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

        {/* Profile Dropdown */}
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
    </nav>
  );
};

export default Navbar;
