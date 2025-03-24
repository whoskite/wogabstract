"use client";

import { useState, useEffect } from 'react';
import { Flame, Volume2, VolumeX, Zap } from 'lucide-react';
import { ConnectButton } from "@/app/components/ui/ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import Link from 'next/link';
import useSoundEffect from '@/hooks/useSoundEffect';

interface TopNavBarProps {
  tokenBalance?: number | null;
  streakCount?: number;
  multiplier?: number;
  onToggleAudio?: () => void;
  isAudioPlaying?: boolean;
  onDisconnect?: () => void;
}

export function TopNavBar({
  tokenBalance = 0,
  streakCount = 2,
  multiplier = 1.5,
  onToggleAudio = () => {},
  isAudioPlaying = false,
  onDisconnect = () => {},
}: TopNavBarProps) {
  const account = useActiveAccount();
  const [scrolled, setScrolled] = useState(false);
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleAudioToggle = () => {
    playClickSound();
    onToggleAudio();
  };

  return (
    <div className="fixed top-0 inset-x-0 z-50 px-4 py-2">
      <div className={`bg-black/80 backdrop-blur-md rounded-xl border border-zinc-800/40 p-2 flex items-center justify-between shadow-lg ${scrolled ? 'border-zinc-700/30' : 'border-transparent'}`}>
        <div className="flex items-center">
          <Link 
            href="/" 
            className="font-bold text-white text-lg hover:opacity-80 transition-opacity" 
            onMouseEnter={playHoverSound}
            style={{
              fontFamily: 'var(--font-cinzel)',
              letterSpacing: '0.1em',
              color: '#f5deb3',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            WORLD OF GARU
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Audio toggle button */}
          <button 
            onClick={handleAudioToggle}
            onMouseEnter={playHoverSound}
            className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
            title={isAudioPlaying ? "Mute Audio" : "Play Audio"}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>
          
          {/* Streak counter */}
          <div className="flex items-center bg-black/40 rounded-full px-3 py-1 text-white text-sm">
            <Flame className="w-4 h-4 text-orange-500 mr-1" /> 
            <span>{streakCount} day streak</span>
          </div>
          
          {/* Multiplier */}
          <div className="flex items-center bg-black/40 rounded-full px-3 py-1 text-white text-sm">
            <Zap className="h-4 w-4 text-yellow-400 mr-1" />
            {multiplier}x
          </div>
          
          {/* Token amount */}
          <div className="flex items-center bg-black/40 rounded-full px-3 py-1 text-white text-sm">
            {tokenBalance !== null ? tokenBalance.toFixed(2) : "0.00"} GARU
          </div>
          
          {/* Connect wallet button or account info */}
          {account ? (
            <div className="flex items-center gap-2">
              <div className="text-right hidden md:block">
                <div className="text-sm text-white/70">{account.address.slice(0, 6)}...{account.address.slice(-4)}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-bold border border-zinc-500">
                {account.address.slice(0, 2)}
              </div>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </div>
  );
} 