import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThirdwebProviderWrapper from './ThirdwebProviderWrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "World of Garu - NFT Collection",
  description:
    "Mint exclusive NFTs from the World of Garu collection on Abstract Testnet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-zinc-900 text-white antialiased overflow-hidden`}>
        <ThirdwebProviderWrapper>
          {children}
        </ThirdwebProviderWrapper>
      </body>
    </html>
  );
}
