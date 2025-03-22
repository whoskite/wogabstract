"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getTokenMetadata } from "@/lib/contract";

interface TokenDetailsProps {
  tokenId: number;
}

export default function TokenDetails({ tokenId }: TokenDetailsProps) {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokenDetails() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getTokenMetadata(tokenId);
        setMetadata(data);
      } catch (err: any) {
        console.error("Error fetching token metadata:", err);
        setError(err.message || "Failed to load token details");
      } finally {
        setLoading(false);
      }
    }

    fetchTokenDetails();
  }, [tokenId]);

  if (loading) {
    return (
      <div className="p-4 border border-neon-blue bg-black bg-opacity-50 rounded-lg animate-pulse">
        <div className="h-48 w-full bg-gray-900 rounded-md mb-4"></div>
        <div className="h-6 w-2/3 bg-gray-900 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-900 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-neon-pink bg-black bg-opacity-50 rounded-lg">
        <p className="text-neon-pink">ERROR_LOADING_TOKEN</p>
        <p className="text-gray-400 font-mono text-sm mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border border-neon-blue bg-black bg-opacity-50 rounded-lg">
      {metadata?.image && (
        <div className="relative w-full aspect-square mb-4 overflow-hidden rounded-md">
          <Image
            src={metadata.image.startsWith('ipfs://') 
              ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
              : metadata.image}
            alt={metadata.name || `Token #${tokenId}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
        </div>
      )}
      
      <h3 className="text-xl font-bold text-white mb-2">
        {metadata?.name || `Token #${tokenId}`}
      </h3>
      
      {metadata?.description && (
        <p className="text-gray-300 text-sm mb-4">{metadata.description}</p>
      )}
      
      {metadata?.attributes && metadata.attributes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-neon-blue text-sm font-mono mb-2">ATTRIBUTES</h4>
          <div className="grid grid-cols-2 gap-2">
            {metadata.attributes.map((attr: any, index: number) => (
              <div key={index} className="bg-gray-900 bg-opacity-50 p-2 rounded text-xs">
                <div className="text-gray-400">{attr.trait_type}</div>
                <div className="text-white font-medium">{attr.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 