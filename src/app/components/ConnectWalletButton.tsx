import React from 'react';

interface ConnectWalletButtonProps {
  onClick: () => void;
  onMouseEnter?: () => void;
  isConnected?: boolean;
  isCompact?: boolean;
}

export function ConnectWalletButton({ 
  onClick, 
  onMouseEnter,
  isConnected = false,
  isCompact = false
}: ConnectWalletButtonProps) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        ${isCompact ? 'py-1.5 px-3 text-sm' : 'py-2 px-5 text-base'}
        ${isConnected 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-[#FFC107] hover:bg-[#FFB000] text-black'}
        font-bold rounded-md transition-all duration-200 
        flex items-center justify-center whitespace-nowrap
      `}
    >
      {isConnected ? 'Wallet Connected' : 'Connect Wallet'}
    </button>
  );
} 