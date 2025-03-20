import { useState, useEffect } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../client";
import { abstractTestnet } from "thirdweb/chains";

const NFT_CONTRACT_ADDRESS = "0x68f5edeC0cfc0cB0129e2F459668154485474556";

export function NFTMinting() {
  const account = useActiveAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [totalMinted, setTotalMinted] = useState<number | null>(null);
  const [maxSupply, setMaxSupply] = useState<number | null>(null);

  // Fetch total minted and max supply when component mounts or account changes
  useEffect(() => {
    const fetchContractData = async () => {
      try {
        // Use thirdweb's SDK to get contract data
        const response = await fetch(`https://api.thirdweb.com/contract/${abstractTestnet.id}/${NFT_CONTRACT_ADDRESS}`);
        const data = await response.json();
        
        if (data && data.totalSupply) {
          setTotalMinted(Number(data.totalSupply));
        }
        
        if (data && data.maxSupply) {
          setMaxSupply(Number(data.maxSupply));
        }
      } catch (err) {
        console.error("Error fetching contract data:", err);
      }
    };
    
    fetchContractData();
  }, [account]);

  // Handle minting
  const handleMint = async () => {
    if (!account) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Redirect to thirdweb's embeddable checkout page for NFT Drop contract
      window.open(
        `https://embed.thirdweb.com/${abstractTestnet.id}/${NFT_CONTRACT_ADDRESS}?quantity=${mintAmount}&clientId=${process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID}`,
        "_blank"
      );
    } catch (err: any) {
      console.error("Mint error:", err);
      setError(err?.message || "Failed to open minting page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mint amount changes
  const decreaseMintAmount = () => {
    if (mintAmount > 1) {
      setMintAmount(mintAmount - 1);
    }
  };

  const increaseMintAmount = () => {
    if (mintAmount < 10) {
      setMintAmount(mintAmount + 1);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md p-6 bg-zinc-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-zinc-100">Mint Your NFT</h2>
      
      {!account ? (
        <div className="mb-4 w-full flex flex-col items-center">
          <p className="text-zinc-300 mb-6 text-center">
            Connect your wallet using the button in the top right corner to mint NFTs
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 w-full">
            {totalMinted !== null && maxSupply !== null && (
              <p className="text-zinc-300 text-center">
                {totalMinted} / {maxSupply} minted
              </p>
            )}
            <p className="text-zinc-300 text-center mt-2">
              Select quantity and mint your NFTs
            </p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <button
              className="bg-zinc-700 hover:bg-zinc-600 text-white w-10 h-10 rounded-l-lg"
              onClick={decreaseMintAmount}
            >
              -
            </button>
            <span className="bg-zinc-900 text-white px-6 py-2 text-xl font-bold">
              {mintAmount}
            </span>
            <button
              className="bg-zinc-700 hover:bg-zinc-600 text-white w-10 h-10 rounded-r-lg"
              onClick={increaseMintAmount}
            >
              +
            </button>
          </div>
          
          <button
            className={`w-full py-3 px-6 rounded-lg font-bold ${
              isLoading
                ? "bg-zinc-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white transition-colors`}
            onClick={handleMint}
            disabled={isLoading}
          >
            {isLoading ? "Opening..." : `Mint ${mintAmount} NFT${mintAmount > 1 ? "s" : ""}`}
          </button>
          
          {error && (
            <p className="mt-4 text-red-500 text-sm text-center">
              Error: {error}
            </p>
          )}
        </>
      )}
    </div>
  );
} 