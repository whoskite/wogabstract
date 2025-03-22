import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useActiveAccount, useConnectModal } from 'thirdweb/react';
import { client } from '@/app/client';
import { createPortal } from 'react-dom';

interface DailyLoginProps {
  streak: number;
  claimedDays: number[];
  currentDay: number;
  todayReward: string;
  nextReward: string;
  onClaim: () => void;
  onWalletConnect?: () => void;
  isWeeklyMilestone?: boolean;
  startDay?: number;
  endDay?: number;
}

// Add animation styles
const animationStyles = `
  @keyframes pulseBlue {
    0% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
      border-color: rgba(59, 130, 246, 0.6);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
      border-color: rgba(59, 130, 246, 1);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      border-color: rgba(59, 130, 246, 0.6);
    }
  }
  
  @keyframes pulseGold {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.5);
      border-color: rgba(255, 215, 0, 0.6);
    }
    70% {
      box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
      border-color: rgba(255, 215, 0, 1);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
      border-color: rgba(255, 215, 0, 0.6);
    }
  }
  
  .animated-day {
    animation: pulseBlue 2s infinite cubic-bezier(0.66, 0, 0.3, 1);
  }
  
  .animated-milestone {
    animation: pulseGold 2s infinite cubic-bezier(0.66, 0, 0.3, 1);
  }
`;

const DailyLogin: React.FC<DailyLoginProps> = ({
  streak = 0,
  claimedDays = [],
  currentDay = 1,
  todayReward = '1.5x',
  nextReward = '2x',
  onClaim,
  onWalletConnect,
  isWeeklyMilestone = false,
  startDay = 1,
  endDay = 7
}) => {
  const MAX_DAYS = 7;
  const days = Array.from({ length: MAX_DAYS }, (_, i) => startDay + i);
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  const { play: playRewardSound } = useSoundEffect('/sounds/notification.mp3');
  
  // Get wallet connection status
  const account = useActiveAccount();
  const connectModal = useConnectModal();
  
  const isClaimed = claimedDays.includes(currentDay);
  const isWalletConnected = !!account;
  
  // State for reward popup
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [showWeeklyMilestonePopup, setShowWeeklyMilestonePopup] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [claimedDayNumber, setClaimedDayNumber] = useState(1);
  
  // Add cooldown timer state for testing
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [canClaim, setCanClaim] = useState(true);
  
  // Inject animation styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = animationStyles;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldownTimer > 0) {
      interval = setInterval(() => {
        setCooldownTimer(prev => {
          if (prev <= 1) {
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownTimer]);
  
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
    } else if (!isClaimed && canClaim) {
      // Save the current day that is being claimed for the popup
      setClaimedDayNumber(currentDay);
      
      // Claim if connected and not already claimed
      onClaim();
      
      // Check if this is day 7 (weekly milestone)
      if (currentDay === 7) {
        // Show the weekly milestone popup
        setShowWeeklyMilestonePopup(true);
      } else {
        // Show regular reward popup
        setShowRewardPopup(true);
      }
      playRewardSound();
      
      // Start cooldown timer for testing (20 seconds)
      setCooldownTimer(20);
      setCanClaim(false);
    }
  };

  return (
    <>
      <div className="w-72 bg-zinc-900/95 border border-neon-blue/40 rounded-lg p-4 relative overflow-hidden shadow-neon-blue">
        {/* Header */}
        <div className="mb-3 text-center">
          <h3 className="text-xl font-bold text-white text-shadow">DAILY LOGIN</h3>
          <p className="text-sm text-blue-300">Current Streak: <span className="text-neon-green font-bold">{streak}</span> day{streak !== 1 ? 's' : ''}</p>
          <p className="text-xs text-zinc-400">Next available: Day {currentDay}</p>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 w-full bg-zinc-800 mb-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-blue to-neon-pink" 
            style={{ width: `${(streak / endDay) * 100}%` }}
          />
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {days.map((day, index) => {
            const isCurrentDay = !isClaimed && currentDay === day;
            const isNextDay = isClaimed && day === currentDay + 1;
            const isClaimedDay = claimedDays.includes(day);
            const isWaitingPeriod = !canClaim;
            const isMilestoneDay = day === 7 || day === 14 || day === 21 || day === 28;
            
            return (
              <div 
                key={index}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-md text-xs font-bold transition-all duration-300
                  ${isMilestoneDay 
                    ? isNextDay || isCurrentDay
                      ? 'bg-yellow-900/30 border-2 border-yellow-500 text-yellow-300 animated-milestone'
                      : isClaimedDay
                        ? 'bg-green-900/30 border border-green-500/50 text-green-400'
                        : 'bg-yellow-900/30 border border-yellow-500/30 text-yellow-500/70'
                    : isNextDay 
                      ? isWaitingPeriod
                        ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-500'
                        : 'bg-neon-blue/20 border border-neon-blue text-white animated-day'
                      : isCurrentDay
                        ? isWaitingPeriod
                          ? 'bg-zinc-800/50 border border-zinc-700 text-zinc-500'
                          : 'bg-neon-blue/20 border border-neon-blue text-white animated-day'
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
          disabled={(isClaimed && isWalletConnected) || (!canClaim && isWalletConnected)}
          onMouseEnter={playHoverSound}
          className={`
            w-full py-2 px-4 rounded-md font-bold text-sm uppercase tracking-wider
            relative overflow-hidden
            ${isClaimed && isWalletConnected
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
              : !isWalletConnected
                ? 'bg-[#FFC107] hover:bg-[#FFB000] text-black'
                : !canClaim
                  ? 'bg-zinc-700 text-zinc-400'
                  : isWeeklyMilestone
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:shadow-amber-500 transition-all duration-300'
                    : 'bg-gradient-to-r from-neon-blue to-neon-pink text-white hover:shadow-neon-pink transition-all duration-300'}
          `}
        >
          {!isClaimed && isWalletConnected && canClaim && (
            <span className="absolute inset-0 w-full h-full bg-white/20 animate-shine" />
          )}
          {isClaimed && isWalletConnected
            ? 'CLAIMED' 
            : !isWalletConnected 
              ? 'CONNECT WALLET' 
              : !canClaim
                ? `CLAIM IN ${cooldownTimer}s`
                : isWeeklyMilestone
                  ? 'CLAIM WEEKLY REWARD'
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
      
      {/* Render popup using portal to ensure it's at the root level */}
      {showRewardPopup && isMounted && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowRewardPopup(false)}></div>
          <div className="relative bg-zinc-900 border-2 border-neon-pink rounded-lg p-6 text-center w-96 max-w-[90vw] shadow-2xl shadow-neon-pink/30 animate-scaleUp z-[10000]">
            <div className="absolute -top-3 -right-3">
              <button 
                onClick={() => setShowRewardPopup(false)}
                className="bg-zinc-800 rounded-full p-1.5 text-white hover:bg-red-600 hover:text-white transition-colors border border-zinc-600 shadow-lg"
                aria-label="Close popup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-2 flex justify-center">
              <div className="animate-bounce inline-block bg-neon-green/10 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Reward Claimed!</h2>
            <div className="flex justify-center items-center space-x-1 mb-5">
              <span className="text-sm text-zinc-300">Day</span>
              <span className="text-2xl font-bold bg-neon-blue/20 border border-neon-blue rounded-md px-2 py-1 text-white">{claimedDayNumber}</span>
              <span className="text-2xl">✓</span>
            </div>
            
            <div className="p-4 bg-zinc-800/80 rounded-md mb-5 border border-zinc-700">
              <p className="text-zinc-400 text-sm">Daily Reward</p>
              <p className="text-4xl font-bold text-neon-pink">{todayReward}</p>
              <p className="text-sm text-blue-300">multiplier</p>
            </div>
            
            <p className="text-sm text-zinc-400">Keep the streak for bigger rewards!</p>
            
            {/* Confetti-like decorations */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-neon-blue/40 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-neon-pink/40 rounded-full blur-lg animate-pulse"></div>
            <div className="absolute top-1/4 right-0 w-3 h-3 bg-neon-green rounded-full"></div>
            <div className="absolute bottom-1/4 left-0 w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="absolute top-1/2 left-2 w-2 h-2 bg-neon-blue rounded-full"></div>
            <div className="absolute bottom-1/3 right-4 w-2 h-2 bg-neon-pink rounded-full"></div>
          </div>
        </div>,
        document.body
      )}
      
      {/* Weekly Milestone Popup - Special celebration for 7 days */}
      {showWeeklyMilestonePopup && isMounted && createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowWeeklyMilestonePopup(false)}></div>
          <div className="relative bg-zinc-900 border-2 border-yellow-500 rounded-lg p-8 text-center w-[450px] max-w-[95vw] shadow-2xl shadow-yellow-500/30 animate-scaleUp z-[10000]">
            <div className="absolute -top-3 -right-3">
              <button 
                onClick={() => setShowWeeklyMilestonePopup(false)}
                className="bg-zinc-800 rounded-full p-1.5 text-white hover:bg-red-600 hover:text-white transition-colors border border-zinc-600 shadow-lg"
                aria-label="Close popup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Trophy icon */}
            <div className="mb-4 flex justify-center">
              <div className="animate-bounce inline-block bg-yellow-500/20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M5 3h14M5 3a2 2 0 00-2 2v2c0 1.1.9 2 2 2m14-4a2 2 0 012 2v2c0 1.1-.9 2-2 2m-7 14v-1a3 3 0 00-3-3H7m14-3a2 2 0 01-2 2H5a2 2 0 01-2-2v-5h2v3a1 1 0 001 1h12a1 1 0 001-1v-3h2v5z" />
                </svg>
              </div>
            </div>
            
            {/* Milestone celebration text */}
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Weekly Milestone!</h2>
            <div className="flex justify-center items-center space-x-1 mb-6">
              <span className="text-xl text-yellow-200 font-semibold">You&apos;ve completed</span>
              <span className="text-3xl font-bold bg-yellow-600/30 border-2 border-yellow-500 rounded-md px-3 py-1 text-yellow-300">1 Week</span>
            </div>
            
            {/* Reward box */}
            <div className="p-5 bg-zinc-800/80 rounded-md mb-6 border border-yellow-500/30">
              <p className="text-yellow-200 text-lg mb-1">Milestone Reward</p>
              <p className="text-5xl font-bold text-yellow-400 mb-1">{nextReward}</p>
              <p className="text-lg text-yellow-200">multiplier boost</p>
            </div>
            
            <div className="mb-2 px-4 py-2 bg-yellow-900/20 border border-yellow-500/20 rounded-md">
              <p className="text-lg text-yellow-200">Keep logging in daily to unlock even better rewards!</p>
            </div>
            
            {/* Confetti-like decorations */}
            <div className="absolute -top-10 -left-10 w-20 h-20 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 bg-yellow-500/30 rounded-full blur-xl animate-pulse"></div>
            
            {/* Star decorations */}
            <div className="absolute top-1/4 -right-2 w-4 h-4 bg-yellow-400 rotate-45"></div>
            <div className="absolute bottom-1/4 -left-2 w-4 h-4 bg-yellow-400 rotate-45"></div>
            <div className="absolute top-2/3 right-10 w-3 h-3 bg-yellow-400 rotate-45"></div>
            <div className="absolute top-1/3 left-10 w-3 h-3 bg-yellow-400 rotate-45"></div>
            <div className="absolute top-10 left-1/3 w-2 h-2 bg-yellow-400 rotate-45"></div>
            <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-yellow-400 rotate-45"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

// Add keyframe animation for popup
const styles = `
@keyframes scaleUp {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  70% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleUp {
  animation: scaleUp 0.4s ease-out forwards;
}
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default DailyLogin; 