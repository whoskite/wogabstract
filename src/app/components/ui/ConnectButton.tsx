import React from 'react';
import { ConnectWalletButton } from '../ConnectWalletButton';
import { useActiveAccount, useDisconnect, useActiveWallet, useConnectModal } from 'thirdweb/react';
import { client } from '../../client';
import useSoundEffect from '@/hooks/useSoundEffect';

interface ConnectButtonProps {
  size?: 'default' | 'compact';
}

export function ConnectButton({ size = 'default' }: ConnectButtonProps) {
  const isCompact = size === 'compact';
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const connectModal = useConnectModal();
  const disconnect = useDisconnect();
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  
  const handleConnect = () => {
    // Play click sound
    playClickSound();
    
    if (account) {
      // If already connected, do nothing or show account info
      return;
    }
    
    // Use the connect method with client parameter
    connectModal.connect({
      client: client
    });
  };
  
  return (
    <div className={`relative ${isCompact ? 'scale-90' : ''}`}>
      <ConnectWalletButton
        onClick={handleConnect}
        isConnected={!!account}
        isCompact={isCompact}
        onMouseEnter={playHoverSound}
      />
    </div>
  );
} 