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
    <div className="bg-zinc-900/95 border border-neon-blue/40 rounded-xl p-6 shadow-lg backdrop-blur-md w-full">
      <h2 className="text-2xl font-bold text-white mb-6 text-shadow border-b border-zinc-700 pb-3">
        Latest Updates <span className="text-yellow-400">_</span>
      </h2>
      
      <div className="space-y-6">
        {articles.map((article) => (
          <div 
            key={article.id} 
            className="flex flex-col md:flex-row gap-4 pb-4 border-b border-zinc-800 hover:bg-zinc-800/30 rounded-lg p-2 transition-all duration-300"
          >
            <div className="w-full md:w-24 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
              <Image 
                src={article.imageUrl} 
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-bold mb-1 text-lg">{article.title}</h3>
              <p className="text-zinc-400 text-sm mb-2">{article.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs">{article.date}</span>
                <a 
                  href={article.link} 
                  className="text-yellow-400 text-xs hover:text-yellow-300 transition-colors"
                >
                  Read more
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm border border-zinc-700 transition-colors">
          View All Updates
        </button>
      </div>
    </div>
  );
} 