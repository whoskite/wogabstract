"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from "@/app/components/ui/ConnectButton";
import { useActiveAccount } from "thirdweb/react";
import Link from 'next/link';

export function Navbar() {
  const account = useActiveAccount();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 pt-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center bg-black/80 backdrop-blur-xl rounded-xl px-6 py-2 border border-blue-500/20 shadow-lg shadow-blue-500/10 w-full md:w-2/5 mx-auto">
          {/* Game Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-white flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 mr-1">WORLD</span>
              <span className="text-white font-light">OF</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-500 ml-1">GARU</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
} 