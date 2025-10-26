import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import mascotGroup from "@/assets/mascot-group.svg";
import homepageBg from "@/assets/homepage-bg.svg";

const Welcome = () => {
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
      
      <div className="relative z-10 min-h-screen flex items-center px-4" style={{ paddingRight: '103px' }}>
        <div className="w-full flex items-center justify-between gap-16 pl-24">
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

          {/* Right side - Card */}
          <div 
            className="rounded-2xl p-[2px] max-w-xl w-full"
            style={{ 
              background: 'linear-gradient(135deg, #6789EC 0%, #5B7FFF 100%)'
            }}
          >
            <div 
              className="rounded-2xl p-12"
              style={{ 
                backgroundColor: 'rgba(20, 22, 35, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
            <div className="flex justify-center mb-6">
              <img 
                src={mascotGroup} 
                alt="Mascots" 
                className="w-64 h-auto"
              />
            </div>

            <h2 className="text-2xl font-bold text-white text-left mb-4">
              No more waiting for the "right" team.
            </h2>

            <p className="text-base text-white/70 text-left mb-8">
              No more half-finished repos. Create an account to find builders who commit — and projects worth committing to.
            </p>

            <Link to="/auth">
              <Button 
                className="w-full h-12 rounded-xl font-medium text-base"
                style={{ backgroundColor: '#A6F4C5', color: '#111118' }}
              >
                Let's start building!
              </Button>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
