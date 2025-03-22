"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/app/components/Navbar";
import TokenDetails from "@/app/components/TokenDetails";
import ContractDetails from "@/app/components/ContractDetails";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TokenDetailPage() {
  const params = useParams();
  const tokenId = parseInt(params.id as string);
  
  // State for page glitch effect
  const [isGlitching, setIsGlitching] = useState(false);
  
  // Trigger random glitch effects
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 3000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  return (
    <main className="relative min-h-screen bg-black bg-opacity-90 text-white">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      {/* Noise overlay */}
      <div className="absolute inset-0 bg-noise-pattern opacity-5 pointer-events-none" />
      
      {/* Scan lines */}
      <div className="absolute inset-0 bg-scan-lines opacity-10 pointer-events-none" />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Back navigation */}
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-neon-blue hover:text-neon-pink transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-mono text-sm">BACK_TO_DASHBOARD</span>
            </Link>
          </div>
          
          {/* Token detail header */}
          <h1 className={`text-3xl font-bold mb-8 ${isGlitching ? 'text-glitch' : ''}`}>
            <span className="text-neon-pink">TOKEN_</span>
            <span className="text-white">{tokenId}</span>
          </h1>
          
          {/* Content grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Token details */}
            <div className="md:col-span-2">
              <TokenDetails tokenId={tokenId} />
            </div>
            
            {/* Right column - Contract info */}
            <div>
              <ContractDetails />
            </div>
          </div>
          
          {/* Transfer history (placeholder) */}
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-neon-blue">TRANSFER_HISTORY</h2>
            <div className="border border-gray-800 bg-black bg-opacity-50 rounded-lg p-4">
              <div className="text-center text-gray-500 py-8">
                <p>No transfer history available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 