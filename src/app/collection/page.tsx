"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { getTokenMetadata, isTokenMinted, getTotalMinted } from "@/lib/contract";

// NFT type definition
type NFT = {
  id: number;
  name: string;
  image: string;
  description: string;
  isMinted: boolean;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
};

export default function Collection() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [filterRarity, setFilterRarity] = useState("All");
  const [sortOption, setSortOption] = useState("id-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeNft, setActiveNft] = useState<number | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualMintedCount, setActualMintedCount] = useState(0);
  
  // Fetch NFTs from contract on component mount
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        
        // Get the actual number of minted tokens
        const mintedCount = await getTotalMinted();
        setActualMintedCount(mintedCount);
        
        // Always display 6 NFTs (0-5) regardless of how many are minted
        const displayCount = 6;
        
        const nftPromises = Array.from({ length: displayCount }, async (_, i) => {
          const tokenId = i; // Start from token ID 0
          
          try {
            // Check if the token is actually minted
            const isMinted = await isTokenMinted(tokenId);
            
            // Get metadata regardless of mint status
            const metadata = await getTokenMetadata(tokenId);
            
            return {
              id: tokenId,
              name: metadata.name || `NFT #${tokenId}`,
              image: metadata.image?.startsWith('ipfs://') 
                ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                : metadata.image || '/img/nft-placeholder.jpg',
              description: metadata.description || '',
              isMinted,
              attributes: metadata.attributes || []
            };
          } catch (err) {
            console.error(`Error fetching NFT #${tokenId}:`, err);
            // Return a placeholder on error
            return {
              id: tokenId,
              name: `GARU #${tokenId}`,
              image: '/img/nft-placeholder.jpg',
              description: 'Metadata unavailable',
              isMinted: false,
              attributes: []
            };
          }
        });
        
        const fetchedNfts = await Promise.all(nftPromises);
        setNfts(fetchedNfts);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFT collection");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTs();
  }, []);
  
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
  
  // Get rarity from attributes
  const getRarity = (nft: NFT) => {
    const rarityAttr = nft.attributes?.find(attr => 
      attr.trait_type?.toLowerCase() === 'rarity' || 
      attr.trait_type?.toLowerCase() === 'tier'
    );
    return rarityAttr?.value?.toString() || 'Common';
  };
  
  // Filter NFTs based on rarity, search term, and mint status
  const filteredNfts = nfts
    .filter(nft => {
      // Show both minted and unminted tokens, but you can add a filter for that here if needed
      if (filterRarity === "All") return true;
      const rarity = getRarity(nft);
      return rarity === filterRarity;
    })
    .filter(nft => {
      if (!searchTerm) return true;
      return nft.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             nft.id.toString().includes(searchTerm);
    });
  
  // Sort NFTs based on selected option
  const sortedNfts = [...filteredNfts].sort((a, b) => {
    switch (sortOption) {
      case "id-asc":
        return a.id - b.id;
      case "id-desc":
        return b.id - a.id;
      case "rarity-asc":
        return getRarity(a).localeCompare(getRarity(b));
      case "rarity-desc":
        return getRarity(b).localeCompare(getRarity(a));
      case "minted-first":
        return (a.isMinted === b.isMinted) ? 0 : a.isMinted ? -1 : 1;
      default:
        return 0;
    }
  });

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Background effects */}
      <div className="background-gradient"></div>
      <div className="background-grid"></div>
      <div className="noise-overlay"></div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Collection header */}
      <div className="w-full max-w-6xl px-6 pt-32 pb-8">
        <div className="mb-8 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isGlitching ? 'text-glitch' : ''}`}>
            <span className="text-neon-blue">NFT_</span>
            <span className="text-white">COLLECTION</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore the complete set of industrial glitch abstractions in our cyberpunk-inspired collection
          </p>
        </div>
        
        {/* Collection stats */}
        <div className="dashboard-stats mb-12">
          <div className="stat-card">
            <div className="stat-label">TOTAL ITEMS</div>
            <div className="stat-value">{nfts.length}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">MINTED</div>
            <div className="stat-value">{actualMintedCount}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">PRICE</div>
            <div className="stat-value">0.0001 ETH</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">OWNERS</div>
            <div className="stat-value">{Math.max(1, Math.floor(actualMintedCount * 0.7))}</div>
          </div>
        </div>
        
        {/* Filters and sorting */}
        <div className="terminal-card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative flex-grow md:max-w-xs">
              <input
                type="text"
                placeholder="SEARCH_BY_ID_OR_NAME"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-neon-blue px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-neon-pink"
              />
              <span className="absolute right-3 top-2 text-neon-blue">&gt;</span>
            </div>
            
            {/* Filter */}
            <div className="flex items-center">
              <label className="text-gray-400 font-mono text-sm mr-2">RARITY:</label>
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="bg-black border border-neon-green px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-neon-blue"
              >
                <option value="All">All</option>
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Legendary">Legendary</option>
              </select>
            </div>
            
            {/* Sort */}
            <div className="flex items-center">
              <label className="text-gray-400 font-mono text-sm mr-2">SORT:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-black border border-neon-pink px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-neon-blue"
              >
                <option value="id-asc">ID (Ascending)</option>
                <option value="id-desc">ID (Descending)</option>
                <option value="rarity-asc">Rarity (A-Z)</option>
                <option value="rarity-desc">Rarity (Z-A)</option>
                <option value="minted-first">Minted First</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* NFT Grid */}
      <div className="w-full max-w-6xl px-6 pb-16">
        {loading ? (
          <div className="terminal-card p-8 text-center">
            <p className="text-neon-blue text-xl mb-4 font-mono">LOADING_COLLECTION...</p>
          </div>
        ) : error ? (
          <div className="terminal-card p-8 text-center">
            <p className="text-neon-pink text-xl mb-4 font-mono">ERROR</p>
            <p className="text-gray-300">{error}</p>
          </div>
        ) : sortedNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedNfts.map((nft) => (
              <div 
                key={nft.id} 
                className={`cyberpunk-border rounded overflow-hidden transition-all duration-300 
                  ${activeNft === nft.id ? 'shadow-neon-pink transform scale-[1.02]' : 'hover:shadow-neon-blue'}`}
                onMouseEnter={() => setActiveNft(nft.id)}
                onMouseLeave={() => setActiveNft(null)}
              >
                <div className="relative">
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    width={400}
                    height={400}
                    className="w-full h-auto"
                    unoptimized
                  />
                  
                  {/* ID tag */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-80 px-2 py-1 text-xs font-mono text-white">
                    #{nft.id}
                  </div>
                  
                  {/* Scan line effect on hover */}
                  {activeNft === nft.id && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="scanner-line"></div>
                    </div>
                  )}
                  
                  {/* Dark overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                  
                  {/* NFT info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold">{nft.name}</h3>
                  </div>
                </div>
                
                {/* Details */}
                <div className="bg-black bg-opacity-90 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-mono">PRICE</span>
                    <span className="text-neon-green font-mono text-sm">0.0001 ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-mono">STATUS</span>
                    <span className={`font-mono text-xs ${nft.isMinted ? 'text-green-500' : 'text-gray-500'}`}>
                      {nft.isMinted ? 'MINTED' : 'NOT MINTED'}
                    </span>
                  </div>
                  
                  {/* View button */}
                  <div className="mt-3 text-center">
                    <Link
                      href={`/token/${nft.id}`}
                      className="inline-block w-full py-2 border border-neon-pink text-white hover:text-neon-pink font-mono text-sm transition-colors"
                    >
                      VIEW_DETAILS
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="terminal-card p-8 text-center">
            <h3 className="text-neon-pink text-xl mb-4 font-mono">NO_RESULTS_FOUND</h3>
            <p className="text-gray-300">
              No NFTs match your current search filters. Try adjusting your criteria.
            </p>
          </div>
        )}
        
        {/* Pagination (simplified) */}
        {nfts.length > 0 && (
          <div className="mt-12 flex justify-center">
            <div className="inline-flex bg-black border border-neon-blue">
              <button className="px-4 py-2 border-r border-neon-blue text-neon-blue hover:bg-neon-blue hover:bg-opacity-10 transition-all">
                1
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-neon-blue transition-all">
                2
              </button>
              <button className="px-4 py-2 text-gray-400 hover:text-neon-blue transition-all">
                3
              </button>
              <button className="px-4 py-2 border-l border-neon-blue text-gray-400 hover:text-neon-blue transition-all">
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 