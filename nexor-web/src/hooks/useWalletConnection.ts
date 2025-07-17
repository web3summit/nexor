import { useState, useEffect, useCallback } from 'react';

export type ChainType = 'polkadot' | 'kusama' | 'solana';

export interface WalletAccount {
  address: string;
  publicKey: string;
  name?: string;
  balance?: string;
}

export interface WalletConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  accounts: WalletAccount[];
  currentAccount?: WalletAccount;
  error?: Error;
}

export interface WalletConnectionOptions {
  chainType: ChainType;
  walletId: string;
  autoConnect?: boolean;
}

export function useWalletConnection({
  chainType,
  walletId,
  autoConnect = false,
}: WalletConnectionOptions) {
  const [state, setState] = useState<WalletConnectionState>({
    isConnected: false,
    isConnecting: false,
    accounts: [],
  });

  // Check if wallet is installed
  const isWalletInstalled = useCallback(() => {
    if (typeof window === 'undefined') return false;

    switch (walletId) {
      case 'polkadot-js':
        return !!window.injectedWeb3?.['polkadot-js'];
      case 'talisman':
        return !!window.injectedWeb3?.['talisman'];
      case 'subwallet':
        return !!window.injectedWeb3?.['subwallet-js'];
      case 'phantom':
        return !!window.solana?.isPhantom;
      default:
        return false;
    }
  }, [walletId]);

  // Connect to wallet
  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    setState((prev) => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      // Mock implementation for demonstration
      // In a real implementation, we would use the actual wallet APIs
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock accounts based on wallet type
      let mockAccounts: WalletAccount[] = [];
      
      if (chainType === 'polkadot' || chainType === 'kusama') {
        mockAccounts = [
          {
            address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            publicKey: '0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d',
            name: 'Alice',
            balance: chainType === 'polkadot' ? '1000 DOT' : '1000 KSM',
          },
          {
            address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            publicKey: '0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48',
            name: 'Bob',
            balance: chainType === 'polkadot' ? '500 DOT' : '500 KSM',
          },
        ];
      } else if (chainType === 'solana') {
        mockAccounts = [
          {
            address: '5sgLNHECeYXJUHN12CGNgwJUNd8DimhYYgRhBiRyJGdT',
            publicKey: '5sgLNHECeYXJUHN12CGNgwJUNd8DimhYYgRhBiRyJGdT',
            name: 'Solana Wallet',
            balance: '250 SOL',
          },
        ];
      }

      setState({
        isConnected: true,
        isConnecting: false,
        accounts: mockAccounts,
        currentAccount: mockAccounts[0],
      });

      return mockAccounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Failed to connect wallet'),
      }));
      throw error;
    }
  }, [chainType, walletId]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    setState({
      isConnected: false,
      isConnecting: false,
      accounts: [],
      currentAccount: undefined,
    });
  }, []);

  // Switch account
  const switchAccount = useCallback((address: string) => {
    setState((prev) => {
      const account = prev.accounts.find((a) => a.address === address);
      return {
        ...prev,
        currentAccount: account,
      };
    });
  }, []);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!state.isConnected || !state.currentAccount) {
        throw new Error('Wallet not connected');
      }

      try {
        // Mock implementation for demonstration
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Return a mock signature
        return `0x${Array.from({ length: 130 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`;
      } catch (error) {
        console.error('Failed to sign message:', error);
        throw error;
      }
    },
    [state.isConnected, state.currentAccount]
  );

  // Sign and send transaction
  const signAndSendTransaction = useCallback(
    async (txData: any): Promise<string> => {
      if (!state.isConnected || !state.currentAccount) {
        throw new Error('Wallet not connected');
      }

      try {
        // Mock implementation for demonstration
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Return a mock transaction hash
        return `0x${Array.from({ length: 64 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`;
      } catch (error) {
        console.error('Failed to sign and send transaction:', error);
        throw error;
      }
    },
    [state.isConnected, state.currentAccount]
  );

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && isWalletInstalled()) {
      connect();
    }
  }, [autoConnect, connect, isWalletInstalled]);

  return {
    ...state,
    isInstalled: isWalletInstalled(),
    connect,
    disconnect,
    switchAccount,
    signMessage,
    signAndSendTransaction,
  };
}
