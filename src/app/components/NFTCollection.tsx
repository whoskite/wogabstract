import React, { useState, useEffect } from 'react';
import { getTokenMetadata, isTokenMinted } from '@/lib/contract';
import Image from 'next/image';
import Link from 'next/link';
import useSoundEffect from '@/hooks/useSoundEffect';

type NFTCollectionProps = {
  totalMinted: number | null;
  maxSupply: number | null;
};

type NFTMetadata = {
  image: string;
  name: string;
  description: string;
  tokenId: number;
  isMinted: boolean;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
};

export function NFTCollection({ totalMinted, maxSupply }: NFTCollectionProps) {
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add sound effects
  const { play: playClickSound } = useSoundEffect('/sounds/click.mp3');
  const { play: playHoverSound } = useSoundEffect('/sounds/hover.mp3');

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        setLoading(true);
        
        // Determine how many NFTs to display
        const mintedCount = totalMinted || 0;
        // Include token ID 0 by adding 1 to the displayed count, but cap at 5
        const displayCount = Math.min(mintedCount + 1, 5); 
        
        if (displayCount === 0) {
          setLoading(false);
          return;
        }
        
        // Fetch NFT metadata directly from the contract
        const metadataPromises = Array.from({ length: displayCount }, async (_, i) => {
          // Token IDs start from 0
          const tokenId = i;
          
          try {
            // Check if the token is minted
            const minted = await isTokenMinted(tokenId);
            
            // Get metadata regardless of mint status
            const metadata = await getTokenMetadata(tokenId);
            
            return {
              ...metadata,
              tokenId,
              isMinted: minted
            };
          } catch (err) {
            console.error(`Error fetching token #${tokenId} metadata:`, err);
            // Return placeholder metadata with minted status
            return {
              name: `NFT #${tokenId}`,
              description: "Metadata unavailable",
              image: '/img/nft-placeholder.jpg',
              tokenId,
              isMinted: false,
              attributes: []
            };
          }
        });
        
        const metadataResults = await Promise.all(metadataPromises);
        setNftMetadata(metadataResults);
      } catch (err) {
        console.error("Error fetching NFT collection:", err);
        setError("Failed to load NFT collection");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNFTMetadata();
  }, [totalMinted]);
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="off-white-label">LOADING COLLECTION...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="off-white-label text-[#ff3a20]">{error}</p>
      </div>
    );
  }
  
  if (nftMetadata.length === 0) {
    return (
      <div className="p-8 text-center virgil-card">
        <p className="off-white-text">No NFTs have been minted yet from this collection.</p>
      </div>
    );
  }
  
  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {nftMetadata.map((metadata, index) => {
          // Fix IPFS URLs if needed
          const imageUrl = metadata.image?.startsWith('ipfs://') 
            ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
            : metadata.image;
            
          return (
            <div key={index} className="relative">
              <Link 
                href={`/token/${metadata.tokenId}`}
                onClick={() => playClickSound()}
                onMouseEnter={() => playHoverSound()}
                className="block cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <div className="architecture-border bg-white p-2">
                  <div className="relative off-white-image">
                    <Image 
                      src={imageUrl || '/img/nft-placeholder.jpg'} 
                      alt={metadata.name} 
                      width={400}
                      height={400}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                  <div className="mt-2 flex