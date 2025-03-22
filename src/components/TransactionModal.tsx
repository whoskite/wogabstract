import { AlertCircle, Check, Loader2 } from "lucide-react";
import Image from "next/image";

interface TransactionModalProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
  txHash?: string | null;
  error?: string | null;
  onClose: () => void;
  visible: boolean;
  tokenId?: number | null;
  imageUrl?: string | null;
}

export function TransactionModal({
  status,
  message,
  txHash,
  error,
  onClose,
  visible,
  tokenId,
  imageUrl
}: TransactionModalProps) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-2xl w-full max-w-md mx-4 shadow-xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-yellow-500 h-16 w-16 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Processing Transaction</h3>
            <p className="text-zinc-400 text-center">{message}</p>
            <p className="text-zinc-500 text-sm mt-4">This may take a moment...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="flex flex-col items-center">
            {/* Display the NFT image if available */}
            {imageUrl && (
              <div className="relative w-48 h-48 mb-6 rounded-lg overflow-hidden border-2 border-yellow-500/30">
                <Image 
                  src={imageUrl} 
                  alt={`NFT #${tokenId || 'unknown'}`}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = "/img/nft-placeholder.jpg";
                  }}
                />
              </div>
            )}
            
            <div className="bg-green-900/30 p-4 rounded-full mb-4">
              <Check className="text-green-500 h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Transaction Successful!</h3>
            <p className="text-zinc-400 text-center mb-4">{message}</p>
            {txHash && (
              <a 
                href={`https://testnet.abstractscan.com/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-yellow-500 hover:text-yellow-400 text-sm underline mb-4"
              >
                View on AbstractScan
              </a>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="bg-red-900/30 p-4 rounded-full mb-4">
              <AlertCircle className="text-red-500 h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Transaction Failed</h3>
            <p className="text-zinc-400 text-center mb-4">{message}</p>
            {error && <p className="text-zinc-500 text-sm">{error}</p>}
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 