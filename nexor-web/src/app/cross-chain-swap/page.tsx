'use client';

import { useState } from 'react';
import { ContractTester } from '@/components/ContractTester';

export default function CrossChainSwapPage() {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

  return (
    <ContractTester 
      connectedAccount={connectedAccount}
      setConnectedAccount={setConnectedAccount}
    />
  );
}
