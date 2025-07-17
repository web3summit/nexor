import { useState, useEffect, useCallback } from 'react';
import { ApiPromise } from '@polkadot/api';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { ethers } from 'ethers';
import { useAnalytics } from './useAnalytics';
import {
  initPolkadotApi,
  initSolanaConnection,
  enablePolkadotExtension,
  getPolkadotAccounts,
  shortenAddress,
} from '../utils/blockchain';

export type ChainType = 'polkadot' | 'kusama' | 'solana' | 'ethereum' | 'polygon' | 'avalanche' | 'binance';

export interface TokenBalance {
  symbol: string;
  balance: string;
  decimals: number;
  usdValue?: string;
}

export interface WalletAccount {
  address: string;
  publicKey: string;
  name?: string;
  chain: ChainType;
  balances: Record<string, string>;
  tokenBalances?: TokenBalance[];
}

export interface MultiChainWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  accounts: WalletAccount[];
  currentAccount?: WalletAccount;
  error?: Error;
  chainType?: ChainType;
  walletId?: string;
}

export interface ConnectOptions {
  chain: ChainType;
  walletId: string;
}

export function useMultiChainWallet() {
  const [state, setState] = useState<MultiChainWalletState>({
    isConnected: false,
    isConnecting: false,
    accounts: [],
  });
  
  const { trackEvent } = useAnalytics();

  // Check if wallet is installed
  const isWalletInstalled = useCallback((walletId: string, chain: ChainType): boolean => {
    if (typeof window === 'undefined') return false;

    switch (walletId) {
      // Polkadot wallets
      case 'polkadot-js':
        return !!window.injectedWeb3?.['polkadot-js'];
      case 'talisman':
        return !!window.injectedWeb3?.['talisman'];
      case 'subwallet':
        return !!window.injectedWeb3?.['subwallet-js'];
      
      // Solana wallets
      case 'phantom':
        return !!window.solana?.isPhantom;
      case 'solflare':
        return !!window.solflare;
      
      // EVM wallets (Ethereum, Polygon, Avalanche, Binance)
      case 'metamask':
        return !!window.ethereum?.isMetaMask;
      case 'coinbase':
        return !!window.ethereum?.isCoinbaseWallet;
      case 'wallet-connect':
        return true; // WalletConnect doesn't need installation
      
      default:
        return false;
    }
  }, []);

  // Connect to wallet
  const connect = useCallback(async ({ chain, walletId }: ConnectOptions): Promise<WalletAccount | undefined> => {
    if (typeof window === 'undefined') return;

    setState((prev) => ({ 
      ...prev, 
      isConnecting: true, 
      error: undefined,
      chainType: chain,
      walletId
    }));

    try {
      trackEvent('wallet_connect_start', {
        wallet_id: walletId,
        chain
      });

      let account: WalletAccount | undefined;

      // Handle connection based on chain type
      if (chain === 'polkadot' || chain === 'kusama') {
        account = await connectPolkadotWallet(chain, walletId);
      } else if (chain === 'solana') {
        account = await connectSolanaWallet(walletId);
      } else {
        // EVM chains (Ethereum, Polygon, Avalanche, Binance)
        account = await connectEvmWallet(chain, walletId);
      }

      if (account) {
        setState({
          isConnected: true,
          isConnecting: false,
          accounts: [account],
          currentAccount: account,
          chainType: chain,
          walletId
        });

        trackEvent('wallet_connect_success', {
          wallet_id: walletId,
          chain,
          address: shortenAddress(account.address)
        });

        return account;
      } else {
        throw new Error('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      trackEvent('wallet_connect_error', {
        wallet_id: walletId,
        chain,
        error: errorMessage
      });
      
      setState((prev) => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error : new Error('Failed to connect wallet'),
      }));
      
      throw error;
    }
  }, [trackEvent]);

  // Connect to Polkadot/Kusama wallet
  const connectPolkadotWallet = useCallback(async (chain: 'polkadot' | 'kusama', walletId: string): Promise<WalletAccount | undefined> => {
    // Enable the extension
    const isEnabled = await enablePolkadotExtension('Nexor Payment Widget');
    if (!isEnabled) {
      throw new Error(`${walletId} extension not found or not enabled`);
    }

    // Get accounts from extension
    const accounts = await getPolkadotAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found in the wallet');
    }

    // Initialize API
    const api = await initPolkadotApi(chain);

    // Get balance for the first account
    const address = accounts[0].address;
    const { data: balance } = await api.query.system.account(address);
    
    return {
      address,
      publicKey: accounts[0].publicKey.toString(),
      name: accounts[0].meta.name as string,
      chain,
      balances: {
        [chain === 'polkadot' ? 'DOT' : 'KSM']: balance.free.toString()
      }
    };
  }, []);

  // Connect to Solana wallet
  const connectSolanaWallet = useCallback(async (walletId: string): Promise<WalletAccount | undefined> => {
    if (walletId === 'phantom') {
      if (!window.solana?.isPhantom) {
        throw new Error('Phantom wallet not installed');
      }

      try {
        // Connect to the wallet
        const response = await window.solana.connect();
        const publicKey = response.publicKey.toString();

        // Initialize connection
        const connection = initSolanaConnection('mainnet');
        
        // Get SOL balance
        const balance = await connection.getBalance(new PublicKey(publicKey));
        
        return {
          address: publicKey,
          publicKey,
          chain: 'solana',
          balances: {
            'SOL': balance.toString()
          }
        };
      } catch (error) {
        console.error('Error connecting to Phantom wallet:', error);
        throw error;
      }
    } else if (walletId === 'solflare') {
      if (!window.solflare) {
        throw new Error('Solflare wallet not installed');
      }

      try {
        // Connect to the wallet
        await window.solflare.connect();
        const publicKey = window.solflare.publicKey.toString();

        // Initialize connection
        const connection = initSolanaConnection('mainnet');
        
        // Get SOL balance
        const balance = await connection.getBalance(new PublicKey(publicKey));
        
        return {
          address: publicKey,
          publicKey,
          chain: 'solana',
          balances: {
            'SOL': balance.toString()
          }
        };
      } catch (error) {
        console.error('Error connecting to Solflare wallet:', error);
        throw error;
      }
    }
    
    throw new Error(`Unsupported Solana wallet: ${walletId}`);
  }, []);

  // Connect to EVM wallet (Ethereum, Polygon, Avalanche, Binance)
  const connectEvmWallet = useCallback(async (chain: ChainType, walletId: string): Promise<WalletAccount | undefined> => {
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found');
    }

    try {
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found in the wallet');
      }

      const address = accounts[0];
      
      // Create provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get chain ID and ensure it matches the requested chain
      const network = await provider.getNetwork();
      const chainMatches = checkChainMatch(network.chainId, chain);
      
      if (!chainMatches) {
        // Request chain switch
        await switchToChain(chain);
      }
      
      // Get ETH balance
      const balance = await provider.getBalance(address);
      const tokenSymbol = getChainNativeToken(chain);
      
      return {
        address,
        publicKey: address,
        chain,
        balances: {
          [tokenSymbol]: balance.toString()
        }
      };
    } catch (error) {
      console.error('Error connecting to EVM wallet:', error);
      throw error;
    }
  }, []);

  // Check if the current chain matches the requested chain
  const checkChainMatch = (chainId: number, chain: ChainType): boolean => {
    const chainMapping: Record<ChainType, number> = {
      'ethereum': 1, // Mainnet
      'polygon': 137,
      'avalanche': 43114,
      'binance': 56,
      'polkadot': 0, // Not applicable
      'kusama': 0, // Not applicable
      'solana': 0, // Not applicable
    };
    
    return chainId === chainMapping[chain];
  };

  // Switch to the requested chain
  const switchToChain = async (chain: ChainType): Promise<void> => {
    if (!window.ethereum) return;
    
    const chainParams: Record<ChainType, { chainId: string, chainName: string, rpcUrls: string[], nativeCurrency: { name: string, symbol: string, decimals: number }, blockExplorerUrls: string[] }> = {
      'ethereum': {
        chainId: '0x1',
        chainName: 'Ethereum Mainnet',
        rpcUrls: ['https://mainnet.infura.io/v3/'],
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        blockExplorerUrls: ['https://etherscan.io']
      },
      'polygon': {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com/'],
        nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
        blockExplorerUrls: ['https://polygonscan.com']
      },
      'avalanche': {
        chainId: '0xa86a',
        chainName: 'Avalanche C-Chain',
        rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
        nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
        blockExplorerUrls: ['https://snowtrace.io']
      },
      'binance': {
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        nativeCurrency: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
        blockExplorerUrls: ['https://bscscan.com']
      },
      'polkadot': { chainId: '0x0', chainName: '', rpcUrls: [''], nativeCurrency: { name: '', symbol: '', decimals: 0 }, blockExplorerUrls: [''] },
      'kusama': { chainId: '0x0', chainName: '', rpcUrls: [''], nativeCurrency: { name: '', symbol: '', decimals: 0 }, blockExplorerUrls: [''] },
      'solana': { chainId: '0x0', chainName: '', rpcUrls: [''], nativeCurrency: { name: '', symbol: '', decimals: 0 }, blockExplorerUrls: [''] }
    };
    
    try {
      // Try to switch to the chain
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainParams[chain].chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainParams[chain]],
          });
        } catch (addError) {
          throw new Error(`Failed to add ${chain} network to wallet`);
        }
      } else {
        throw switchError;
      }
    }
  };

  // Get the native token symbol for a chain
  const getChainNativeToken = (chain: ChainType): string => {
    const tokenMapping: Record<ChainType, string> = {
      'ethereum': 'ETH',
      'polygon': 'MATIC',
      'avalanche': 'AVAX',
      'binance': 'BNB',
      'polkadot': 'DOT',
      'kusama': 'KSM',
      'solana': 'SOL'
    };
    
    return tokenMapping[chain];
  };

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    // Track disconnect event
    if (state.walletId && state.chainType) {
      trackEvent('wallet_disconnect', {
        wallet_id: state.walletId,
        chain: state.chainType
      });
    }

    // Handle specific wallet disconnect logic
    if (state.chainType === 'solana' && state.walletId === 'phantom' && window.solana) {
      await window.solana.disconnect();
    } else if (state.chainType === 'solana' && state.walletId === 'solflare' && window.solflare) {
      await window.solflare.disconnect();
    }
    
    // Reset state
    setState({
      isConnected: false,
      isConnecting: false,
      accounts: [],
      currentAccount: undefined,
      chainType: undefined,
      walletId: undefined
    });
  }, [state.chainType, state.walletId, trackEvent]);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<string> => {
      if (!state.isConnected || !state.currentAccount || !state.chainType) {
        throw new Error('Wallet not connected');
      }

      try {
        let signature = '';
        
        // Handle signing based on chain type
        if (state.chainType === 'polkadot' || state.chainType === 'kusama') {
          // Enable extension
          await web3Enable('Nexor Payment Widget');
          
          // Get signer
          const injector = await web3FromAddress(state.currentAccount.address);
          
          // Sign the message
          const result = await injector.signer.signRaw?.({
            address: state.currentAccount.address,
            data: message,
            type: 'bytes'
          });
          
          signature = result?.signature || '';
        } else if (state.chainType === 'solana') {
          if (state.walletId === 'phantom' && window.solana) {
            // Convert message to Uint8Array
            const encodedMessage = new TextEncoder().encode(message);
            
            // Sign the message
            const result = await window.solana.signMessage(encodedMessage, 'utf8');
            signature = result.signature;
          } else if (state.walletId === 'solflare' && window.solflare) {
            // Convert message to Uint8Array
            const encodedMessage = new TextEncoder().encode(message);
            
            // Sign the message
            const result = await window.solflare.signMessage(encodedMessage, 'utf8');
            signature = result.signature;
          }
        } else {
          // EVM chains
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            signature = await signer.signMessage(message);
          }
        }
        
        if (!signature) {
          throw new Error('Failed to sign message');
        }
        
        return signature;
      } catch (error) {
        console.error('Failed to sign message:', error);
        throw error;
      }
    },
    [state.isConnected, state.currentAccount, state.chainType, state.walletId]
  );

  // Sign and send transaction
  const signAndSendTransaction = useCallback(
    async (txData: any): Promise<string> => {
      if (!state.isConnected || !state.currentAccount || !state.chainType) {
        throw new Error('Wallet not connected');
      }

      try {
        let txHash = '';
        
        // Handle transaction based on chain type
        if (state.chainType === 'polkadot' || state.chainType === 'kusama') {
          // Initialize API
          const api = await initPolkadotApi(state.chainType);
          
          // Enable extension
          await web3Enable('Nexor Payment Widget');
          
          // Get signer
          const injector = await web3FromAddress(state.currentAccount.address);
          
          // Create and sign transaction
          const tx = api.tx.balances.transfer(txData.recipient, txData.amount);
          const result = await tx.signAndSend(state.currentAccount.address, { signer: injector.signer });
          
          txHash = result.toString();
        } else if (state.chainType === 'solana') {
          // Initialize connection
          const connection = initSolanaConnection('mainnet');
          
          if (state.walletId === 'phantom' && window.solana) {
            // Create transaction
            const transaction = Transaction.from(Buffer.from(txData.serializedTx, 'base64'));
            
            // Sign transaction
            const { signature } = await window.solana.signAndSendTransaction(transaction);
            
            // Confirm transaction
            await connection.confirmTransaction(signature);
            
            txHash = signature;
          } else if (state.walletId === 'solflare' && window.solflare) {
            // Create transaction
            const transaction = Transaction.from(Buffer.from(txData.serializedTx, 'base64'));
            
            // Sign transaction
            const { signature } = await window.solflare.signAndSendTransaction(transaction);
            
            // Confirm transaction
            await connection.confirmTransaction(signature);
            
            txHash = signature;
          }
        } else {
          // EVM chains
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Send transaction
            const tx = await signer.sendTransaction({
              to: txData.to,
              value: ethers.utils.parseEther(txData.value),
              gasLimit: txData.gasLimit || 21000,
              gasPrice: txData.gasPrice ? ethers.utils.parseUnits(txData.gasPrice, 'gwei') : undefined,
            });
            
            txHash = tx.hash;
            
            // Wait for transaction to be mined
            await tx.wait();
          }
        }
        
        if (!txHash) {
          throw new Error('Failed to send transaction');
        }
        
        // Track transaction event
        trackEvent('transaction_sent', {
          wallet_id: state.walletId,
          chain: state.chainType,
          tx_hash: txHash.slice(0, 10) + '...'
        });
        
        return txHash;
      } catch (error) {
        console.error('Failed to sign and send transaction:', error);
        
        // Track error event
        trackEvent('transaction_error', {
          wallet_id: state.walletId,
          chain: state.chainType,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    },
    [state.isConnected, state.currentAccount, state.chainType, state.walletId, trackEvent]
  );

  // Get token balances for the current account
  const getTokenBalances = useCallback(async (tokenSymbols: string[]): Promise<TokenBalance[]> => {
    if (!state.isConnected || !state.currentAccount || !state.chainType) {
      throw new Error('Wallet not connected');
    }
    
    const balances: TokenBalance[] = [];
    
    try {
      // Handle based on chain type
      if (state.chainType === 'polkadot' || state.chainType === 'kusama') {
        // For now, we only support native token
        const nativeToken = state.chainType === 'polkadot' ? 'DOT' : 'KSM';
        if (tokenSymbols.includes(nativeToken) && state.currentAccount.balances[nativeToken]) {
          balances.push({
            symbol: nativeToken,
            balance: state.currentAccount.balances[nativeToken],
            decimals: 12
          });
        }
      } else if (state.chainType === 'solana') {
        // For now, we only support SOL
        if (tokenSymbols.includes('SOL') && state.currentAccount.balances['SOL']) {
          balances.push({
            symbol: 'SOL',
            balance: state.currentAccount.balances['SOL'],
            decimals: 9
          });
        }
      } else {
        // EVM chains
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // Get native token balance
          const nativeToken = getChainNativeToken(state.chainType);
          if (tokenSymbols.includes(nativeToken)) {
            const balance = await provider.getBalance(state.currentAccount.address);
            balances.push({
              symbol: nativeToken,
              balance: balance.toString(),
              decimals: 18
            });
          }
          
          // TODO: Add ERC20 token balance support
        }
      }
      
      return balances;
    } catch (error) {
      console.error('Failed to get token balances:', error);
      throw error;
    }
  }, [state.isConnected, state.currentAccount, state.chainType]);

  // Return the hook interface
  return {
    ...state,
    isInstalled: (walletId: string, chain: ChainType) => isWalletInstalled(walletId, chain),
    connect,
    disconnect,
    signMessage,
    signAndSendTransaction,
    getTokenBalances
  };
}

// Add these type definitions to make TypeScript happy
declare global {
  interface Window {
    injectedWeb3?: Record<string, any>;
    solana?: {
      isPhantom: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: string }>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
    };
    solflare?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      publicKey: { toString: () => string };
      signMessage: (message: Uint8Array, encoding: string) => Promise<{ signature: string }>;
      signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>;
    };
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
