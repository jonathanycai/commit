import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Project {
  id: string;
  title: string;
  creator: string;
  roles: string[];
  timestamp: string;
  description: string;
}

interface SwipeCardProps {
  project: Project;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isInteractive?: boolean;
}

const SwipeCard = ({
  project,
  onSwipeLeft,
  onSwipeRight,
  isInteractive = true,
}: SwipeCardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [animateToButton, setAnimateToButton] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const swipeHandled = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractive || isAnimatingOut) return;
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    // Prevent text selection
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - startPos.x;
    const newY = e.clientY - startPos.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.userSelect = '';

    // Only check if dragged to the right side (positive X)
    if (position.x > 200) {
      // Get the card's final position on screen
      const cardRect = cardRef.current?.getBoundingClientRect();
      const cardCenterX = cardRect ? cardRect.left + cardRect.width / 2 : 0;

      // Get screen width to determine the OR text position (roughly center-right of screen)
      const screenWidth = window.innerWidth;
      const orTextX = screenWidth * 0.75; // Approximate position of OR text

      setIsAnimatingOut(true);

      // Prevent double execution
      if (swipeHandled.current) return;
      swipeHandled.current = true;

      if (cardCenterX > orTextX) {
        // Right of OR = Not my thing (pass)
        setAnimateToButton('right');
        onSwipeLeft();
        setTimeout(() => {
          setPosition({ x: 0, y: 0 });
          setIsAnimatingOut(false);
          setAnimateToButton(null);
          swipeHandled.current = false;
        }, 500);
      } else {
        // Left of OR = Down to commit (like)
        setAnimateToButton('left');
        onSwipeRight();
        setTimeout(() => {
          setPosition({ x: 0, y: 0 });
          setIsAnimatingOut(false);
          setAnimateToButton(null);
          swipeHandled.current = false;
        }, 500);
      }
    } else {
      // Snap back to center if not dragged far enough
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position, startPos]);

  // Keyboard controls
  useEffect(() => {
    if (!isInteractive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onSwipeRight(); // Left arrow = Down to commit
      } else if (e.key === 'ArrowRight') {
        onSwipeLeft(); // Right arrow = Not my thing
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInteractive, onSwipeLeft, onSwipeRight]);

  const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
  const scale = isAnimatingOut ? 0 : Math.max(0.5, 1 - distance / 800);
  const rotation = position.x / 30;
  const opacity = isAnimatingOut ? 0 : Math.max(0.3, 1 - distance / 400);

  // Calculate target position for animation
  let targetX = position.x;
  let targetY = position.y;

  if (isAnimatingOut && animateToButton) {
    const screenWidth = window.innerWidth;
    if (animateToButton === 'left') {
      // Animate to left mascot button position
      targetX = screenWidth * 0.65 - (cardRef.current?.offsetLeft || 0);
      targetY = 400;
    } else {
      // Animate to right mascot button position
      targetX = screenWidth * 0.85 - (cardRef.current?.offsetLeft || 0);
      targetY = 400;
    }
  }

  return (
    <div
      ref={cardRef}
      className="rounded-[32px] p-[3px] select-none"
      style={{
        background: "linear-gradient(135deg, rgba(103, 137, 236, 1), rgba(93, 224, 187, 1))",
        transform: `translate(${isAnimatingOut ? targetX : position.x}px, ${isAnimatingOut ? targetY : position.y}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: opacity,
        cursor: isInteractive ? (isDragging ? 'grabbing' : 'grab') : 'default',
        transition: isAnimatingOut ? 'all 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' : (isDragging ? 'none' : 'all 0.3s ease-out'),
        pointerEvents: isInteractive && !isAnimatingOut ? 'auto' : 'none',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="rounded-[32px] p-8"
        style={{
          backgroundColor: 'rgba(20, 22, 35, 0.95)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white">{project.title}</h2>
            <div className="flex flex-wrap gap-2">
              {project.roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{
                    backgroundColor: role === 'Idea Guy' ? '#A6F4C5' : role === 'Designer' ? '#79B1DF' : '#5B7FFF',
                    color: '#111118'
                  }}
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary" />
              <span className="text-sm font-medium text-white">{project.creator}</span>
            </div>
            <p className="text-xs text-white/60">{project.timestamp}</p>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="relative mb-6 rounded-2xl overflow-hidden">
          <div
            className="aspect-video rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, #A6F4C5 0%, #79B1DF 100%)'
            }}
          />

          {/* Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {[1, 2, 3].map((dot) => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dot === 1 ? '#5B7FFF' : 'rgba(255, 255, 255, 0.5)' }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
