import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { abstractTestnet } from "thirdweb/chains";
import Image from "next/image";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="absolute inset-0 bg-zinc-900/10 backdrop-blur-md border-b border-white/10"></div>
      <div className="container relative mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo on the left */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mr-2 shadow-glow">
            <span className="text-white font-bold text-sm">WG</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            World of Garu
          </h1>
        </div>

        {/* Connect Button on the right */}
        <div className="glassmorphism-button">
          <ConnectButton
            client={client}
            chain={abstractTestnet}
            appMetadata={{
              name: "World of Garu",
              url: "https://worldofgaru.xyz",
            }}
          />
        </div>
      </div>
    </nav>
  );
} 