"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getContractURI } from "@/lib/contract";
import { NFT_CONTRACT_ADDRESS } from "@/const/contractAddresses";
import { abstractTestnet } from "thirdweb/chains";

export default function ContractDetails() {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format contract address for display
  const shortAddress = `${NFT_CONTRACT_ADDRESS.slice(0, 6)}...${NFT_CONTRACT_ADDRESS.slice(-4)}`;
  
  useEffect(() => {
    async function fetchContractDetails() {
      setLoading(true);
      setError(null);
      
      try {
        // Get contract URI
        const contractURI = await getContractURI();
        
        // If we have a URI, try to fetch and parse the data
        if (contractURI) {
          try {
            let metadata;
            
            // Handle different URI formats
            if (contractURI.startsWith('ipfs://')) {
              // Convert IPFS URI to HTTP gateway URL
              const ipfsGatewayURL = contractURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              const response = await fetch(ipfsGatewayURL);
              metadata = await response.json();
            } else if (contractURI.startsWith('http')) {
              // Regular HTTP URI
              const response = await fetch(contractURI);
              metadata = await response.json();
            } else {
              // Try to parse as JSON directly (if it's base64 encoded JSON or similar)
              try {
                metadata = JSON.parse(contractURI);
              } catch (e) {
                console.error("Unable to parse contract URI as JSON:", e);
                setError("Unsupported contract URI format");
              }
            }
            
            if (metadata) {
              setMetadata(metadata);
            }
          } catch (err) {
            console.error("Error fetching/parsing contract metadata:", err);
            setError("Error loading collection details");
          }
        } else {
          setError("No contract URI available");
        }
      } catch (err: any) {
        console.error("Error fetching contract URI:", err);
        setError(err.message || "Failed to load collection details");
      } finally {
        setLoading(false);
      }
    }
    
    fetchContractDetails();
  }, []);
  
  if (loading) {
    return (
      <div className="p-6 border border-neon-blue bg-black bg-opacity-50 rounded-lg animate-pulse">
        <div className="h-6 w-2/3 bg-gray-900 rounded mb-4"></div>
        <div className="h-4 w-full bg-gray-900 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-900 rounded"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6 border border-neon-blue bg-black bg-opacity-50 rounded-lg">
      <h2 className="text-2xl font-bold text-neon-blue mb-3">
        {metadata?.name || "WORLD OF GARU"}
      </h2>
      
      <div className="mb-4 font-mono text-xs text-gray-400">
        CONTRACT: <a 
          href={`https://testnet.abstractions.xyz/address/${NFT_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-pink hover:underline"
        >
          {shortAddress}
        </a> <span className="text-gray-600">({abstractTestnet.name})</span>
      </div>
      
      {metadata?.description && (
        <p className="text-gray-300 text-sm mb-4">{metadata.description}</p>
      )}
      
      {metadata?.image && (
        <div className="mt-4 mb-4">
          <div className="relative w-full h-40 overflow-hidden rounded-md">
            <Image
              src={metadata.image.startsWith('ipfs://') 
                ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                : metadata.image}
              alt={metadata.name || "Collection Image"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-30"></div>
          </div>
        </div>
      )}
      
      {metadata?.external_link && (
        <div className="mt-4">
          <a 
            href={metadata.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-neon-blue bg-opacity-20 hover:bg-opacity-30 text-neon-blue py-2 px-4 rounded-md text-sm transition-all"
          >
            View Collection Website
          </a>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 text-red-400 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 