import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = params.tokenId;
  
  // Use our local GIF file for the NFTs
  const imageUrl = `/1.GIF`;
  
  return new Response(JSON.stringify({
    image: imageUrl,
    name: `World of Garu #${tokenId}`,
    description: "World of Garu is an exclusive collection of digital collectibles for the metaverse.",
    attributes: [
      {
        trait_type: "Token ID",
        value: tokenId
      },
      {
        trait_type: "Collection",
        value: "World of Garu"
      }
    ]
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
} 