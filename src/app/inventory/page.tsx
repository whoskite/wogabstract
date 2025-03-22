"use client";

import { useState, useEffect, useCallback } from "react";
import { useActiveAccount } from "thirdweb/react";
import { AppleStyleDock } from '@/components/AppleStyleDock';
import { Flame, Zap, Volume2, VolumeX, Search, Filter, ArrowLeft } from "lucide-react";
import { useSoundEffect, useBackgroundMusic } from "@/lib/useSoundEffect";
import Image from "next/image";
import Link from "next/link";
import { getContract, readContract } from "thirdweb";
import { client } from "@/app/client";
import { abstractTestnet } from "thirdweb/chains";
import { NFT_CONTRACT_ADDRESS } from '@/const/contractAddresses';
import { Navbar } from "../components/Navbar";

// Categories for filtering
const CATEGORIES = [
  { id: "all", name: "All Items", icon: "📦" },
  { id: "collectible", name: "Collectibles", icon: "🖼️" },
  { id: "consumable", name: "Consumables", icon: "🧪" },
  { id: "weapon", name: "Weapons", icon: "⚔️" },
  { id: "armor", name: "Armor", icon: "🛡️" },
  { id: "key", name: "Key Items", icon: "🔑" },
  { id: "vehicle", name: "Vehicles", icon: "🚀" }
];

// For item type and category determination based on metadata
const determineItemType = (nft: any) => {
  const attributes = nft.metadata?.attributes || [];
  
  // Look for a type attribute
  const typeAttribute = attributes.find((attr: any) => 
    attr.trait_type?.toLowerCase() === 'type' || 
    attr.trait_type?.toLowerCase() === 'item_type'
  );
  
  if (typeAttribute) {
    return typeAttribute.value;
  }
  
  // Check name for keywords
  const name = nft.metadata?.name || "";
  if (name.toLowerCase().includes('sword') || name.toLowerCase().includes('gun') || name.toLowerCase().includes('weapon')) {
    return 'Weapon';
  } else if (name.toLowerCase().includes('armor') || name.toLowerCase().includes('helmet') || name.toLowerCase().includes('shield')) {
    return 'Armor';
  } else if (name.toLowerCase().includes('potion') || name.toLowerCase().includes('boost')) {
    return 'Consumable';
  } else if (name.toLowerCase().includes('key')) {
    return 'Key Item';
  } else if (name.toLowerCase().includes('car') || name.toLowerCase().includes('vehicle')) {
    return 'Vehicle';
  }
  
  // Default type
  return 'NFT';
};

// For determining rarity based on metadata
const determineRarity = (nft: any) => {
  const attributes = nft.metadata?.attributes || [];
  
  // Look for rarity attribute
  const rarityAttribute = attributes.find((attr: any) => 
    attr.trait_type?.toLowerCase() === 'rarity'
  );
  
  if (rarityAttribute) {
    return rarityAttribute.value;
  }
  
  // For items without rarity attribute, could implement logic based on other factors
  // For example, lower token IDs might be more rare
  const id = nft.metadata?.id || nft.tokenId;
  if (id && typeof id === 'string' || typeof id === 'number') {
    const numericId = parseInt(id.toString());
    if (numericId <= 10) return 'Legendary';
    if (numericId <= 50) return 'Epic';
    if (numericId <= 150) return 'Rare';
    if (numericId <= 300) return 'Uncommon';
  }
  
  return 'Common';
};

// Determine the category based on type
const determineCategory = (type: string) => {
  const lowercaseType = type.toLowerCase();
  if (lowercaseType.includes('weapon')) return 'weapon';
  if (lowercaseType.includes('armor')) return 'armor';
  if (lowercaseType.includes('consumable') || lowercaseType.includes('potion')) return 'consumable';
  if (lowercaseType.includes('key')) return 'key';
  if (lowercaseType.includes('vehicle')) return 'vehicle';
  return 'collectible'; // Default category
};

// Main Inventory component
function InventoryContent() {
  // Sound effects
  const { play: playSelectSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3'); 
  const { play: playBackSound } = useSoundEffect('/sounds/back.mp3');
  const { play: playCategoryChange } = useSoundEffect('/sounds/category.mp3');
  
  // Background music
  const { isPlaying, setVolume, play: playBgMusic, stop: stopBgMusic } = 
    useBackgroundMusic('/sounds/inventory-ambient.mp3', 0.05);

  // Get active account
  const account = useActiveAccount();
  
  // State for inventory items and UI
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [streakCount, setStreakCount] = useState(3);
  const [multiplier, setMultiplier] = useState(1.5);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState(true);

  // Toggle music function
  const toggleMusic = () => {
    playSelectSound();
    if (isPlaying) {
      stopBgMusic();
    } else {
      playBgMusic();
    }
  };

  // Fetch user's NFTs from the contract
  useEffect(() => {
    const fetchUserNFTs = async () => {
      setIsLoadingNFTs(true);
      console.log("Starting to fetch NFTs for address:", account?.address);
      
      try {
        if (!client) {
          console.error("Thirdweb client not initialized");
          throw new Error("Thirdweb client not initialized");
        }
        
        if (!account?.address) {
          console.log("No account connected, skipping NFT fetch");
          setOwnedNFTs([]);
          setIsLoadingNFTs(false);
          setIsLoading(false);
          return;
        }
        
        // Get contract
        console.log("Getting contract at address:", NFT_CONTRACT_ADDRESS);
        const contract = getContract({
          client,
          chain: abstractTestnet,
          address: NFT_CONTRACT_ADDRESS
        });
        
        console.log("Contract retrieved:", contract ? "Success" : "Failed");
        
        // Try to get NFT balance
        let balanceOf = 0;
        try {
          console.log("Checking NFT balance for account:", account.address);
          const balance = await readContract({
            contract,
            method: "function balanceOf(address owner) view returns (uint256)",
            params: [account.address],
          });
          
          balanceOf = Number(balance);
          console.log("NFT balance:", balanceOf);
        } catch (err) {
          console.error("Error reading NFT balance:", err);
          // Don't return early, try the fallback method even if balanceOf fails
          balanceOf = 0;
        }
        
        // If user has NFTs, fetch them
        const userNfts = [];
        console.log(`User has ${balanceOf} NFTs according to balanceOf, starting fetch...`);
        
        // Try to use tokenOfOwnerByIndex first (if contract implements ERC721Enumerable)
        let enumerableFailed = false;
        
        if (balanceOf > 0) {
          try {
            // Try to get the first NFT to check if enumerable is supported
            await readContract({
              contract,
              method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
              params: [account.address, BigInt(0)],
            });
            
            // If we get here, enumerable is supported
            console.log("ERC721Enumerable is supported, using tokenOfOwnerByIndex");
            
            // For each NFT, fetch the token ID and metadata
            for (let i = 0; i < balanceOf; i++) {
              try {
                console.log(`Fetching NFT ${i+1} of ${balanceOf}`);
                // Get token ID at index
                const tokenId = await readContract({
                  contract,
                  method: "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
                  params: [account.address, BigInt(i)],
                });
                
                console.log(`Found token ID: ${tokenId}`);
                
                // Get token URI
                const tokenURI = await readContract({
                  contract,
                  method: "function tokenURI(uint256 _tokenId) view returns (string)",
                  params: [tokenId],
                });
                
                console.log(`Token URI for #${tokenId}: ${tokenURI}`);
                
                // Fetch metadata from token URI
                let metadata = null;
                try {
                  // Parse IPFS URI if needed
                  const metadataUrl = tokenURI.toString().startsWith('ipfs://')
                    ? tokenURI.toString().replace('ipfs://', 'https://ipfs.io/ipfs/')
                    : tokenURI;
                  
                  console.log(`Fetching metadata from: ${metadataUrl}`);
                  const response = await fetch(metadataUrl);
                  metadata = await response.json();
                  console.log(`Metadata fetched for #${tokenId}:`, metadata);
                } catch (err) {
                  console.error(`Error fetching metadata for token #${tokenId}:`, err);
                  metadata = {
                    name: `NFT #${tokenId}`,
                    description: "Metadata unavailable",
                    image: ""
                  };
                }
                
                // Add to user's NFTs
                userNfts.push({
                  tokenId: tokenId.toString(),
                  metadata
                });
                console.log(`Added NFT #${tokenId} to list, total so far: ${userNfts.length}`);
              } catch (err) {
                console.error(`Error fetching token at index ${i}:`, err);
              }
            }
            
            console.log(`Retrieved ${userNfts.length} NFTs using ERC721Enumerable`);
            setOwnedNFTs(userNfts);
            processNFTsIntoInventory(userNfts);
            setIsLoadingNFTs(false);
          } catch (err) {
            console.warn("ERC721Enumerable not supported, falling back to scanning tokens", err);
            enumerableFailed = true;
          }
        }
        
        // If no NFTs found with enumerable method, or enumerable unsupported
        if ((userNfts.length === 0 || enumerableFailed) && account?.address) {
          console.log("Using token range scan as fallback");
          // Use fallback: scan token range to find owned tokens
          const foundNFTs = await scanTokenRange(contract, account.address, 0, 10); // Limit scan to reasonable range
          
          if (foundNFTs.length > 0) {
            console.log(`Found ${foundNFTs.length} owned NFTs by scanning token range`);
            setOwnedNFTs(foundNFTs);
            processNFTsIntoInventory(foundNFTs);
          } else {
            console.log("No NFTs found for this account after scanning token range");
            // Just in case, add a placeholder item to test UI
            const placeholderNFTs = [
              {
                tokenId: "1",
                metadata: {
                  name: "Test NFT",
                  description: "This is a placeholder for testing",
                  image: "/img/19.GIF",
                  attributes: [
                    { trait_type: "Type", value: "Collectible" }
                  ]
                }
              }
            ];
            setOwnedNFTs(placeholderNFTs);
            processNFTsIntoInventory(placeholderNFTs);
          }
          setIsLoadingNFTs(false);
        }
        
        // If still no NFTs, use placeholders for development/testing
        if ((userNfts.length === 0 && ownedNFTs.length === 0) || !account?.address) {
          console.log("No real NFTs found, using test placeholders");
          
          const placeholderNFTs = [
            {
              tokenId: "1", 
              metadata: {
                name: "Genesis NFT",
                description: "Your first collectible in the World of GARU",
                image: "/img/19.GIF",
                attributes: [
                  { trait_type: "Type", value: "Collectible" }
                ]
              }
            },
            {
              tokenId: "42",
              metadata: {
                name: "Health Potion",
                description: "Restores 50 HP when used",
                image: "/img/Potion.png",
                attributes: [
                  { trait_type: "Type", value: "Consumable" },
                  { trait_type: "Uses", value: 3 }
                ]
              }
            },
            {
              tokenId: "77",
              metadata: {
                name: "Plasma Sword",
                description: "A legendary weapon with energy blade",
                image: "/img/Weapon.png",
                attributes: [
                  { trait_type: "Type", value: "Weapon" },
                  { trait_type: "Rarity", value: "Legendary" }
                ]
              }
            }
          ];
          
          setOwnedNFTs(placeholderNFTs);
          processNFTsIntoInventory(placeholderNFTs);
          setIsLoadingNFTs(false);
        }
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setIsLoadingNFTs(false);
        setIsLoading(false);
      }
    };
    
    // Scanning for tokens that belong to the user (fallback method)
    const scanTokenRange = async (contract: any, userAddress: string, startId: number, endId: number) => {
      console.log(`Scanning token range ${startId}-${endId} for ${userAddress}`);
      const foundNFTs = [];
      
      for (let tokenId = startId; tokenId <= endId; tokenId++) {
        try {
          // Check if token exists and is owned by user
          const ownerOf = await readContract({
            contract,
            method: "function ownerOf(uint256 tokenId) view returns (address)",
            params: [BigInt(tokenId)],
          });
          
          if (ownerOf.toLowerCase() === userAddress.toLowerCase()) {
            console.log(`Found owned token #${tokenId}`);
            
            // Get token URI
            const tokenURI = await readContract({
              contract,
              method: "function tokenURI(uint256 _tokenId) view returns (string)",
              params: [BigInt(tokenId)],
            });
            
            // Fetch metadata
            let metadata = null;
            try {
              const metadataUrl = tokenURI.toString().startsWith('ipfs://')
                ? tokenURI.toString().replace('ipfs://', 'https://ipfs.io/ipfs/')
                : tokenURI;
              
              const response = await fetch(metadataUrl);
              metadata = await response.json();
            } catch (err) {
              console.error(`Error fetching metadata for token #${tokenId}:`, err);
              metadata = {
                name: `NFT #${tokenId}`,
                description: "Metadata unavailable",
                image: ""
              };
            }
            
            // Add to found NFTs
            foundNFTs.push({
              tokenId: tokenId.toString(),
              metadata
            });
          }
        } catch (err) {
          // Token might not exist or not be owned by user, just continue
          // console.error(`Error checking token #${tokenId}:`, err);
        }
      }
      
      return foundNFTs;
    };
    
    fetchUserNFTs();
  }, [account?.address, ownedNFTs?.length]);

  // Process NFTs into inventory items
  const processNFTsIntoInventory = (nfts: any[]) => {
    console.log("Processing", nfts.length, "NFTs into inventory items");
    const processedItems = nfts.map(nft => {
      const type = determineItemType(nft);
      const category = determineCategory(type);
      
      console.log(`Processing NFT #${nft.tokenId}: Type=${type}, Category=${category}`);
      
      return {
        id: nft.tokenId,
        name: nft.metadata?.name || `Unknown NFT #${nft.tokenId}`,
        type: type,
        image: nft.metadata?.image?.startsWith('ipfs://')
          ? nft.metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')
          : nft.metadata?.image || "",
        uses: type === 'Consumable' ? 1 : undefined,
        selected: false,
        category: category,
        description: nft.metadata?.description || "",
        attributes: nft.metadata?.attributes || [],
        // Store the raw NFT data for reference
        nftData: nft
      };
    });
    
    console.log("Setting inventory with", processedItems.length, "items");
    setInventory(processedItems);
    setIsLoading(false);
  };

  // Simulate loading screen if no NFTs are loading yet
  useEffect(() => {
    if (!isLoadingNFTs && ownedNFTs) {
      // Add a slight delay for UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoadingNFTs, ownedNFTs, ownedNFTs?.length]);

  // Filter items based on category and search
  const filteredItems = inventory.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = searchTerm 
      ? `#${item.id}`.includes(searchTerm)
      : true;
    return matchesCategory && matchesSearch;
  });

  // Handle item selection
  const handleSelectItem = (id: string) => {
    playSelectSound();
    setSelectedItem(id === selectedItem ? null : id);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    playCategoryChange();
    setSelectedCategory(category);
  };

  // Find uses for an item from its attributes
  const getItemUses = (item: any) => {
    if (item.type !== 'Consumable') return null;
    
    const usesAttribute = item.attributes?.find(
      (attr: any) => attr.trait_type?.toLowerCase() === 'uses' || attr.trait_type?.toLowerCase() === 'charges'
    );
    
    return usesAttribute ? usesAttribute.value : 1;
  };

  return (
    <main className="fixed inset-0 flex flex-col bg-zinc-900 overflow-hidden">
      {/* Floating Top Navigation Bar */}
      <div className="fixed top-0 inset-x-0 z-50 px-4 py-2">
        <div className="bg-black/60 backdrop-blur-md rounded-xl border border-zinc-700 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-zinc-400 hover:text-white transition-colors mr-3" onClick={() => playBackSound()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Link>
            <h2 className="font-bold text-white text-lg">INVENTORY</h2>
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
            
            {/* Multiplier */}
            <div className="flex items-center bg-zinc-800/80 rounded-lg px-2 py-1">
              <Zap className="h-4 w-4 text-yellow-400 mr-1" />
              <span className="text-white text-xs font-medium">{multiplier}x</span>
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
              </div>
            ) : (
              <div className="text-sm text-zinc-400">Not Connected</div>
            )}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-3xl">🎒</div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">LOADING INVENTORY</h2>
          <p className="text-zinc-400 text-sm">Retrieving your NFTs...</p>
          <div className="mt-4 w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 animate-loading-progress"></div>
          </div>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 p-4 pt-16 overflow-hidden">
        {/* Categories Sidebar */}
        <div className="md:col-span-2 bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-700 p-3 overflow-y-auto">
          <h3 className="text-white font-bold mb-3 px-2">CATEGORIES</h3>
          <div className="space-y-1">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                onMouseEnter={() => playHoverSound()}
                className={`w-full text-left flex items-center p-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-900/30 text-green-400 border border-green-900/50'
                    : 'text-zinc-300 hover:bg-zinc-700/50'
                }`}
              >
                <span className="mr-2 text-lg">{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Inventory Area */}
        <div className="md:col-span-7 bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-700 p-4 overflow-hidden flex flex-col">
          {/* Search and Filter */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by token ID... (e.g. #1)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-700/80 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
            <button
              className="bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded-lg transition-colors"
              onClick={() => playSelectSound()}
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>

          {/* Items Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto p-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative rounded-lg cursor-pointer transition-all hover:scale-105 ${
                    selectedItem === item.id ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => handleSelectItem(item.id)}
                  onMouseEnter={() => playHoverSound()}
                >
                  <div className="aspect-square relative rounded-md overflow-hidden">
                    {item.image ? (
                      <div className="w-full h-full relative">
                        <Image
                          src={item.image}
                          alt={`NFT #${item.id}`}
                          className="w-full h-full object-cover"
                          width={200}
                          height={200}
                        />
                        {item.uses && (
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-md">
                            {item.uses}x
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-zinc-800">
                        <span className="text-3xl">?</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : !isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-500">
                {account ? (
                  <>
                    <span className="text-5xl mb-4">🔍</span>
                    <p className="text-center">No items found</p>
                    {searchTerm || selectedCategory !== "all" ? (
                      <button
                        className="mt-4 text-green-400 hover:text-green-300 underline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                          playSelectSound();
                        }}
                      >
                        Clear filters
                      </button>
                    ) : (
                      <p className="mt-4 text-sm text-center">
                        You don&apos;t own any NFTs from this collection yet.
                      </p>
                    )}
                    
                    {/* Debug info section */}
                    <div className="mt-6 text-xs text-zinc-500 text-center">
                      <p>Connected account: {account?.address?.slice(0, 6)}...{account?.address?.slice(-4)}</p>
                      <p>NFT contract: {NFT_CONTRACT_ADDRESS}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-5xl mb-4">🔒</span>
                    <p className="text-center">Please connect your wallet to view your inventory</p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Details Panel */}
        <div className="md:col-span-3 bg-zinc-800/80 backdrop-blur-sm rounded-2xl border border-zinc-700 p-4 overflow-y-auto">
          {selectedItem ? (
            (() => {
              const item = inventory.find(i => i.id === selectedItem);
              if (!item) return <div className="p-4 text-zinc-400">Item not found</div>;
              
              return (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">{item.name}</h2>
                  
                  <div className="aspect-square w-full relative rounded-lg overflow-hidden border border-zinc-700">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain bg-zinc-900/50"
                        width={400}
                        height={400}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-zinc-800">
                        <span className="text-5xl">?</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-zinc-700/50 rounded-lg p-2">
                      <span className="text-zinc-400">Type</span>
                      <div className="text-white font-medium">{item.type}</div>
                    </div>
                    <div className="bg-zinc-700/50 rounded-lg p-2">
                      <span className="text-zinc-400">Token ID</span>
                      <div className="text-white font-medium">#{item.id}</div>
                    </div>
                    {item.uses && (
                      <div className="bg-zinc-700/50 rounded-lg p-2">
                        <span className="text-zinc-400">Uses</span>
                        <div className="text-white font-medium">{item.uses}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 bg-zinc-700/50 rounded-lg">
                    <h3 className="text-white text-sm font-medium mb-1">Description</h3>
                    <p className="text-zinc-300 text-xs">{item.description}</p>
                  </div>
                  
                  {item.attributes.length > 0 && (
                    <div>
                      <h3 className="text-white text-sm font-medium mb-2">Attributes</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {item.attributes.map((attr: any, index: number) => {
                          if (!attr.trait_type || attr.trait_type.toLowerCase() === 'type') return null;
                          return (
                            <div key={index} className="bg-zinc-700/40 rounded-lg p-2 text-xs">
                              <div className="text-zinc-400">{attr.trait_type}</div>
                              <div className="text-white font-medium">{attr.value}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    {item.type === 'Consumable' && (
                      <button
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                        onClick={() => playSelectSound()}
                      >
                        Use Item
                      </button>
                    )}
                    {item.type === 'Collectible' && (
                      <button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
                        onClick={() => playSelectSound()}
                      >
                        View on Explorer
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <span className="text-3xl mb-2">👈</span>
              <p className="text-center">Select an item to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <AppleStyleDock />
      </div>
    </main>
  );
}

// Export the component directly
export default function Inventory() {
  return <InventoryContent />;
}