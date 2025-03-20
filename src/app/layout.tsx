import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "World of Garu - NFT Collection",
  description:
    "Mint exclusive NFTs from the World of Garu collection on Abstract Testnet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient`}>
        <div className="background-gradient"></div>
        <ThirdwebProvider>{children}</ThirdwebProvider>
      </body>
    </html>
  );
}
