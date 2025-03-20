import { NextResponse } from 'next/server';
import { serverClient } from '../../client';
import { abstractTestnet } from "thirdweb/chains";

const NFT_CONTRACT_ADDRESS = "0x68f5edeC0cfc0cB0129e2F459668154485474556";

export async function GET() {
  try {
    if (!serverClient) {
      return NextResponse.json(
        { error: "Server client not available. Check your secret key configuration." },
        { status: 500 }
      );
    }

    // Example of server-side operations using the secret key
    // This can interact with contracts using your wallet permissions
    // and perform operations that require server-side authentication
    
    const data = await fetch(
      `https://api.thirdweb.com/contract/${abstractTestnet.id}/${NFT_CONTRACT_ADDRESS}`,
      {
        headers: {
          "x-secret-key": process.env.THIRDWEB_SECRET_KEY || "",
          "Content-Type": "application/json",
        },
      }
    ).then(res => res.json());

    return NextResponse.json({ 
      message: "NFT contract details fetched from server", 
      data 
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT contract details" },
      { status: 500 }
    );
  }
} 