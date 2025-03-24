import React, { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

// News article type definition
interface NewsArticle {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  content: string; // Full article content
  author?: string;
}

// Sample news data with updated dates and full content
const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "WORLD OF GARU NFT Collection Launch",
    description: "Introducing our exclusive NFT collection on Abstract Testnet. Get early access to unique digital collectibles.",
    date: "2025-03-28",
    imageUrl: "/img/19.GIF",
    author: "WOGA Team",
    content: `
      <h2>Introducing the WORLD OF GARU NFT Collection</h2>
      
      <p>We're thrilled to announce the official launch of our exclusive NFT collection on Abstract Testnet. This collection represents months of creative work and technical development, bringing unique digital collectibles to our community.</p>
      
      <p>Each NFT in the collection features distinct attributes and rarities, with some pieces having special utilities within our ecosystem. Holders will gain exclusive access to future drops, community events, and potential airdrops.</p>
      
      <h3>Collection Highlights:</h3>
      <ul>
        <li>500 unique pieces with varying rarities</li>
        <li>Special edition animated NFTs</li>
        <li>Holder benefits including multipliers and staking advantages</li>
        <li>Community governance rights</li>
      </ul>
      
      <p>The minting process is now live! Connect your wallet and start building your collection today. Remember that early adopters will receive additional benefits in our upcoming releases.</p>
      
      <p>Stay tuned for more updates and exclusive community events!</p>
    `
  },
  {
    id: 2,
    title: "Daily Login Rewards System Added",
    description: "Earn multipliers and rewards by logging in daily. Build your streak for bigger bonuses.",
    date: "2025-03-31",
    imageUrl: "/img/Poster1.png",
    author: "Product Team",
    content: `
      <h2>Introducing Daily Login Rewards</h2>
      
      <p>We're excited to announce a new feature to reward our most loyal community members - the Daily Login Rewards system!</p>
      
      <p>Starting today, you'll earn special rewards just for logging into your account daily. The longer your streak goes, the better your rewards become!</p>
      
      <h3>How It Works:</h3>
      <ul>
        <li>Log in daily to build your streak counter</li>
        <li>Each consecutive day increases your multiplier</li>
        <li>Special milestone rewards at 7, 14, 21, and 28 days</li>
        <li>Weekly bonuses for unbroken streaks</li>
      </ul>
      
      <p>These rewards include GARU tokens, multipliers for staking, and exclusive access to special NFT drops. Don't miss a day to maximize your rewards!</p>
      
      <p>The system is designed to create a more engaging daily experience and reward our most active community members. We've got more exciting features planned for the coming months!</p>
    `
  },
  {
    id: 3,
    title: "Token Staking Coming Soon",
    description: "Stake your GARU tokens to earn passive income and exclusive benefits in our ecosystem.",
    date: "2025-03-31",
    imageUrl: "/img/nft-placeholder.jpg",
    author: "Finance Team",
    content: `
      <h2>Token Staking Feature Announcement</h2>
      
      <p>We're thrilled to announce our upcoming token staking feature, scheduled to launch next month! This highly anticipated addition to our platform will allow GARU token holders to earn passive income while supporting the network.</p>
      
      <p>Our staking system has been designed to provide both short and long-term benefits to participants, with flexible options for different investment strategies.</p>
      
      <h3>Staking Benefits:</h3>
      <ul>
        <li>Earn up to 15% APY on staked tokens</li>
        <li>Flexible lock periods from 1 to 12 months</li>
        <li>Higher multipliers for longer staking periods</li>
        <li>Special NFT drops exclusively for stakers</li>
        <li>Governance voting rights weighted by stake amount</li>
      </ul>
      
      <p>The staking platform has undergone rigorous security audits and testing to ensure your assets remain safe. We've partnered with leading blockchain security firms to verify all smart contracts.</p>
      
      <p>Stay tuned for the official launch announcement and get ready to put your GARU tokens to work!</p>
    `
  }
];

interface LatestNewsProps {
  maxArticles?: number;
  onSoundHover?: () => void;
  onSoundSelect?: () => void;
}

// Animation styles
const animationStyles = `
  @keyframes subtleHighlight {
    0% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.6;
    }
  }
  
  .news-highlight {
    animation: subtleHighlight 4s infinite ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .article-popup {
    animation: fadeIn 0.3s ease-out forwards;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.7);
  }
  
  .article-content h2 {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    color: #FFC107;
  }
  
  .article-popup h1 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #FFC107;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  
  .article-content h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-top: 1.3rem;
    margin-bottom: 0.75rem;
    color: white;
  }
  
  .article-content p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  .article-content ul {
    list-style-type: disc;
    margin-left: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .article-content li {
    margin-bottom: 0.5rem;
  }

  .article-popup::-webkit-scrollbar {
    width: 6px;
  }
  
  .article-popup::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .article-popup::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
  }
`;

export default function LatestNews({ maxArticles = 3, onSoundHover, onSoundSelect }: LatestNewsProps) {
  // Get the most recent articles up to maxArticles
  const articles = newsArticles.slice(0, maxArticles);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Handle opening article popup
  const handleOpenArticle = (article: NewsArticle) => {
    if (onSoundSelect) onSoundSelect();
    setSelectedArticle(article);
    // Prevent scrolling when popup is open
    document.body.style.overflow = 'hidden';
  };

  // Handle closing article popup
  const handleCloseArticle = () => {
    if (onSoundHover) onSoundHover();
    setSelectedArticle(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
  };

  // Inject animation styles
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = animationStyles;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  
  return (
    <>
      <div ref={containerRef} className="bg-zinc-900/90 border border-zinc-800/50 rounded-xl p-4 shadow-sm backdrop-blur-md w-full">
        <div className="mb-3 border-b border-zinc-800/30 pb-2">
          <h2 className="text-xl font-bold text-white flex items-center">
            Latest Updates 
            <span className="text-[#FFC107] ml-1 news-highlight">_</span>
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button 
            onClick={() => handleOpenArticle(articles[0])}
            onMouseEnter={onSoundHover}
            className="flex flex-col group transition-all duration-300 text-left h-[72px] relative overflow-hidden rounded-none"
            aria-label={`Read more about ${articles[0].title}`}
          >
            <div className="absolute inset-0 w-full h-full">
              <Image 
                src={articles[0].imageUrl} 
                alt={articles[0].title}
                fill
                className="object-cover brightness-90 transition-transform duration-500 filter"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center h-full px-2 py-1">
              <h3 className="text-[#FFC107] font-bold text-xs uppercase tracking-wide drop-shadow-md text-center">
                NFT<br/>LAUNCH
              </h3>
            </div>
          </button>
          
          <button 
            onClick={() => handleOpenArticle(articles[1])}
            onMouseEnter={onSoundHover}
            className="flex flex-col group transition-all duration-300 text-left h-[72px] relative overflow-hidden rounded-none bg-zinc-900"
            aria-label={`Read more about ${articles[1].title}`}
          >
            <div className="absolute inset-0 w-full h-full">
              <Image 
                src={articles[1].imageUrl} 
                alt={articles[1].title}
                fill
                className="object-cover brightness-90 transition-transform duration-500 filter"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
            </div>
            
            <div className="relative z-10 flex flex-col justify-center h-full px-2 py-1">
              <h3 className="text-[#FFC107] font-bold text-xs uppercase tracking-wide drop-shadow-md text-center">
                REWARD<br/>SYSTEM<br/>ADDED
              </h3>
            </div>
          </button>
        </div>
        
        <div className="text-center mt-2 mb-1">
          <button 
            className="px-4 py-1.5 bg-zinc-800/20 hover:bg-[#FFC107]/10 text-zinc-400 rounded-md text-xs border border-zinc-700/20 transition-all duration-300 hover:text-[#FFC107] hover:border-[#FFC107]/30"
            onMouseEnter={onSoundHover}
            onClick={onSoundSelect}
          >
            View All Updates
          </button>
        </div>
      </div>

      {/* Article Popup */}
      {selectedArticle && containerRef.current && (
        <div 
          className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm"
          onClick={handleCloseArticle}
        >
          <div 
            className="article-popup flex flex-col bg-zinc-900 border border-zinc-800/50 rounded-xl w-full overflow-hidden shadow-xl"
            style={{ 
              position: 'absolute',
              top: containerRef.current.getBoundingClientRect().top + 'px',
              left: containerRef.current.getBoundingClientRect().left + 'px',
              width: containerRef.current.offsetWidth + 'px',
              maxHeight: '480px',
              zIndex: 1001
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative w-full flex-shrink-0" style={{ height: '120px' }}>
              <Image
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black"></div>
              <div className="absolute bottom-3 left-4 right-10">
                <h1 className="text-lg font-bold text-[#FFC107] drop-shadow-md leading-tight">{selectedArticle.title}</h1>
              </div>
              <button 
                onClick={handleCloseArticle}
                onMouseEnter={onSoundHover}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 rounded-full p-1.5 text-white transition-colors z-10"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Article content */}
            <div className="px-4 py-3 overflow-y-auto flex-grow bg-zinc-900" style={{ maxHeight: '360px' }}>
              <div className="flex items-center text-xs text-zinc-400 mb-3">
                <span>{formatDate(selectedArticle.date)}</span>
                {selectedArticle.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{selectedArticle.author}</span>
                  </>
                )}
              </div>
              
              <div 
                className="article-content text-zinc-300 text-sm leading-relaxed pr-2"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 