import React from 'react';
import Image from 'next/image';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useActiveAccount, useConnectModal } from 'thirdweb/react';
import { client } from '@/app/client';

interface DailyLoginProps {
  streak: number;
  claimedDays: number[];
  currentDay: number;
  todayReward: string;
  nextReward: string;
  onClaim: () => void;
  onWalletConnect?: () => void;
}

const DailyLogin: React.FC<DailyLoginProps> = ({
  streak = 0,
  claimedDays = [],
  currentDay = 1,
  todayReward = '1.5x',
  nextReward = '2x',
  onClaim,
  onWalletConnect
}) => {
  const MAX_DAYS = 7;
  const days = Array.from({ length: MAX_DAYS }, (_, i) => i + 1);
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  
  // Get wallet connection status
  const account = useActiveAccount();
  const connectModal = useConnectModal();
  
  const isClaimed = claimedDays.includes(currentDay);
  const isWalletConnected = !!account;
  
  const handleClaim = () => {
    playClickSound();
    
    if (!isWalletConnected) {
      // Connect wallet if not connected
      connectModal.connect({
        client
      });
      // Notify parent component that we're trying to connect
      if (onWalletConnect) {
        onWalletConnect();
      }
    } else if (!isClaimed) {
      // Claim if connected and not already claimed
      onClaim();
    }
  };

  return (
    <div className="w-72 bg-zinc-900/95 border border-neon-blue/40 rounded-lg p-4 relative overflow-hidden shadow-neon-blue">
      {/* Header */}
      <div className="mb-3 text-center">
        <h3 className="text-xl font-bold text-white text-shadow">DAILY LOGIN</h3>
        <p className="text-sm text-blue-300">Current Streak: <span className="text-neon-green font-bold">{streak}</span></p>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 w-full bg-zinc-800 mb-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-neon-blue to-neon-pink" 
          style={{ width: `${(streak / MAX_DAYS) * 100}%` }}
        />
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {days.map(day => {
          const isCurrentDay = !isClaimed && currentDay === day;
          const isNextDay = isClaimed && day === currentDay + 1;
          const isClaimedDay = claimedDays.includes(day);
          
          return (
            <div 
              key={day}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold transition-all duration-300
                ${isNextDay 
                  ? 'bg-neon-blue/20 border border-neon-blue text-white animate-pulse' 
                  : isCurrentDay
                    ? 'bg-neon-blue/20 border border-neon-blue text-white' 
                    : isClaimedDay
                      ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                      : 'bg-zinc-800/50 border border-zinc-700 text-zinc-400'}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
      
      {/* Today's Reward */}
      <div className="bg-zinc-800/80 p-2 rounded-md mb-3 border border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Today&apos;s Reward</p>
            <p className="text-white font-bold">{todayReward} <span className="text-xs text-blue-300">multiplier</span></p>
          </div>
          <div className="relative w-8 h-8">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                className="text-neon-blue w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={isClaimed && isWalletConnected}
        className={`
          w-full py-2 px-4 rounded-md font-bold text-sm uppercase tracking-wider
          relative overflow-hidden
          ${isClaimed && isWalletConnected
            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
            : !isWalletConnected
              ? 'bg-[#FFC107] hover:bg-[#FFB000] text-black'
              : 'bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:shadow-neon-pink transition-all duration-300'}
        `}
      >
        {!isClaimed && isWalletConnected && (
          <span className="absolute inset-0 w-full h-full bg-white/20 animate-shine" />
        )}
        {isClaimed && isWalletConnected
          ? 'CLAIMED' 
          : !isWalletConnected 
            ? 'CONNECT WALLET' 
            : 'CLAIM REWARD'}
      </button>
      
      {/* Next Reward */}
      <div className="mt-3 text-center">
        <p className="text-xs text-zinc-400">
          {isClaimed ? (
            <>Next reward (Day {currentDay + 1}): <span className="text-neon-pink">{nextReward}</span></>
          ) : (
            <>Next reward: <span className="text-neon-pink">{nextReward}</span></>
          )}
        </p>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-pink"></div>
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-neon-blue/20 rounded-full blur-xl"></div>
      <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-neon-pink/20 rounded-full blur-xl"></div>
    </div>
  );
};

export default DailyLogin; 