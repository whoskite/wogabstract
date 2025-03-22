"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import Image from "next/image";
import Link from "next/link";

export default function About() {
  const [isGlitching, setIsGlitching] = useState(false);
  const [activeSection, setActiveSection] = useState('project');

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.85) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  // Handle section change
  const changeSection = (section: string) => {
    setActiveSection(section);
  };

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Background effects */}
      <div className="background-gradient"></div>
      <div className="background-grid"></div>
      <div className="noise-overlay"></div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* About section */}
      <div className="w-full max-w-6xl px-6 pt-32 pb-16">
        <div className="mb-12 text-center">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isGlitching ? 'text-glitch' : ''}`}>
            <span className="text-neon-pink">AB</span>
            <span className="text-white">OUT_</span>
            <span className="text-neon-blue">PROJECT</span>
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            World of Garu is a collection of unique digital artworks that explore the intersection of industrial aesthetics, cyberpunk culture, and abstract digital art.
          </p>
        </div>
        
        {/* Section tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-black border border-neon-blue p-1">
            <button 
              onClick={() => changeSection('project')}
              className={`px-6 py-2 font-mono text-sm transition-all ${activeSection === 'project' ? 'bg-neon-blue bg-opacity-20 text-white' : 'text-gray-400 hover:text-neon-blue'}`}
            >
              PROJECT
            </button>
            <button 
              onClick={() => changeSection('team')}
              className={`px-6 py-2 font-mono text-sm transition-all ${activeSection === 'team' ? 'bg-neon-pink bg-opacity-20 text-white' : 'text-gray-400 hover:text-neon-pink'}`}
            >
              TEAM
            </button>
            <button 
              onClick={() => changeSection('roadmap')}
              className={`px-6 py-2 font-mono text-sm transition-all ${activeSection === 'roadmap' ? 'bg-neon-green bg-opacity-20 text-white' : 'text-gray-400 hover:text-neon-green'}`}
            >
              ROADMAP
            </button>
            <button 
              onClick={() => changeSection('faq')}
              className={`px-6 py-2 font-mono text-sm transition-all ${activeSection === 'faq' ? 'bg-purple-500 bg-opacity-20 text-white' : 'text-gray-400 hover:text-purple-400'}`}
            >
              FAQ
            </button>
          </div>
        </div>
        
        {/* Project Info Section */}
        {activeSection === 'project' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="order-2 md:order-1">
              <div className="terminal-card mb-6">
                <h2 className="text-xl font-bold text-neon-blue mb-4 font-mono">PROJECT_OVERVIEW</h2>
                <p className="text-gray-300 mb-4">
                  World of Garu is a collection of unique digital artworks that explore the intersection of industrial aesthetics, cyberpunk culture, and abstract digital art.
                </p>
                <p className="text-gray-300 mb-4">
                  Each piece in the collection is algorithmically generated with carefully curated elements that create a sense of dystopian beauty through controlled chaos and digital distortion.
                </p>
                <p className="text-gray-300">
                  The project aims to push the boundaries of digital art while exploring themes of technology, industrialization, and the beauty found in imperfection.
                </p>
              </div>
              
              <div className="terminal-card">
                <h2 className="text-xl font-bold text-neon-pink mb-4 font-mono">TECHNICAL_SPECS</h2>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">TOTAL_SUPPLY</span>
                    <span className="text-white">5,000</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">BLOCKCHAIN</span>
                    <span className="text-neon-blue">Abstract Testnet</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">TOKEN_STANDARD</span>
                    <span className="text-white">ERC-721</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">METADATA</span>
                    <span className="text-white">IPFS / On-chain</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MINT_PRICE</span>
                    <span className="text-neon-green">0.0001 ETH</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="cyberpunk-border rounded-lg overflow-hidden">
                <div className="relative">
                  <Image 
                    src="/1.GIF" 
                    alt="World of Garu Collection" 
                    width={600} 
                    height={600}
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-black opacity-40"></div>
                  
                  {/* Digital frame corners */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-neon-blue"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-neon-pink"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-neon-pink"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-neon-blue"></div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-black bg-opacity-60 border border-neon-blue border-opacity-30 text-gray-400 text-sm">
                <p className="font-mono">
                  <span className="text-neon-pink">&gt;</span> Each piece combines industrial textures with digital glitches to create unique abstract compositions that reflect our relationship with technology.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Team Section */}
        {activeSection === 'team' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              <span className="text-neon-pink">#</span> THE_CREATORS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Team Member 1 */}
              <div className="terminal-card p-6 hover:border-neon-pink transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-2 border-neon-blue flex items-center justify-center">
                  <span className="text-neon-blue font-mono text-xl">WG</span>
                </div>
                <h3 className="text-neon-blue text-center font-bold mb-1">CREATOR_01</h3>
                <p className="text-gray-400 text-center text-sm mb-3 font-mono">LEAD_ARTIST</p>
                <p className="text-gray-300 text-sm text-center">
                  Digital artist specializing in glitch aesthetics and industrial abstractions.
                </p>
              </div>
              
              {/* Team Member 2 */}
              <div className="terminal-card p-6 hover:border-neon-green transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-2 border-neon-pink flex items-center justify-center">
                  <span className="text-neon-pink font-mono text-xl">DV</span>
                </div>
                <h3 className="text-neon-pink text-center font-bold mb-1">CREATOR_02</h3>
                <p className="text-gray-400 text-center text-sm mb-3 font-mono">DEVELOPER</p>
                <p className="text-gray-300 text-sm text-center">
                  Blockchain specialist with focus on NFT smart contracts and web3 integration.
                </p>
              </div>
              
              {/* Team Member 3 */}
              <div className="terminal-card p-6 hover:border-neon-blue transition-all duration-300">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-black border-2 border-neon-green flex items-center justify-center">
                  <span className="text-neon-green font-mono text-xl">MK</span>
                </div>
                <h3 className="text-neon-green text-center font-bold mb-1">CREATOR_03</h3>
                <p className="text-gray-400 text-center text-sm mb-3 font-mono">STRATEGIST</p>
                <p className="text-gray-300 text-sm text-center">
                  Community builder with experience in digital art curation and marketing.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Roadmap Section */}
        {activeSection === 'roadmap' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              <span className="text-neon-green">#</span> PROJECT_TIMELINE
            </h2>
            
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-0 md:left-1/2 transform md:translate-x-[-50%] top-0 bottom-0 w-1 bg-gradient-to-b from-neon-pink via-neon-blue to-neon-green"></div>
              
              {/* Phase 1 */}
              <div className="mb-16 md:mb-24 relative">
                <div className="flex flex-col md:flex-row items-start">
                  <div className="order-2 md:order-1 md:w-1/2 pr-0 md:pr-8 pt-8 md:pt-0 md:text-right">
                    <h3 className="text-neon-pink font-bold mb-3 font-mono">PHASE_01: LAUNCH</h3>
                    <div className="terminal-card">
                      <p className="text-gray-300 mb-2">Initial collection release of 1,000 pieces with public mint.</p>
                      <p className="text-gray-300 mb-2">Community building and social platforms setup.</p>
                      <p className="text-gray-300">Partnerships with digital art platforms and exhibitions.</p>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 md:w-1/2 pl-8 relative">
                    <div className="absolute left-0 md:left-[-8px] top-0 md:top-4 w-4 h-4 rounded-full bg-neon-pink z-10"></div>
                    <div className="absolute left-[7px] md:left-[-1px] top-0 bottom-0 w-[2px] md:hidden bg-gradient-to-b from-neon-pink to-neon-blue"></div>
                  </div>
                </div>
              </div>
              
              {/* Phase 2 */}
              <div className="mb-16 md:mb-24 relative">
                <div className="flex flex-col md:flex-row items-start">
                  <div className="order-2 md:w-1/2 pl-8 md:pl-8">
                    <h3 className="text-neon-blue font-bold mb-3 font-mono">PHASE_02: EXPANSION</h3>
                    <div className="terminal-card">
                      <p className="text-gray-300 mb-2">Release of 2,000 additional pieces with enhanced features.</p>
                      <p className="text-gray-300 mb-2">Launch of staking rewards for NFT holders.</p>
                      <p className="text-gray-300">Community treasury establishment for future development.</p>
                    </div>
                  </div>
                  <div className="order-1 md:w-1/2 pr-0 md:pr-8 relative">
                    <div className="absolute left-0 md:right-[-8px] top-0 md:top-4 w-4 h-4 rounded-full bg-neon-blue z-10"></div>
                    <div className="absolute left-[7px] md:hidden top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-blue to-neon-green"></div>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="relative">
                <div className="flex flex-col md:flex-row items-start">
                  <div className="order-2 md:order-1 md:w-1/2 pr-0 md:pr-8 pt-8 md:pt-0 md:text-right">
                    <h3 className="text-neon-green font-bold mb-3 font-mono">PHASE_03: EVOLUTION</h3>
                    <div className="terminal-card">
                      <p className="text-gray-300 mb-2">Final collection release completing the 5,000 piece series.</p>
                      <p className="text-gray-300 mb-2">Interactive digital exhibition in the metaverse.</p>
                      <p className="text-gray-300">Exclusive physical art prints for long-term holders.</p>
                    </div>
                  </div>
                  <div className="order-1 md:order-2 md:w-1/2 pl-8 relative">
                    <div className="absolute left-0 md:left-[-8px] top-0 md:top-4 w-4 h-4 rounded-full bg-neon-green z-10"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* FAQ Section */}
        {activeSection === 'faq' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              <span className="text-purple-500">#</span> FREQUENTLY_ASKED_QUESTIONS
            </h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="terminal-card">
                <h3 className="text-neon-pink font-bold mb-2">WHAT IS WORLD OF GARU?</h3>
                <p className="text-gray-300">
                  World of Garu is a collection of 5,000 uniquely generated NFT artworks that combine industrial aesthetics with digital glitch art. Each piece is a one-of-a-kind digital asset stored on the blockchain.
                </p>
              </div>
              
              <div className="terminal-card">
                <h3 className="text-neon-blue font-bold mb-2">HOW DO I PURCHASE AN NFT?</h3>
                <p className="text-gray-300">
                  Connect your wallet on our homepage, select the quantity you wish to mint, and click the mint button. You&apos;ll need to approve the transaction in your wallet and pay the mint price plus gas fees.
                </p>
              </div>
              
              <div className="terminal-card">
                <h3 className="text-neon-green font-bold mb-2">WHAT ARE THE BENEFITS OF OWNING?</h3>
                <p className="text-gray-300">
                  Owners gain access to exclusive community features, future airdrops, staking rewards, and voting rights on project decisions. Each NFT serves as both a unique piece of digital art and a membership token.
                </p>
              </div>
              
              <div className="terminal-card">
                <h3 className="text-purple-500 font-bold mb-2">WHEN WILL THE FULL COLLECTION LAUNCH?</h3>
                <p className="text-gray-300">
                  The collection will be released in three phases over the next year, with the first 1,000 pieces available now. Follow our social channels for announcements about future release dates.
                </p>
              </div>
              
              <div className="terminal-card">
                <h3 className="text-neon-pink font-bold mb-2">CAN I SELL MY NFT?</h3>
                <p className="text-gray-300">
                  Yes, once minted, you have full ownership rights to your NFT. You can sell it on any compatible NFT marketplace that supports the Abstract Testnet blockchain.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-block cyberpunk-border p-px rounded">
            <Link 
              href="/" 
              className="bg-black py-4 px-10 block text-white font-mono text-lg hover:text-neon-blue transition-colors font-bold"
            >
              &lt; BACK_TO_MINT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 