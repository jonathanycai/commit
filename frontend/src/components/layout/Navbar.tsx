import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  const handleLogout = () => {
    navigate('/welcome');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm font-lexend">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex flex-col gap-1">
          <span 
            className="text-2xl font-bold bg-gradient-hero bg-clip-text"
            style={{ 
              fontSize: '32px',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            commit
          </span>
          <span className="text-xs text-muted-foreground tracking-[0.32em]" style={{ fontSize: '9px' }}>make sh*t happen</span>
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            home
          </Link>
          <Link 
            to="/match" 
            className={`text-sm font-medium transition-colors ${
              isActive('/match') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            swipe
          </Link>
          <Link 
            to="/projects" 
            className={`text-sm font-medium transition-colors ${
              isActive('/projects') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            browse projects
          </Link>
          <Link 
            to="/profile" 
            className={`text-sm font-medium transition-colors ${
              isActive('/profile') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            my commits
          </Link>
        </div>
          
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 rounded-full"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-primary" />
              <span className="text-sm">Kashish Garg</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background border-border z-50"
          >
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
