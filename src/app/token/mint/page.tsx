"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useActiveAccount, useDisconnect, useActiveWallet } from "thirdweb/react";
import { Navbar } from "../../components/Navbar";
import { AppleStyleDock } from '@/components/AppleStyleDock';
import useBackgroundMusic from '@/hooks/useBackgroundMusic';
import useSoundEffect from '@/hooks/useSoundEffect';
import { Volume2, VolumeX, LogOut, Flame, Zap } from "lucide-react";
import { abstractTestnet } from "thirdweb/chains";
import { ConnectButton } from "../../components/ui/ConnectButton";
import { NFT_CONTRACT_ADDRESS } from "@/const/contractAddresses";

export default function MintPage() {
  const [mintAmount, setMintAmount] = useState(1);
  const [nftImageUrl, setNftImageUrl] = useState<string>("/img/19.GIF");
  const [isGlitching, setIsGlitching] = useState(false);
  const [totalMinted, setTotalMinted] = useState(5);
  const [maxSupply, setMaxSupply] = useState(5);
  const [nftPrice, setNftPrice] = useState(0.0001); // In ETH
  const [streakCount, setStreakCount] = useState(3);
  const [tokenBalance, setTokenBalance] = useState(0.007); // ETH balance
  const [multiplier, setMultiplier] = useState(1.5);
  
  // Account management
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const disconnect = useDisconnect();
  
  // Sound effects
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  const { play: playSelectSound } = useSoundEffect('/sounds/click.mp3');
  
  // Background music
  const { isPlaying, play: playBgMusic, stop: stopBgMusic } = 
    useBackgroundMusic('/sounds/lofi.mp3', 0.05);
    
  // Toggle music function
  const toggleMusic = () => {
    playSelectSound();
    if (isPlaying) {
      stopBgMusic();
    } else {
      playBgMusic();
    }
  };
  
  // Handle disconnect
  const handleDisconnect = () => {
    playSelectSound();
    if (wallet) {
      disconnect.disconnect(wallet);
    }
  };
  
  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);
  
  // Increment/decrement functions
  const increment = () => {
    if (mintAmount < maxSupply) {
      playSelectSound();
      setMintAmount(prevAmount => prevAmount + 1);
    }
  };
  
  const decrement = () => {
    if (mintAmount > 1) {
      playSelectSound();
      setMintAmount(prevAmount => prevAmount - 1);
    }
  };
  
  // Handle mint function
  const handleMint = () => {
    playSelectSound();
    // This would typically call your actual minting function
    alert('Minting functionality would be implemented here');
  };
  
  return (
    <div className="flex min-h-screen flex-col bg-darker-bg text-white overflow-hidden relative">
      {/* Background effects */}
      <div className="background-gradient"></div>
      <div className="background-grid"></div>
      <div className="noise-overlay"></div>
      
      {/* Floating Top Navigation Bar */}
      <div className="fixed top-0 inset-x-0 z-50 px-4 py-2">
        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-zinc-700 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="font-bold text-white text-lg">WORLD OF GARU</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Music Control */}
            <button 
              onClick={toggleMusic}
              className="flex items-center bg-zinc-800/80 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-700/80"
              title={isPlaying ? "Mute Music" : "Play Music"}
            >
              {isPlaying ? (
                <Volume2 className="h-4 w-4 text-green-500" />
              ) : (
                <VolumeX className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            
            {/* Streak Counter */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg px-2 py-1">
              <Flame className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-white text-xs font-medium">{streakCount} day streak</span>
            </div>
            
            {/* Multiplier with Token Balance */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg px-2 py-1">
              <Zap className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-white text-xs font-medium">{multiplier}x</span>
              {tokenBalance && (
                <span className="ml-2 text-xs font-medium bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">
                  {tokenBalance.toFixed(4)} ETH
                </span>
              )}
            </div>
            
            {/* User Profile */}
            {account ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden md:block">
                  <div className="text-sm text-white/70">{account.address.slice(0, 6)}...{account.address.slice(-4)}</div>
                  <div className="text-xs text-yellow-400/90 font-medium">{tokenBalance.toFixed(4)} ETH</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-xs font-bold border border-zinc-500">
                  {account.address.slice(0, 2)}
                </div>
                {/* Sign Out Button */}
                <button 
                  onClick={handleDisconnect} 
                  className="md:ml-1 p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-full transition-colors group"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                </button>
              </div>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <main className="flex-1 w-full flex justify-center items-center px-4 py-24">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* NFT Image */}
          <div className="rounded-lg overflow-hidden border-2 border-neon-pink p-1 bg-black">
            <div className="relative aspect-square">
              <Image 
                src={nftImageUrl}
                alt="World of Garu NFT"
                fill
                className={`object-cover ${isGlitching ? 'glitch-effect' : ''}`}
                priority
              />
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold">
                WORLD OF GARU
              </div>
            </div>
          </div>
          
          {/* Mint Interface */}
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-lg p-6 border border-zinc-800">
            <h1 className="text-3xl font-bold mb-8">Mint Your NFT</h1>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <button 
                onClick={decrement}
                className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-l-lg text-2xl transition-colors"
                onMouseEnter={playHoverSound}
              >
                -
              </button>
              <div className="w-16 h-12 flex items-center justify-center bg-zinc-800 text-xl font-bold">
                {mintAmount}
              </div>
              <button 
                onClick={increment}
                className="w-12 h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-r-lg text-2xl transition-colors"
                onMouseEnter={playHoverSound}
              >
                +
              </button>
            </div>
            
            {/* Price Information */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Price per NFT:</span>
                <span className="font-bold">{nftPrice.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantity:</span>
                <span className="font-bold">{mintAmount}</span>
              </div>
              <div className="h-px bg-zinc-700 my-2"></div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total:</span>
                <span className="font-bold text-yellow-400">{(nftPrice * mintAmount).toFixed(4)} ETH</span>
              </div>
            </div>
            
            {/* Supply Information */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-zinc-400">Supply:</span>
                <span className="font-bold">{totalMinted} / {maxSupply}</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-neon-pink to-neon-purple"
                  style={{ width: `${(totalMinted / maxSupply) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Collection Information */}
            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-bold mb-2">World of Garu Collection</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Each NFT is a unique digital collectible in the World of Garu universe. Own a piece
                of this exclusive collection on Abstract Testnet.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400">Traits:</div>
                  <div className="font-bold">5+</div>
                </div>
                <div>
                  <div className="text-zinc-400">Rarity:</div>
                  <div className="font-bold text-yellow-400">Legendary</div>
                </div>
                <div>
                  <div className="text-zinc-400">Edition:</div>
                  <div className="font-bold">1 of 5</div>
                </div>
              </div>
            </div>
            
            {/* Mint Button */}
            <button
              onClick={handleMint}
              className="w-full py-4 px-6 bg-gradient-to-r from-neon-pink to-neon-purple rounded-lg font-bold text-lg shadow-glow transition-all hover:shadow-glow-xl hover:opacity-90"
              onMouseEnter={playHoverSound}
            >
              Mint Now ({nftPrice.toFixed(4)} ETH)
            </button>
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <AppleStyleDock />
      </div>
      
      {/* Music Control - Mobile Only */}
      <button 
        onClick={toggleMusic}
        className="md:hidden fixed bottom-6 right-6 z-30 flex items-center justify-center w-10 h-10 bg-black/60 rounded-full border border-zinc-700 transition-colors hover:bg-black/80"
        title={isPlaying ? "Mute Music" : "Play Music"}
      >
        {isPlaying ? (
          <Volume2 className="h-5 w-5 text-neon-blue" />
        ) : (
          <VolumeX className="h-5 w-5 text-zinc-400" />
        )}
      </button>
    </div>
  );
} 