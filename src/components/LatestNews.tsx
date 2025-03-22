import React from 'react';
import Image from 'next/image';

// News article type definition
interface NewsArticle {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  link: string;
}

// Sample news data
const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: "WORLD OF GARU NFT Collection Launch",
    description: "Introducing our exclusive NFT collection on Abstract Testnet. Get early access to unique digital collectibles.",
    date: "2024-03-21",
    imageUrl: "/img/19.GIF",
    link: "#"
  },
  {
    id: 2,
    title: "Daily Login Rewards System Added",
    description: "Earn multipliers and rewards by logging in daily. Build your streak for bigger bonuses.",
    date: "2024-03-20",
    imageUrl: "/img/Poster1.png",
    link: "#"
  },
  {
    id: 3,
    title: "Token Staking Coming Soon",
    description: "Stake your GARU tokens to earn passive income and exclusive benefits in our ecosystem.",
    date: "2024-03-19",
    imageUrl: "/img/nft-placeholder.jpg",
    link: "#"
  }
];

interface LatestNewsProps {
  maxArticles?: number;
}

export default function LatestNews({ maxArticles = 3 }: LatestNewsProps) {
  // Get the most recent articles up to maxArticles
  const articles = newsArticles.slice(0, maxArticles);
  
  return (
    <div className="bg-black/95 border border-zinc-800 rounded-xl p-4 shadow-lg backdrop-blur-md w-full">
      <h2 className="text-xl font-bold text-white mb-3 border-b border-zinc-700/50 pb-2">
        Latest Updates <span className="text-yellow-400">_</span>
      </h2>
      
      <div className="flex flex-wrap gap-4">
        {articles.slice(0, 2).map((article, index) => (
          <a 
            key={article.id}
            href={article.link}
            className="w-[calc(50%-8px)] flex flex-col group hover:bg-zinc-800/30 transition-all duration-200 rounded-sm"
            aria-label={`Read more about ${article.title}`}
          >
            <div className="h-[148px] relative flex-shrink-0 overflow-hidden">
              <Image 
                src={article.imageUrl} 
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col mt-1">
              <h3 className="text-white font-bold text-xs uppercase tracking-wide group-hover:text-yellow-400 transition-colors">{article.title}</h3>
              <p className="text-zinc-400 text-[11px] line-clamp-3 my-1">{article.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-[10px]">{`${article.date.substring(0, 4)}-${article.date.substring(5)}`}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="mt-3 text-center">
        <button className="px-4 py-1.5 bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 rounded-md text-xs border border-zinc-700/50 transition-colors">
          View All Updates
        </button>
      </div>
    </div>
  );
} 