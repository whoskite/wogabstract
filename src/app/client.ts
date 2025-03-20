import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

// For server-side operations, add your secret key
// This should only be used in server-side code (API routes, Server Components, etc.)
// IMPORTANT: Never expose this in client-side code
const secretKey = process.env.THIRDWEB_SECRET_KEY;

if (!clientId) {
  throw new Error("No client ID provided");
}

export const client = createThirdwebClient({
  clientId: clientId,
  // The secretKey should only be included in server-side environments
  ...(typeof window === "undefined" && secretKey ? { secretKey } : {})
});

// For explicit server-side operations
export const serverClient = (typeof window === "undefined" && secretKey) ? 
  createThirdwebClient({
    clientId,
    secretKey,
  }) : 
  null;
