"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { useActiveAccount } from "thirdweb/react";
import { abstractTestnet } from "thirdweb/chains";
import { getContract, readContract } from "thirdweb";
import { client } from "../client";
import Image from "next/image";
import Link from "next/link";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOut, Wallet, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getTokenMetadata } from "@/lib/contract";
import { NFT_CONTRACT_ADDRESS } from "@/const/contractAddresses";

// Define Collection icon since it's not exported from lucide-react
const Collection = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0"
  >
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export default function Dashboard() {
  // State variables
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalOwned: 0,
    uniqueCollections: 1,
    firstAcquired: "N/A"
  });
  const [error, setError] = useState("");
  const [isGlitching, setIsGlitching] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Get active account
  const account = useActiveAccount();

  // Sidebar navigation links
  const links = [
    {
      label: "Home",
      href: "/",
      icon: (
        <Home className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Collection",
      href: "/collection",
      icon: (
        <Collection />
      ),
    },
    {
      label: "Wallet",
      href: "#",
      icon: (
        <Wallet className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  // Fetch user's NFTs from the contract using useCallback
  const fetchUserNFTs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      if (!client) {
        throw new Error("Thirdweb client not initialized");
      }
      
      // Get contract
      const contract = getContract({
        client,
        chain: abstractTestnet,
        address: NFT_CONTRACT_ADDRESS
      });
      
      // Try to get NFT balance
      let balanceOf = 0;
      try {
        const balance = await readContract({
          contract,
          method: "function balanceOf(address owner) view returns (uint256)",
          params: [account?.address || ""],
        });
        
        balanceOf = Number(balance);
        console.log("NFT balance:", balanceOf);
      } catch (err) {
        console.error("Could not read NFT balance:", err);
      }
      
      // Array to hold NFT data
      const userNfts = [];
      
      if (balanceOf > 0) {
        // Try to get token IDs owned by the user
        try {
          // Loop through token indices and get token IDs
          for (let i = 0; i < balanceOf; i++) {
            try {
              // Get token ID at index for this owner
              const tokenId = await readContract({
                contract,
                method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                params: [account?.address || "", BigInt(i)],
              });
              
              // Try to get metadata for this token
              try {
                // Get token metadata using our utility function
                const metadata = await getTokenMetadata(Number(tokenId));
                
                userNfts.push({
                  id: Number(tokenId),
                  name: metadata.name || `Abstract #${Number(tokenId)}`,
                  image: metadata.image || "/1.GIF", // Fallback to placeholder
                  attributes: metadata.attributes || [
                    { trait_type: "Series", value: "Genesis" },
                    { trait_type: "Rarity", value: "Uncommon" },
                    { trait_type: "Style", value: "Industrial" }
                  ]
                });
              } catch (metadataErr) {
                // Fallback to placeholder if metadata fails
                console.error(`Error fetching metadata for token ${tokenId}:`, metadataErr);
                userNfts.push({
                  id: Number(tokenId),
                  name: `Abstract #${Number(tokenId)}`,
                  image: "/1.GIF",
                  attributes: [
                    { trait_type: "Series", value: "Genesis" },
                    { trait_type: "Rarity", value: "Uncommon" },
                    { trait_type: "Style", value: "Industrial" }
                  ]
                });
              }
            } catch (indexErr) {
              console.error(`Error fetching token at index ${i}:`, indexErr);
            }
          }
        } catch (err) {
          console.error("Error fetching token IDs:", err);
          // Fallback to mock data if we can't get token IDs
          for (let i = 0; i < balanceOf; i++) {
            userNfts.push({
              id: i + 1,
              name: `Abstract #${i + 1}`,
              image: "/1.GIF",
              attributes: [
                { trait_type: "Series", value: "Genesis" },
                { trait_type: "Rarity", value: "Uncommon" },
                { trait_type: "Style", value: "Industrial" }
              ]
            });
          }
        }
      }
      
      // If no NFTs were found or there was an error, show a demo NFT
      if (userNfts.length === 0) {
        userNfts.push({
          id: 1,
          name: "Abstract #1 (Demo)",
          image: "/1.GIF",
          attributes: [
            { trait_type: "Series", value: "Genesis" },
            { trait_type: "Rarity", value: "Uncommon" },
            { trait_type: "Style", value: "Industrial" }
          ]
        });
      }
      
      setNfts(userNfts);
      
      // Update user stats
      setUserStats({
        totalOwned: balanceOf || 1, // Default to 1 for demo
        uniqueCollections: 1,
        firstAcquired: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error("Error fetching NFTs:", err);
      setError("Failed to load your NFTs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  // Fetch user's NFTs
  useEffect(() => {
    // Random glitch effect
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 3000);
    
    // Only fetch if user is connected
    if (account) {
      fetchUserNFTs();
    } else {
      setIsLoading(false);
      setError("Please connect your wallet to view your dashboard");
    }
    
    return () => clearInterval(glitchInterval);
  }, [account, fetchUserNFTs]);
  
  const LogoWorldOfGaru = () => {
    return (
      <Link
        href="/"
        className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-gradient-to-r from-neon-pink to-neon-blue rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-medium whitespace-pre"
        >
          WORLD OF GARU
        </motion.span>
      </Link>
    );
  };

  const LogoIconWorldOfGaru = () => {
    return (
      <Link
        href="/"
        className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
      >
        <div className="h-5 w-6 bg-gradient-to-r from-neon-pink to-neon-blue rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      </Link>
    );
  };
  
  // Dashboard content with NFT gallery
  const DashboardContent = () => {
    return (
      <div className="p-6 md:p-10 rounded-tl-2xl dark:bg-neutral-900 flex flex-col gap-4 flex-1 w-full h-full overflow-y-auto">
        {/* Dashboard header */}
        <div className="mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${isGlitching ? 'text-glitch' : ''}`}>
            <span className="text-neon-blue">USER_</span>
            <span className="text-white dark:text-white">DASHBOARD</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono">
            {account ? (
              <>CONNECTED_WALLET: <span className="text-neon-green">{account.address.slice(0, 6)}...{account.address.slice(-4)}</span></>
            ) : (
              <>STATUS: <span className="text-neon-pink">NOT_CONNECTED</span></>
            )}
          </p>
        </div>

        {!account && (
          <div className="terminal-card p-8 text-center">
            <h2 className="text-neon-pink text-xl mb-4 font-mono">ACCESS_DENIED</h2>
            <p className="text-gray-300 mb-6">
              Connect your wallet to access your NFT collection and dashboard features.
            </p>
            <div className="inline-block relative overflow-hidden p-px">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-blue opacity-60 animate-pulse"></div>
              <Link 
                href="/" 
                className="relative bg-black py-3 px-8 block text-white font-mono hover:text-neon-blue transition-colors"
              >
                RETURN_TO_HOMEPAGE
              </Link>
            </div>
          </div>
        )}
        
        {account && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">TOTAL OWNED</div>
                <div className="text-2xl font-bold text-neutral-800 dark:text-white">{userStats.totalOwned}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">NFTs in your wallet</div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">COLLECTIONS</div>
                <div className="text-2xl font-bold text-neutral-800 dark:text-white">{userStats.uniqueCollections}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Unique collections</div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">FIRST ACQUIRED</div>
                <div className="text-xl font-bold text-neutral-800 dark:text-white font-mono">{userStats.firstAcquired}</div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">Date of first NFT</div>
              </div>
            </div>
            
            {/* NFT Gallery */}
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                  <span className="text-neon-blue">#</span> YOUR_COLLECTION
                </h2>
                <div className="text-neon-pink text-sm font-mono">
                  {isLoading ? 'LOADING...' : `${nfts.length} ITEMS`}
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="loading-indicator">
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : error ? (
                <div className="text-neon-pink p-4 border border-neon-pink bg-black bg-opacity-50">
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map((nft) => (
                    <Link
                      key={nft.id}
                      href={`/token/${nft.id}`}
                      className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-neon-blue"
                    >
                      <div className="relative">
                        <Image
                          src={nft.image}
                          alt={nft.name}
                          width={400}
                          height={400}
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-bold">{nft.name}</h3>
                        </div>
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900 p-3">
                        <div className="flex flex-wrap gap-2">
                          {nft.attributes.map((attr: any, index: number) => (
                            <div key={index} className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs">
                              <span className="text-neutral-500 dark:text-neutral-400">{attr.trait_type}:</span> 
                              <span className="text-neon-blue ml-1">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };
  
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 dark:bg-black">
      {/* Navbar */}
      <Navbar />
      
      {/* Main content with sidebar */}
      <div className="flex-1 flex flex-col mt-16 container mx-auto px-4 py-6">
        <div className="rounded-lg flex flex-col md:flex-row bg-white dark:bg-neutral-900 w-full flex-1 border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
          {/* Sidebar */}
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {sidebarOpen ? <LogoWorldOfGaru /> : <LogoIconWorldOfGaru />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
              {account && (
                <div>
                  <SidebarLink
                    link={{
                      label: account.address.slice(0, 6) + "..." + account.address.slice(-4),
                      href: "#",
                      icon: (
                        <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-xs">
                          WG
                        </div>
                      ),
                    }}
                  />
                </div>
              )}
            </SidebarBody>
          </Sidebar>
          
          {/* Dashboard content */}
          <DashboardContent />
        </div>
      </div>
    </main>
  );
} 