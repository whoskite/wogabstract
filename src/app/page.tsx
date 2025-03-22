"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { useActiveAccount, useActiveWallet, useDisconnect, ThirdwebProvider } from "thirdweb/react";
import { abstractTestnet } from "thirdweb/chains";
import { getContract, readContract, sendTransaction } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import Image from "next/image";
import { client } from "./client";
import { getContractURI, getNFTImageUrl, getMaxSupply, getTokenBalance, getValidMaxSupply, getValidTotalMinted, getOwnedNFTs } from "@/lib/contract";
import { NFT_CONTRACT_ADDRESS } from "@/const/contractAddresses";
import { ConnectButton } from "./components/ui/ConnectButton";
import { BasquiatHeader } from "./components/BasquiatHeader";
import { OffWhiteHero } from "./components/OffWhiteHero";
import { NFTCollection } from "./components/NFTCollection";
import { AppleStyleDock } from '@/components/AppleStyleDock';
import { LogOut, Flame, Zap, Volume2, VolumeX, Loader2, Check, X, CheckCircle2, AlertCircle } from "lucide-react";
import { TransactionModal } from '@/components/TransactionModal';
import useBackgroundMusic from '../hooks/useBackgroundMusic';
import useSoundEffect from '../hooks/useSoundEffect';
import useSuccessSound from '../hooks/useSuccessSound';
import useErrorSound from '../hooks/useErrorSound';
import DailyLogin from '@/components/DailyLogin';
import LatestNews from '@/components/LatestNews';

// Custom CSS for toast notifications
const styles = `
  /* Toast notification animations */
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }
  
  .toast-enter {
    animation: slideDown 0.3s ease forwards;
  }
  
  .toast-exit {
    animation: slideUp 0.3s ease forwards;
  }
  
  .toast-notification {
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: pulse 2s infinite;
    min-width: 280px;
  }
`;

// Toast notification type
type ToastType = 'success' | 'error' | 'info';

// Toast notification interface
interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

// Main component
function DappContent() {
  // Sound effects
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');
  const { play: playSelectSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playNotificationSound } = useSuccessSound('/sounds/notification.mp3');
  const { play: playErrorSound } = useErrorSound('/sounds/Error.wav');
  
  // Background music
  const { isPlaying, volume, setVolume, play: playBgMusic, stop: stopBgMusic } = 
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

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show toast notification
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 4000) {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    if (type === 'success') {
      playNotificationSound();
    } else if (type === 'error') {
      playErrorSound();
    }
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }

  // State variables
  const [mintAmount, setMintAmount] = useState(1);
  const [nftPrice, setNftPrice] = useState(0.01); // In ETH
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [totalMinted, setTotalMinted] = useState<number>(3);  // Default value
  const [maxSupply, setMaxSupply] = useState<number>(5);      // Default value
  const [isGlitching, setIsGlitching] = useState(false);
  const [nftImageUrl, setNftImageUrl] = useState<string>("/img/19.GIF");  // Default value
  const [imageLoading, setImageLoading] = useState(false);  // Start as false
  const [showCollection, setShowCollection] = useState(false);
  const [showMintInterface, setShowMintInterface] = useState(true);
  // Add new state variables for transaction status
  const [txStatus, setTxStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [txMessage, setTxMessage] = useState<string>('');
  // Add state variable for controlling the central status modal
  const [showTxModal, setShowTxModal] = useState(false);
  // Add new state variables for stats
  const [streakCount, setStreakCount] = useState(3);
  const [multiplier, setMultiplier] = useState(1.5);
  // Add page loading state
  const [isPageLoading, setIsPageLoading] = useState(false);  // Start as false
  // Add transaction overlay states
  const [showTxOverlay, setShowTxOverlay] = useState(false);
  // Add state variables for minted token tracking
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [mintedTokenImageUrl, setMintedTokenImageUrl] = useState<string | null>(null);
  // Add token balance state
  const [tokenBalance, setTokenBalance] = useState<number>(15.75);  // Default value
  // Add this to the state variables section
  const [inventoryNFTs, setInventoryNFTs] = useState<any[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Add state for daily login
  const [streak, setStreak] = useState(3);
  const [claimedDays, setClaimedDays] = useState<number[]>([1, 2]);
  const [currentDay, setCurrentDay] = useState(3);
  const [todayReward, setTodayReward] = useState('1.5x');
  const [nextReward, setNextReward] = useState('2x');
  
  // Get active account
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const disconnect = useDisconnect();

  // Account state
  const [prevAccount, setPrevAccount] = useState<string | null>(null);
  
  // Monitor wallet connections
  useEffect(() => {
    // When wallet is connected and it's different from previous state
    if (account && (!prevAccount || prevAccount !== account.address)) {
      console.log("Showing wallet connected toast");
      showToast(`Wallet connected: ${account.address.slice(0, 6)}...${account.address.slice(-4)}`, 'success');
      setPrevAccount(account.address);
    } 
    // When wallet is disconnected and there was a previous connection
    else if (!account && prevAccount) {
      console.log("Showing wallet disconnected toast");
      showToast(`Wallet disconnected`, 'info');
      setPrevAccount(null);
    }
  }, [account]);

  // Fetch token balance when account changes
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (account) {
        try {
          console.log("Fetching token balance for:", account.address);
          const balance = await getTokenBalance(account.address);
          console.log("Received token balance:", balance);
          setTokenBalance(balance);
        } catch (error) {
          console.error("Error fetching token balance:", error);
          // Use fallback value instead of zero
          setTokenBalance(15.75);
        }
      } else {
        // Instead of null, set to zero or default value
        setTokenBalance(0);
      }
    };

    fetchTokenBalance();
    
    // Set up interval to refresh balance every 30 seconds
    const intervalId = setInterval(fetchTokenBalance, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [account]);

  // Update the fetchOwnedNFTs function to set the state
  useEffect(() => {
    const fetchOwnedNFTs = async () => {
      if (account) {
        try {
          console.log("Fetching owned NFTs for:", account.address);
          const ownedNFTs = await getOwnedNFTs(account.address);
          console.log(`Found ${ownedNFTs.length} owned NFTs:`, ownedNFTs);
          
          // Set the NFTs to state
          setInventoryNFTs(ownedNFTs);
          
          // Update UI based on inventory
          if (ownedNFTs.length > 0) {
            console.log("User owns NFTs from this collection");
          } else {
            console.log("User doesn't own any NFTs from this collection yet");
          }
        } catch (error) {
          console.error("Error fetching owned NFTs:", error);
        }
      }
    };

    fetchOwnedNFTs();
  }, [account]);

  // Function to handle disconnect
  const handleDisconnect = () => {
    playSelectSound();
    if (wallet) {
      disconnect.disconnect(wallet);
    }
  };

  // Update handleViewCollection function
  const handleViewCollection = () => {
    playSelectSound();
    if (inventoryNFTs.length > 0) {
      setShowInventoryModal(true);
    } else {
      // Show toast or notification
      console.log("No NFTs in your inventory yet");
      window.alert("You don't own any NFTs from this collection yet. Mint some to see them here!");
    }
  };

  // Trigger glitch animation
  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 1000);
  };

  // Connect to the contract and read data
  useEffect(() => {
    // Initialize contract and fetch data
    const fetchContractData = async () => {
      try {
        if (!client) {
          console.error("Thirdweb client not initialized");
          return;
        }
        
        const contract = await getContract({
          client,
          chain: abstractTestnet, 
          address: NFT_CONTRACT_ADDRESS
        });
        
        // Fixed price at 0.0001 ETH
        setNftPrice(0.0001);
        
        // Try to read contract data
        try {
          console.log("Reading contract data...");
          
          // Try to get contract URI
          try {
            const contractURI = await getContractURI();
            console.log("Contract URI:", contractURI);
            
            // If we have a contract URI, we can try to fetch metadata
            if (contractURI) {
              try {
                // If the URI is HTTP or IPFS based, fetch the metadata
                if (contractURI.startsWith('http') || contractURI.startsWith('ipfs://')) {
                  const metadataUrl = contractURI.startsWith('ipfs://') 
                    ? contractURI.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                    : contractURI;
                  
                  const response = await fetch(metadataUrl);
                  const metadata = await response.json();
                  console.log("Contract metadata:", metadata);
                }
              } catch (err) {
                console.error("Error fetching contract metadata:", err);
              }
            }
          } catch (err) {
            console.error("Error reading contract URI:", err);
          }
          
          // Try to fetch NFT image URL using our utility function
          try {
            // First try to use a specific placeholder image for a better user experience
            setNftImageUrl("/img/19.GIF");
            
            // Then try to find a valid token
            let imageUrl = null;
            for (let tokenId of [0n, 1n, 2n, 3n]) {
              try {
                imageUrl = await getNFTImageUrl(tokenId);
                if (imageUrl && !imageUrl.includes('/api/nft/')) {
                  // We found a valid token
                  console.log(`Found valid NFT image at token #${tokenId}:`, imageUrl);
                  break;
                }
              } catch (err) {
                console.log(`Token #${tokenId} not available, trying next...`);
              }
            }
            
            if (imageUrl && !imageUrl.includes('/api/nft/')) {
            console.log("NFT Image URL:", imageUrl);
            setNftImageUrl(imageUrl);
            } else {
              // If no valid tokens found, keep using the GIF placeholder
              console.log("No valid NFTs found, using fallback image");
            }
          } catch (err) {
            console.error("Error fetching NFT image:", err);
            // Ensure we always have a fallback image
            if (!nftImageUrl) {
              setNftImageUrl("/img/19.GIF");
            }
          }
          
          // Try to read total supply and max supply using the safer functions
          try {
            // Use our safer functions that return fallbacks on error
            const totalMintedValue = await getValidTotalMinted();
            const maxSupplyValue = await getValidMaxSupply();
            
            setTotalMinted(totalMintedValue);
              setMaxSupply(maxSupplyValue);
            console.log(`Supply: ${totalMintedValue}/${maxSupplyValue}`);
          } catch (err) {
            console.log("Error getting supply info:", err);
            // Set defaults if reading fails
            setTotalMinted(3); // Fallback
            setMaxSupply(3);   // Fallback
          }
          
        } catch (err) {
          console.error("Error reading contract data:", err);
          // Set defaults if reading fails
          setTotalMinted(3); // Always show 3 to match supply in UI
          setMaxSupply(3); // Update default to 3
        }
      } catch (err) {
        console.error("Error initializing contract:", err);
      } finally {
        // Turn off loading state after data fetching is complete
        setTimeout(() => {
          setIsPageLoading(false);
        }, 1500); // Add a slight delay to ensure animation is visible
      }
    };

    fetchContractData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Listen for custom event to return to home view
  useEffect(() => {
    const handleReturnToHome = () => {
      setShowMintInterface(false);
    };
    
    document.addEventListener('return-to-home', handleReturnToHome);
    
    return () => {
      document.removeEventListener('return-to-home', handleReturnToHome);
    };
  }, []);
  
  // Handle minting
  const handleMint = async () => {
    playSelectSound();
    
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setTxHash(null); // Reset transaction hash
    setTxStatus('loading');
    setTxMessage('Processing your transaction...');
    setShowTxModal(true);
    
    // Reset minted token tracking data
    setMintedTokenId(null);
    setMintedTokenImageUrl(null);

    try {
      console.log(`Minting ${mintAmount} NFTs at price ${nftPrice} ETH each`);
      
      // Calculate total price in ETH
      const totalPriceInEth = nftPrice * mintAmount;
      console.log("Total price in ETH:", totalPriceInEth);
      
      if (!wallet || !client) {
        throw new Error("Wallet or Thirdweb client not initialized");
      }
      
      // Get the contract
      console.log("Getting contract at address:", NFT_CONTRACT_ADDRESS);
      const contract = getContract({
        client,
        chain: abstractTestnet,
        address: NFT_CONTRACT_ADDRESS
      });
      
      if (!contract) {
        throw new Error("Failed to initialize contract");
      }
      
      // Calculate exact value to send (price * quantity)
      const valueInWei = BigInt(Math.floor(totalPriceInEth * 1e18)); // Convert ETH to wei
      console.log("Value in wei:", valueInWei.toString());
      
      // Use the claimTo extension from Thirdweb
      console.log("Preparing transaction with claimTo extension...");
      
      // Make the transaction
      try {
        // For public mint contracts
        const transaction = claimTo({
          contract,
          to: account.address,
          quantity: BigInt(mintAmount),
        });
        
        console.log("Transaction prepared:", transaction);
        console.log("Sending transaction...");
        
        // Attach the value separately
        const result = await sendTransaction({
          transaction,
          account,
          // Note: value is handled by contract metadata
        });
        
        console.log("Transaction sent successfully:", result);
        const transactionHash = result.transactionHash;
        console.log("Transaction hash:", transactionHash);
        
        setTxHash(transactionHash);
        setSuccess("NFT minted successfully! It will appear in your wallet soon.");
        setTxStatus('success');
        setTxMessage(`Successfully minted ${mintAmount} NFT${mintAmount > 1 ? 's' : ''}!`);
        playNotificationSound();
        
        // Update the displayed count optimistically
        if (totalMinted !== null) {
          setTotalMinted(totalMinted + mintAmount);
        }
        
        // Try to get the token ID and image of the newly minted NFT
        try {
          // For this example, we'll assume the minted token ID is the current total supply + 1
          // This may need to be adjusted based on how your contract assigns token IDs
          const newTokenId = totalMinted !== null ? totalMinted + 1 : 1;
          setMintedTokenId(newTokenId);
          
          // Get the image URL for the new token
          const imageUrl = await getNFTImageUrl(BigInt(newTokenId));
          console.log("Minted NFT image URL:", imageUrl);
          setMintedTokenImageUrl(imageUrl);
        } catch (imageError) {
          console.error("Error fetching minted NFT image:", imageError);
          // Use the sample NFT image as fallback
          setMintedTokenImageUrl(nftImageUrl);
        }
      } catch (error: any) {
        console.error("ClaimTo failed, trying alternative approach...", error);
        
        // Show error but with guidance
        setError("The automatic minting failed. Please try manual minting through the contract directly on Abstract Scan.");
        setTxStatus('error');
        setTxMessage("Minting method not supported");
        playErrorSound();
        
        // Provide link to contract on Abstract Scan
        const contractUrl = `https://testnet.abstractscan.com/address/${NFT_CONTRACT_ADDRESS}`;
        console.log("Contract URL for manual interaction:", contractUrl);
      }
    } catch (error: any) {
      console.error("Minting error:", error);
      
      // Provide more specific error messages
      if (error.message?.includes("user rejected")) {
        setError("Transaction was rejected. Please try again when you're ready to mint.");
        setTxStatus('error');
        setTxMessage("Transaction was rejected");
      } else if (error.message?.includes("insufficient funds")) {
        setError("You don't have enough funds to complete this transaction. Please add more ETH to your wallet.");
        setTxStatus('error');
        setTxMessage("Insufficient funds");
      } else if (error.message?.includes("JsonRpcEngine")) {
        setError("Connection error with the wallet. Please try refreshing the page or reconnecting your wallet.");
        setTxStatus('error');
        setTxMessage("Wallet connection error");
      } else if (error.message?.includes("gas required exceeds")) {
        setError("Transaction requires too much gas. Try minting fewer NFTs at once.");
        setTxStatus('error');
        setTxMessage("Gas limit exceeded");
      } else if (error.message?.includes("nonce")) {
        setError("Transaction nonce error. Please reset your wallet's transaction history or try again.");
        setTxStatus('error');
        setTxMessage("Transaction sequence error");
      } else {
        setError(error.message || "Error minting NFT. Please try again.");
        setTxStatus('error');
        setTxMessage("Minting failed");
      }
      
      playErrorSound();
    } finally {
      setLoading(false);
      // Keep the modal open for user to see the result
      // Will be closed by user interaction
    }
  };

  // Calculate total price
  const displayTotal = `${(nftPrice * mintAmount).toFixed(4)} ETH`;

  // Handle increment/decrement
  const increment = () => {
    // Calculate the maximum allowed mint amount based on remaining supply
    const remainingSupply = maxSupply !== null && totalMinted !== null 
      ? maxSupply - totalMinted 
      : 0;
    
    // Only allow increment if there's enough remaining supply
    if (mintAmount < Math.min(5, remainingSupply)) {
      playSelectSound();
      setMintAmount(mintAmount + 1);
      triggerGlitch();
    }
  };

  const decrement = () => {
    if (mintAmount > 1) {
      playSelectSound();
      setMintAmount(mintAmount - 1);
      triggerGlitch();
    }
  };

  // Add function to handle daily claim
  const handleDailyClaim = () => {
    // Update streak
    setStreak(prevStreak => prevStreak + 1);
    
    // Update claimed days
    setClaimedDays(prev => [...prev, currentDay]);
    
    // Update multiplier
    setMultiplier(2.0);
    
    // Show success toast notification
    showToast(`🎉 Daily reward claimed! Your multiplier is now 2.0x`, 'success');
    
    // Play notification sound
    playNotificationSound();
  };

  // Handle wallet connect from DailyLogin
  const handleWalletConnect = () => {
    showToast("Connecting wallet...", 'info');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white overflow-x-hidden">
      <style jsx global>{`body { background-color: rgb(24 24 27); }`}</style>
      
      {/* Global toast styles */}
      <style jsx global>{styles}</style>
      
      {/* Toast notifications container */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`toast-enter toast-notification rounded-lg p-3 text-white shadow-lg flex items-center gap-2 max-w-xs
              ${toast.type === 'success' ? 'bg-green-500/90 border border-green-400' : 
                toast.type === 'error' ? 'bg-red-500/90 border border-red-400' : 'bg-blue-500/90 border border-blue-400'}`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <div className="h-5 w-5 flex-shrink-0 rounded-full bg-blue-400 flex items-center justify-center text-xs font-bold">i</div>
            )}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
      
      {/* Header Navigation */}
      <div className="flex min-h-screen flex-col bg-darker-bg text-white overflow-hidden relative">
        {/* Background effects */}
        <div className="background-gradient"></div>
        <div className="background-grid"></div>
        <div className="noise-overlay"></div>
        
        {/* Floating Top Navigation Bar */}
        <div className="fixed top-0 inset-x-0 z-50 px-4 py-2">
          <div className="bg-black/60 backdrop-blur-md rounded-xl border border-zinc-700 p-2 flex items-center justify-between">
            <div className="flex items-center">
              <h2 className="font-bold text-white text-lg">WORLD OF GARU</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Music Control */}
              <button 
                onClick={toggleMusic}
                className="flex items-center bg-zinc-800/80 rounded-lg px-2 py-1 transition-colors hover:bg-zinc-700/80"
                title={isPlaying ? "Mute Music" : "Play Music"}
                onMouseEnter={playHoverSound}
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
                {tokenBalance !== null && (
                  <span className="ml-2 text-xs font-medium bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-md">
                    {tokenBalance.toFixed(2)} GARU
                  </span>
                )}
              </div>
              
              {/* User Profile */}
              {account ? (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-white/70">{account.address.slice(0, 6)}...{account.address.slice(-4)}</div>
                    <div className="text-xs text-yellow-400/90 font-medium">0.0017 ETH</div>
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
        
        {/* Daily Login - Positioned below the navigation bar */}
        <div className="fixed top-20 right-4 z-30 animate-fade-in w-72">
          <DailyLogin 
            streak={streak}
            claimedDays={claimedDays}
            currentDay={currentDay}
            todayReward={todayReward}
            nextReward={nextReward}
            onClaim={handleDailyClaim}
            onWalletConnect={handleWalletConnect}
          />
        </div>
        
        {/* Latest News - Positioned top left below navigation */}
        <div className="fixed top-20 left-4 z-30 animate-fade-in w-72">
          <LatestNews maxArticles={2} />
        </div>

        {/* Main content */}
        <main className="flex-1 flex flex-col pt-24 pb-16">
          {/* Main Content */}
          <div className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-1 gap-8">
            {/* Large NFT Display (full width) */}
            <div>
              <div className="relative overflow-hidden rounded-xl border-2 border-neon-pink">
                {/* Featured NFT Image */}
                <div className="relative aspect-[16/9]">
                  <Image 
                    src={nftImageUrl || "/img/19.GIF"}
                    alt="World of Garu Collection" 
                    fill
                    className={`object-cover ${isGlitching ? 'glitch-effect' : ''}`}
                    priority
                  />
                </div>

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-center p-6 md:p-8 text-center">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">World of Garu Collection</h2>
                    <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
                      Each NFT is a unique digital collectible in the World of Garu universe. Own a piece
                      of this exclusive collection on Abstract Testnet.
                    </p>
                    
                    {/* Stats displayed in a row */}
                    <div className="flex items-center justify-center gap-16 mb-8">
                      <div>
                        <div className="text-zinc-400 text-sm">Minted</div>
                        <div className="text-white font-bold text-xl">{totalMinted}/{maxSupply}</div>
                      </div>
                      <div>
                        <div className="text-zinc-400 text-sm">Price</div>
                        <div className="text-white font-bold text-xl">0.0001 ETH</div>
                      </div>
                      <div>
                        <div className="text-zinc-400 text-sm">Rewards</div>
                        <div className="text-white font-bold text-xl">3/10</div>
                      </div>
                    </div>
                    
                    {/* Mint Now Button */}
                    <button
                      onClick={() => {
                        playSelectSound();
                        window.location.href = '/token/mint';
                      }} 
                      className="bg-neon-pink px-10 py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 inline-flex items-center"
                    >
                      MINT NOW <span className="ml-2">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Bottom Navigation Dock */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <AppleStyleDock />
        </div>
        
        {/* Music Control - Mobile only */}
        <button 
          onClick={toggleMusic}
          className="md:hidden fixed bottom-6 right-6 z-30 flex items-center justify-center w-10 h-10 bg-black/60 rounded-full border border-zinc-700 transition-colors hover:bg-black/80"
          title={isPlaying ? "Mute Music" : "Play Music"}
          onMouseEnter={playHoverSound}
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5 text-neon-blue" />
          ) : (
            <VolumeX className="h-5 w-5 text-zinc-400" />
          )}
        </button>

        {/* Transaction Modal */}
        {showTxModal && (
          <TransactionModal
            status={txStatus}
            message={txMessage}
            txHash={txHash}
            error={error}
            onClose={() => setShowTxModal(false)}
            visible={showTxModal}
            tokenId={mintedTokenId}
            imageUrl={mintedTokenImageUrl || nftImageUrl}
          />
        )}
      </div>
    </div>
  );
}

// Export the component directly without wrapper
export default function Page() {
  return <DappContent />;
}