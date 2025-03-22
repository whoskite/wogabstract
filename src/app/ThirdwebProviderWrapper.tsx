'use client';

import React from 'react';
import { ThirdwebProvider } from 'thirdweb/react';
import { abstractTestnet } from 'thirdweb/chains';
import { createThirdwebClient } from 'thirdweb';

export default function ThirdwebProviderWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const client = createThirdwebClient({
    clientId: process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID,
  });

  return (
    <ThirdwebProvider
      client={client}
      activeChain={abstractTestnet}
    >
      {children}
    </ThirdwebProvider>
  );
} 