"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { useActiveAccount } from "thirdweb/react";
import { abstractTestnet } from "thirdweb/chains";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import Image from "next/image";
import { client } from "./client";

export default function Home() {
  // NFT Contract Address
  const NFT_CONTRACT_ADDRESS = "0x68f5edeC0cfc0cB0129e2F459668154485474556";
  
  // State variables
  const [mintAmount, setMintAmount] = useState(1);
  const [nftPrice, setNftPrice] = useState(0.0001); // Default price in ETH
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [totalMinted, setTotalMinted] = useState<number | null>(null);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);
  
  // Get active account
  const account = useActiveAccount();
  
  // Connect to the contract
  useEffect(() => {
    // Initialize contract and fetch data
    const fetchContractData = async () => {
      try {
        // Use the existing client import
        if (!client) {
          console.error("Thirdweb client not initialized");
          return;
        }
        
        const contract = getContract({
          client,
          chain: abstractTestnet, 
          address: NFT_CONTRACT_ADDRESS
        });
        
        // Fixed price at 0.0001 ETH
        setNftPrice(0.0001);
        
        // Set placeholder values for minted and max supply since API is returning 404
        setTotalMinted(0);
        setMaxSupply(100);
        
        // Try to read contract data using readContract
        try {
          console.log("Reading contract data...");
          
          // Try to get contract name
          try {
            const name = await readContract({
              contract,
              method: "function name() view returns (string)",
              params: [],
            });
            
            console.log("Contract name:", name);
          } catch (err) {
            console.log("Could not read contract name:", err);
          }
          
          // Try to get total minted
          try {
            const totalMinted = await readContract({
              contract,
              method: "function totalMinted() view returns (uint256)",
              params: [],
            });
            
            console.log("Total minted:", totalMinted);
          } catch (err) {
            console.log("Could not read totalMinted:", err);
          }
          
          // Try to read total supply
          try {
            const totalSupply = await readContract({
              contract,
              method: "function totalSupply() view returns (uint256)",
              params: [],
            });
            
            console.log("Total supply:", totalSupply);
            if (totalSupply !== undefined) {
              setTotalMinted(Number(totalSupply));
            }
          } catch (err) {
            console.log("Could not read total supply:", err);
          }
          
          // Check if public minting is active
          try {
            const publicMintEnabled = await readContract({
              contract,
              method: "function publicMintEnabled() view returns (bool)",
              params: [],
            });
            
            console.log("Public mint enabled:", publicMintEnabled);
            
            if (publicMintEnabled === false) {
              setError("Public minting is not enabled yet. Please check back later.");
            }
          } catch (err) {
            console.log("Could not check if public minting is enabled:", err);
          }
          
          // Also try isPublicSaleActive naming (common in other contracts)
          try {
            const isPublicSaleActive = await readContract({
              contract,
              method: "function isPublicSaleActive() view returns (bool)",
              params: [],
            });
            
            console.log("Is public sale active:", isPublicSaleActive);
            
            if (isPublicSaleActive === false) {
              setError("Public sale is not active yet. Please check back later.");
            }
          } catch (err) {
            console.log("Could not check if public sale is active:", err);
          }
          
          // Try standard maxSupply if maxTotalSupply fails
          try {
            const maxSupplyData = await readContract({
              contract,
              method: "function maxSupply() view returns (uint256)",
              params: [],
            });
            
            console.log("Max supply:", maxSupplyData);
            if (maxSupplyData !== undefined) {
              setMaxSupply(Number(maxSupplyData));
            }
          } catch (err) {
            console.log("Could not read max supply:", err);
          }
          
          // Try to get next token ID info
          try {
            const nextTokenIdToClaim = await readContract({
              contract,
              method: "function nextTokenIdToClaim() view returns (uint256)",
              params: [],
            });
            
            console.log("Next token ID to claim:", nextTokenIdToClaim);
          } catch (err) {
            console.log("Could not read nextTokenIdToClaim:", err);
          }
          
          try {
            const nextTokenIdToMint = await readContract({
              contract,
              method: "function nextTokenIdToMint() view returns (uint256)",
              params: [],
            });
            
            console.log("Next token ID to mint:", nextTokenIdToMint);
          } catch (err) {
            console.log("Could not read nextTokenIdToMint:", err);
          }
          
          // Try to get mint price
          try {
            const priceData = await readContract({
              contract, 
              method: "function cost() view returns (uint256)",
              params: [],
            });
            
            if (priceData !== undefined) {
              // Convert from wei to ETH (divide by 10^18)
              const priceInEth = Number(priceData) / 10**18;
              console.log("Mint price from contract:", priceInEth, "ETH");
              setNftPrice(priceInEth);
            }
          } catch (err) {
            console.log("Could not read mint price:", err);
          }
          
          // Check owner address
          try {
            const owner = await readContract({
              contract,
              method: "function owner() view returns (address)",
              params: [],
            });
            
            console.log("Contract owner:", owner);
            
            if (account && owner && owner.toLowerCase() === account.address.toLowerCase()) {
              console.log("You are the contract owner - special functions may be available");
            }
          } catch (err) {
            console.log("Could not read contract owner:", err);
          }
          
        } catch (err) {
          console.log("Error reading contract data:", err);
          console.log("Using hardcoded values due to API issues");
        }
      } catch (err) {
        console.error("Error in contract initialization:", err);
      }
    };

    fetchContractData();
  }, [account]);

  // Increment mint amount
  const incrementAmount = () => {
    setMintAmount(prev => Math.min(prev + 1, 10)); // Max 10 NFTs at once
  };

  // Decrement mint amount
  const decrementAmount = () => {
    setMintAmount(prev => Math.max(prev - 1, 1)); // Min 1 NFT
  };

  // Calculate total price with precise formatting to match the image
  const totalPrice = (nftPrice * mintAmount).toFixed(4);
  // Format the price for display with ETH suffix
  const displayPrice = `${nftPrice.toFixed(4)} ETH`;
  const displayTotal = `${(nftPrice * mintAmount).toFixed(4)} ETH`;

  // Handle minting using the ERC721 extension approach
  const handleMint = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
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
      
      console.log("Using Thirdweb ERC721 extension for claiming...");
      
      // Create the claim transaction using the extension
      const transaction = claimTo({
        contract,
        to: account.address,
        quantity: BigInt(mintAmount),
      });
      
      console.log("Claim transaction prepared:", transaction);
      
      // Send the transaction
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });
      
      console.log("Claim successful with hash:", transactionHash);
      
      setSuccess(true);
      setTxHash(transactionHash);
      
      // Update after mint
      setTimeout(() => {
        // Refresh data - using increment since API fails
        setTotalMinted(prev => prev !== null ? prev + mintAmount : mintAmount);
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error("Error claiming NFT:", err);
      
      // Fallback to original approach if the extension fails
      try {
        console.log("Extension failed, falling back to standard claim method...");
        
        // Get contract
        const contract = getContract({
          client,
          chain: abstractTestnet,
          address: NFT_CONTRACT_ADDRESS
        });
        
        // Calculate price
        const totalPriceWei = BigInt(Math.floor(nftPrice * 10**18)) * BigInt(mintAmount);
        
        // Try with standard claim function
        const transaction = await prepareContractCall({
          contract,
          method: "function claim(address _receiver, uint256 _quantity) payable",
          params: [account.address, BigInt(mintAmount)],
          value: totalPriceWei
        });
        
        console.log("Standard claim prepared:", transaction);
        
        const result = await sendTransaction({
          transaction,
          account,
        });
        
        console.log("Standard claim sent:", result);
        
        setSuccess(true);
        setTxHash(result.transactionHash);
        
        // Update after mint
        setTimeout(() => {
          setTotalMinted(prev => prev !== null ? prev + mintAmount : mintAmount);
          setSuccess(false);
        }, 5000);
        
        return;
      } catch (fallbackErr) {
        console.error("Fallback approach also failed:", fallbackErr);
        
        // Provide a more detailed error message based on the error type
        if (err?.message?.includes("execution reverted")) {
          setError("Transaction failed: The contract reverted the transaction. This might be because claim conditions are not set yet or you don't meet the criteria (allowlist, max per wallet, etc).");
        } else if (err?.code === -32603) {
          setError("Transaction failed: Internal error. Check if you have enough ETH for gas and the mint price.");
        } else if (err?.code === 4001) {
          setError("Transaction cancelled: You rejected the transaction in your wallet.");
        } else {
          setError(err?.message || "Failed to mint. The contract might need claim conditions to be set up first.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Background gradient */}
      <div className="background-gradient"></div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-5xl px-6 py-16">
        {/* NFT Display */}
        <div className="mb-8 relative">
          <div className="rounded-lg overflow-hidden shadow-glow-xl">
            <Image 
              src="/1.GIF" 
              alt="NFT Preview" 
              width={400} 
              height={400}
              className="rounded-lg" 
            />
          </div>
        </div>
        
        {/* Mint Controls */}
        <div className="p-8 rounded-xl w-full max-w-md backdrop-blur-lg bg-black bg-opacity-70 border border-gray-700 shadow-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Mint Your NFT</h2>
          
          {/* Minting Progress */}
          {totalMinted !== null && maxSupply !== null && (
            <div className="mb-4 text-center">
              <p className="text-gray-300">
                <span className="text-purple-400 font-bold">{totalMinted}</span> / <span className="font-bold">{maxSupply}</span> minted
              </p>
            </div>
          )}
          
          {/* Contract Status */}
          <div className="mb-4 bg-zinc-800 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Contract Status</h3>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white font-mono">KITE</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Total Supply:</span>
                <span className="text-white font-mono">{totalMinted !== null ? totalMinted : "Loading..."}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-400">Next Token ID:</span>
                <span className="text-white font-mono">3</span>
              </p>
              {error && error.includes("not enabled yet") && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ This contract appears to be in setup mode or waiting for public sale to be enabled
                </p>
              )}
            </div>
          </div>
          
          {/* Quantity Selector */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg text-white">Quantity:</span>
            <div className="flex items-center">
              <button 
                onClick={decrementAmount}
                disabled={mintAmount <= 1}
                className="bg-zinc-800 hover:bg-zinc-700 w-10 h-10 flex items-center justify-center text-xl font-bold rounded-l-md text-white disabled:opacity-50"
              >
                -
              </button>
              <span className="bg-zinc-900 text-white px-6 py-2 text-xl font-bold border-x border-zinc-700">
                {mintAmount}
              </span>
              <button 
                onClick={incrementAmount}
                disabled={mintAmount >= 10}
                className="bg-zinc-800 hover:bg-zinc-700 w-10 h-10 flex items-center justify-center text-xl font-bold rounded-r-md text-white disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
          
          {/* Price Information */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Price per NFT:</span>
              <span className="font-semibold text-white">{displayPrice}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Total:</span>
              <span className="text-purple-400">{displayTotal}</span>
            </div>
          </div>
          
          {/* Mint Button */}
          <button
            onClick={handleMint}
            disabled={loading || !account}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-white shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Mint ${mintAmount} NFT${mintAmount > 1 ? "s" : ""}`
            )}
          </button>
          
          {/* Error Message */}
          {error && (
            <div className="mt-4 border border-red-500/30 bg-red-500/10 p-3 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              {error.includes("execution reverted") && (
                <ul className="mt-2 text-xs text-red-300 list-disc pl-4">
                  <li>Public minting might be enabled but paused</li>
                  <li>The contract might have a maximum mint limit per wallet</li>
                  <li>The contract might require a different exact price</li>
                  <li>The sale might be over (max supply reached)</li>
                </ul>
              )}
              {error.includes("not in a mintable state") && (
                <div className="mt-2 bg-zinc-800 p-2 rounded text-xs">
                  <p className="text-gray-300 mb-1">If you&apos;re the contract owner, you might need to:</p>
                  <code className="text-purple-300 font-mono block p-1">
                    1. Call setPublicMintEnabled(true)<br />
                    2. Set cost to a valid amount<br />
                    3. Set a valid max supply
                  </code>
                </div>
              )}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div className="mt-4 text-green-500 text-center">
              Successfully minted! Transaction: 
              <a 
                href={`https://abstract.thirdweb.com/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-300 ml-1"
              >
                View details
              </a>
            </div>
          )}
          
          {/* Connect Wallet Message */}
          {!account && (
            <div className="mt-4 text-yellow-300 text-center text-sm">
              Please connect your wallet using the button in the navbar to mint
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
