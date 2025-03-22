import { createThirdwebClient } from "thirdweb";

// Get client ID from environment variable with fallback
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID || "7242a0e9418d8a2e03c5c6b089b3e7bb";

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId,
});

// For server-side operations
export const serverClient = typeof window === "undefined" ? 
  createThirdwebClient({
    clientId,
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  }) : 
  null;
