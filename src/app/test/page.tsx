"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LatestNews from "@/components/LatestNews";
import DailyLogin from "@/components/DailyLogin";
import GMChatWindow from "@/components/GMChatWindow";
import { AppleStyleDock } from "@/components/AppleStyleDock";
import { AdvancedCssBackground } from "@/components/AdvancedCssBackground";
import { StaticBackground } from "@/components/StaticBackground";
import { ArrowDown, MousePointerClick, ArrowUp, Keyboard, Home, User, Mail, Settings, HelpCircle, Volume2, Flame } from 'lucide-react';
import { TopNavBar } from "@/app/components/TopNavBar";
import useSoundEffect from "@/hooks/useSoundEffect";

// This is a test page used as a playground for new features
export default function TestPage() {
  const router = useRouter();
  const [parallaxEnabled, setParallaxEnabled] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollablePage, setScrollablePage] = useState(true);
  const [showEnterButton, setShowEnterButton] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  
  // Add portal sound effect
  const portalSound = useSoundEffect('/sounds/portal.mp3');
  const hoverSound = useSoundEffect('/sounds/hover.mp3');

  // Listen for the toggle-parallax event
  useEffect(() => {
    const handleToggleParallax = () => {
      setParallaxEnabled(prev => !prev);
    };
    
    document.addEventListener('toggle-parallax', handleToggleParallax);
    
    return () => {
      document.removeEventListener('toggle-parallax', handleToggleParallax);
    };
  }, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollPosition(newScrollY);
      
      // Check if we're actually able to scroll
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      setScrollablePage(maxScroll > 10); // Page is scrollable if there's more than 10px to scroll
    };
    
    // Add passive event listeners for performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Reduce scroll amount for even smoother movement
      const scrollAmount = window.innerHeight / 6;
      
      // Arrow Down, Page Down, or Space key to scroll down
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth'
        });
        e.preventDefault();
      }
      
      // Arrow Up, Page Up to scroll up
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        window.scrollBy({
          top: -scrollAmount,
          behavior: 'smooth'
        });
        e.preventDefault();
      }
      
      // Home key to go to top
      if (e.key === 'Home') {
        scrollToTop();
        e.preventDefault();
      }
      
      // End key to go to bottom
      if (e.key === 'End') {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Smoother scroll down
  const scrollDown = () => {
    window.scrollTo({
      top: window.innerHeight / 3, // Even smaller scroll for smoother experience
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleToggleAudio = () => {
    setIsAudioPlaying(prev => !prev);
    // TODO: Add actual audio playback logic here
  };
  
  const handleEnterWorld = () => {
    // Activate portal effect
    setPortalActive(true);
    
    // Play portal sound before navigating
    portalSound.play();
    
    // Small delay to let the sound play before navigating
    setTimeout(() => {
      router.push('/');
    }, 1200); // Increased delay to show the effect
  };

  return (
    <div className="relative w-full overflow-auto"> {/* This wrapper ensures scrollbars are shown */}
      {/* Portal effect overlay */}
      <div 
        className={`fixed inset-0 z-[100] pointer-events-none transition-opacity duration-1000 ${
          portalActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, rgba(147, 51, 234, 0.7) 0%, rgba(17, 24, 39, 0.9) 100%)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/60 
            ${portalActive ? 'animate-grow' : ''}`}
          ></div>
        </div>
      </div>

      {/* Top Header Navigation using the new component */}
      <TopNavBar 
        tokenBalance={0}
        streakCount={2} 
        multiplier={1.5}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
      />

      <main className="flex flex-col min-h-[300vh] w-full pt-16"> {/* Added padding-top to account for the header */}
        {parallaxEnabled ? <AdvancedCssBackground /> : <StaticBackground />}
        
        {/* Intro Section with Scroll Down Prompt */}
        <div className="flex items-center justify-center h-screen w-full">
          <div className="text-center p-6 bg-black/50 backdrop-blur-md rounded-xl max-w-xl">
            <h1 className="text-4xl font-bold mb-4 text-white font-serif tracking-wide uppercase"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.6)',
                  fontFamily: 'var(--font-cinzel)',
                  letterSpacing: '0.1em',
                  color: '#f5deb3',
                  borderBottom: '2px solid rgba(180, 83, 9, 0.5)',
                  paddingBottom: '0.5rem'
                }}>
              World of Garu
            </h1>
            <p className="mb-8 text-zinc-200">Welcome to the immersive parallax experience. Scroll down to see the information panels.</p>
            
            <div className="text-sm text-yellow-300 mb-4">
              You can scroll with: Mouse wheel, touchpad, touch screen, or using the button below
            </div>
            
            <div className="flex flex-col items-center">
              <button 
                onClick={scrollDown}
                className="px-4 py-2 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors animate-bounce mb-4"
              >
                Scroll Down <ArrowDown className="ml-2 h-4 w-4" />
              </button>
              
              <div className="text-xs text-zinc-400 flex items-center mt-2">
                <Keyboard className="h-3 w-3 mr-1" /> You can also use arrow keys or Page Down/Up
              </div>
            </div>
          </div>
        </div>
        
        {/* Middle Section - this will be visible after scrolling - Use fixed positioning for sidebars */}
        <div className="w-full h-screen relative px-4 py-20">
          {/* Left Sidebar - Latest Updates - Fixed to the left edge */}
          <div className="fixed left-4 top-1/2 transform -translate-y-1/2 w-72 z-10 max-h-[90vh] overflow-auto">
            <LatestNews />
          </div>
          
          {/* Center Column - Main Content */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-black/50 backdrop-blur-md rounded-xl max-w-xl">
              <h1 className="text-2xl font-bold mb-4">Background Test Page</h1>
              <p className="mb-2">Current mode: {parallaxEnabled ? 'Dynamic Parallax' : 'Static Background'}</p>
              <p className="mb-4 text-sm text-zinc-300">Scroll position: {scrollPosition.toFixed(0)}px</p>
              
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button 
                  onClick={() => setParallaxEnabled(prev => !prev)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Toggle Background Mode
                </button>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                >
                  <ArrowUp className="mr-2 h-4 w-4" /> Back to Top
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Daily Login & GM Chat - Fixed to the right edge */}
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-72 z-10 max-h-[90vh] overflow-auto">
            <div className="mb-4">
              <DailyLogin 
                streak={2}
                claimedDays={[1, 2]}
                currentDay={3}
                todayReward="1.5x"
                nextReward="2x"
                onClaim={() => {}}
              />
            </div>
            <div>
              <GMChatWindow />
            </div>
          </div>
        </div>
        
        {/* Empty space for scrolling */}
        <div className="h-[100vh]"></div>
        
        {/* Enter World Button - Fixed in the center with fade-in animation */}
        <div className={`fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                          transition-all duration-700 ease-in-out
                          ${showEnterButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
          <button
            onClick={handleEnterWorld}
            onMouseEnter={() => hoverSound.play()}
            className="px-10 py-5 bg-gradient-to-b from-amber-700 to-amber-900 text-amber-200 
                     border-4 border-amber-600 rounded-sm text-xl font-serif uppercase tracking-widest
                     shadow-lg transform hover:scale-105 relative
                     transition-transform duration-300 hover:text-amber-100
                     before:content-[''] before:absolute before:inset-0 before:border-2 before:border-amber-500/30 before:m-1
                     after:content-[''] after:absolute after:top-0 after:left-0 after:right-0 after:bottom-0 after:bg-amber-500/10"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              boxShadow: '0 0 20px rgba(180, 83, 9, 0.4), inset 0 0 10px rgba(251, 191, 36, 0.2)'
            }}
          >
            <span className="relative z-10 flex items-center justify-center">
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 12L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Enter World
            </span>
          </button>
        </div>
        
        {/* Bottom Dock */}
        <div className="w-full fixed bottom-0 left-0 right-0 flex justify-center">
          <AppleStyleDock />
        </div>
        
        {/* Toggle Switch */}
        <div 
          className="fixed bottom-4 left-4 bg-black/80 p-2 rounded cursor-pointer z-50 text-xs text-white"
          onClick={() => setParallaxEnabled(prev => !prev)}
        >
          {parallaxEnabled ? 'Switch to Static' : 'Switch to Parallax'}
        </div>
      </main>
    </div>
  );
} 