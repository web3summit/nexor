import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { usePaymentProcessor, PaymentDetails, PaymentStatus } from '../hooks/usePaymentProcessor';
import { useTokenPrices } from '../hooks/useTokenPrices';
import { useWalletConnection, WalletAccount } from '../hooks/useWalletConnection';

interface PaymentContextType {
  // Payment state
  payment: PaymentDetails | null;
  paymentStatus: PaymentStatus;
  paymentError: Error | null;
  
  // Wallet state
  walletAccount: WalletAccount | undefined;
  isWalletConnected: boolean;
  isWalletConnecting: boolean;
  walletError: Error | undefined;
  
  // Token prices
  tokenPrices: Record<string, { priceUsd: number; percentChange24h?: number }>;
  isLoadingPrices: boolean;
  
  // Actions
  connectWallet: (walletId: string, chainType: 'polkadot' | 'kusama' | 'solana') => Promise<WalletAccount | undefined>;
  disconnectWallet: () => Promise<void>;
  createPayment: (merchantId: string, amount: string, tokenSymbol: string) => Promise<PaymentDetails>;
  confirmPayment: (paymentId: string, txHash: string) => Promise<PaymentDetails>;
  resetPayment: () => void;
  convertAmount: (amount: number, fromSymbol: string, toSymbol: string) => number | undefined;
  toUsd: (amount: number, symbol: string) => number | undefined;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export interface PaymentProviderProps {
  children: ReactNode;
  supportedTokens?: string[];
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({
  children,
  supportedTokens = ['DOT', 'KSM', 'USDC', 'USDT'],
}) => {
  // State for current wallet connection
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [currentChainType, setCurrentChainType] = useState<'polkadot' | 'kusama' | 'solana'>('polkadot');
  
  // Initialize hooks
  const {
    payment,
    status: paymentStatus,
    error: paymentError,
    createPayment: createPaymentRequest,
    confirmPayment: confirmPaymentRequest,
    reset: resetPayment,
  } = usePaymentProcessor({
    onStatusChange: (status, payment) => {
      console.log(`Payment status changed to ${status}:`, payment);
    },
  });
  
  const {
    prices: tokenPrices,
    loading: isLoadingPrices,
    convertAmount,
    toUsd,
  } = useTokenPrices({
    symbols: supportedTokens,
    refreshInterval: 60000, // Refresh every minute
  });
  
  const {
    isConnected: isWalletConnected,
    isConnecting: isWalletConnecting,
    currentAccount: walletAccount,
    error: walletError,
    connect,
    disconnect,
  } = useWalletConnection({
    chainType: currentChainType,
    walletId: currentWalletId || 'polkadot-js',
  });
  
  // Connect wallet
  const connectWallet = useCallback(async (walletId: string, chainType: 'polkadot' | 'kusama' | 'solana') => {
    setCurrentWalletId(walletId);
    setCurrentChainType(chainType);
    
    try {
      return await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return undefined;
    }
  }, [connect]);
  
  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
      setCurrentWalletId(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  }, [disconnect]);
  
  // Create payment
  const createPayment = useCallback(async (merchantId: string, amount: string, tokenSymbol: string) => {
    return createPaymentRequest({
      merchantId,
      amount,
      tokenSymbol,
      walletAccount,
    });
  }, [createPaymentRequest, walletAccount]);
  
  // Confirm payment
  const confirmPayment = useCallback(async (paymentId: string, txHash: string) => {
    return confirmPaymentRequest({
      paymentId,
      txHash,
    });
  }, [confirmPaymentRequest]);
  
  const contextValue: PaymentContextType = {
    // Payment state
    payment,
    paymentStatus,
    paymentError,
    
    // Wallet state
    walletAccount,
    isWalletConnected,
    isWalletConnecting,
    walletError,
    
    // Token prices
    tokenPrices,
    isLoadingPrices,
    
    // Actions
    connectWallet,
    disconnectWallet,
    createPayment,
    confirmPayment,
    resetPayment,
    convertAmount,
    toUsd,
  };
  
  return (
    <PaymentContext.Provider value={contextValue}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  
  return context;
};
