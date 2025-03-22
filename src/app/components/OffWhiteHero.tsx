import React from 'react';
import { ConnectButton } from './ui/ConnectButton';
import Image from "next/image";

type OffWhiteHeroProps = {
  ctaAction?: () => void;
  isConnected?: boolean;
  isLoading?: boolean;
  totalMinted: number | null;
  maxSupply: number | null;
};

export function OffWhiteHero({ 
  ctaAction, 
  isConnected, 
  isLoading,
  totalMinted,
  maxSupply 
}: OffWhiteHeroProps) {
  // Calculate supply percentage for progress bar
  const supplyPercentage = totalMinted !== null && maxSupply !== null 
    ? ((totalMinted / maxSupply) * 100).toFixed(0)
    : "0";

  return (
    <>
      {/* Full-width image section */}
      <section className="w-full relative">
        {/* Architectural measurements */}
        <div className="absolute top-4 right-4 off-white-label text-xs opacity-70 z-10">
          1920 x 1080
        </div>
        <div className="absolute bottom-4 right-4 off-white-label px-4 py-2 bg-white architecture-border z-10">
          <span>PRICE: 0.0001 ETH</span>
        </div>
        <Image 
          src="/img/Poster1.png" 
          alt="World of Garu NFT" 
          className="w-full h-auto"
          width={1920}
          height={1080}
        />
      </section>
      
      {/* Content section */}
      <section className="off-white-hero py-0">
        {/* Architecture grid overlay */}
        <div className="architecture-grid"></div>
        
        {/* Virgil-style architectural annotations */}
        <div className="absolute top-4 left-4 off-white-label pb-1 border-b border-black opacity-50">
          c/o 2023
        </div>
        <div className="absolute top-4 right-4 off-white-label pb-1 border-b border-black opacity-50">
          REF: 037.WORLD-OF-GARU
        </div>
        
        <div className="off-white-container relative">
          <div className="flex flex-col md:flex-row md:items-stretch">
            {/* Left column with title and label - using new title-container class */}
            <div className="title-container w-full md:w-5/12 mb-8 md:mb-0">
              {/* Label "01" - architectural element */}
              <div className="mb-6 px-4 pt-4">
                <span className="off-white-label pb-1 border-b border-black">01—COLLECTION</span>
              </div>
              
              <h1 className="off-white-title text-5xl md:text-6xl lg:text-8xl px-4 pb-10">
                WORLD<br/>OF<br/>GARU
              </h1>
            </div>
            
            {/* Right column with description and mint interface */}
            <div className="w-full md:w-7/12 md:pl-8 py-4">
              <div className="mb-6">
                <p className="off-white-quote text-xl md:text-2xl italic mb-6">
                  Exclusive digital collectibles
                </p>
                
                {/* Virgil-style annotations */}
                <div className="mt-6 text-sm opacity-70">
                  <p>&ldquo;ENTER THE WORLD OF GARU&rdquo;</p>
                  <p>&ldquo;DIGITAL COLLECTIBLES FOR THE METAVERSE&rdquo;</p>
                </div>
              </div>
              
              {/* Mint info */}
              <div className="p-4 architecture-border bg-white">
                <div className="flex justify-between items-center">
                  <span className="off-white-label">SUPPLY</span>
                  <span className="font-medium">
                    {totalMinted !== null ? totalMinted : "0"}/{maxSupply !== null ? maxSupply : "?"}
                  </span>
                </div>
                <div className="w-full h-1 bg-gray-100 mt-2">
                  <div className="h-full bg-black" style={{ width: `${supplyPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 