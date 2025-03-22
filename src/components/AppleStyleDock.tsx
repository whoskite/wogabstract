'use client';

import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  useSpring,
  AnimatePresence,
  type SpringOptions,
  type MotionValue
} from 'framer-motion';
import { 
  Home, 
  Trophy,
  ShoppingCart, 
  Gift, 
  Sword,
  User, 
  Settings,
  Images
} from 'lucide-react';
import useSoundEffect from '@/hooks/useSoundEffect';

// Custom app item type to support both regular links and custom handlers
type AppItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  onClick?: () => void;
};

const data: AppItem[] = [
  { 
    title: "Home", 
    href: "/", 
    icon: Home,
    onClick: () => {
      // Find any "back to home" functionality on the page
      // This will check if we're in the mint interface and return to home
      const mintInterface = document.getElementById('mint-interface');
      const backButton = document.querySelector('[data-back-to-home]');
      
      if (backButton instanceof HTMLElement) {
        backButton.click();
      } else if (window.location.pathname !== '/') {
        // If we're on a different page, go to home
        window.location.href = '/';
      } else if (mintInterface) {
        // Trigger the return to home view in the SPA
        const customEvent = new CustomEvent('return-to-home');
        document.dispatchEvent(customEvent);
      }
    }
  },
  { 
    title: "Collection", 
    href: "#collection", 
    icon: Images,
    onClick: () => {
      // Try to find a collection section or button to trigger
      const collectionSection = document.getElementById('collection');
      const collectionButton = document.querySelector('[data-collection-view]');
      
      if (collectionSection) {
        collectionSection.scrollIntoView({ behavior: 'smooth' });
      } else if (collectionButton instanceof HTMLElement) {
        collectionButton.click();
      }
    }
  },
  { title: "Lab Pass", href: "/battle-pass", icon: Trophy },
  { title: "Rewards", href: "/rewards", icon: Gift },
  { title: "Inventory", href: "/inventory", icon: Sword },
  { 
    title: "Profile", 
    href: "#profile", 
    icon: User,
    onClick: () => {
      // Smooth scroll to profile section
      const profileElement = document.getElementById('profile');
      if (profileElement) {
        profileElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  { title: "Settings", href: "/settings", icon: Settings },
];

// Constants
const DOCK_HEIGHT = 80;
const DEFAULT_MAGNIFICATION = 58;
const DEFAULT_DISTANCE = 100;
const DEFAULT_PANEL_HEIGHT = 56;

// Context
type DockContextType = {
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextType | undefined>(undefined);

function useDock() {
  const context = useContext(DockContext);
  if (!context) {
    throw new Error('useDock must be used within a DockProvider');
  }
  return context;
}

export function AppleStyleDock() {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  
  // Spring configuration
  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const magnification = DEFAULT_MAGNIFICATION;
  const distance = DEFAULT_DISTANCE;
  const panelHeight = DEFAULT_PANEL_HEIGHT;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      <motion.div
        onMouseMove={(e) => {
          isHovered.set(1);
          mouseX.set(e.pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            isHovered.set(1);
            mouseX.set(e.touches[0].pageX);
          }
        }}
        onTouchEnd={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className="flex items-center h-14 rounded-full gap-2 px-4 bg-black border border-zinc-700 shadow-lg"
      >
        <DockContext.Provider value={{ mouseX, spring, distance, magnification }}>
          {data.map((app) => (
            <DockItem key={app.title}>
              <Link 
                href={app.href} 
                legacyBehavior 
                passHref
              >
                <a 
                  className="flex items-center justify-center w-full h-full group"
                  onClick={(e) => {
                    // Play click sound
                    playClickSound();
                    
                    if (app.onClick) {
                      e.preventDefault();
                      app.onClick();
                    }
                  }}
                  onMouseEnter={() => playHoverSound()}
                >
                  <DockIcon>
                    <app.icon className="text-white group-hover:text-zinc-300 transition-colors" />
                  </DockIcon>
                </a>
              </Link>
              <DockLabel>{app.title}</DockLabel>
            </DockItem>
          ))}
        </DockContext.Provider>
      </motion.div>
      
      {/* Page Indicator */}
      <div className="mt-2 w-6 h-1 rounded-full bg-zinc-600/50"></div>
    </div>
  );
}

function DockItem({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { mouseX, distance, magnification, spring } = useDock();
  const isHovered = useMotionValue(0);
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });
  
  const widthTransform = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [36, magnification, 36]
  );
  
  const width = useSpring(widthTransform, spring);
  
  return (
    <motion.div 
      ref={ref} 
      style={{ width }}
      className="relative flex items-center justify-center cursor-pointer"
      onHoverStart={() => {
        isHovered.set(1);
        playHoverSound();
      }}
      onHoverEnd={() => isHovered.set(0)}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { width, isHovered } as any);
        }
        return child;
      })}
    </motion.div>
  );
}

function DockIcon({ 
  children, 
  width 
}: { 
  children: React.ReactNode;
  width?: MotionValue<number>;
}) {
  const defaultWidth = useMotionValue(36);
  const actualWidth = width || defaultWidth;
  const iconSize = useTransform(actualWidth, (val) => Math.max(24, val * 0.45));
  
  return (
    <motion.div 
      style={{ width: iconSize, height: iconSize }}
      className="flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}

function DockLabel({ 
  children, 
  isHovered 
}: { 
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
}) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (!isHovered) return;
    
    const unsubscribe = isHovered.on('change', (latest) => {
      setVisible(latest === 1);
    });
    
    return () => unsubscribe();
  }, [isHovered]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 