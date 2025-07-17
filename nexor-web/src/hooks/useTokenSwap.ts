import { useState, useCallback } from 'react';
import { getSwapQuote, executeSwap, SwapQuote, SwapParams } from '../utils/tokenSwap';
import { useWalletConnection } from './useWalletConnection';

export interface UseTokenSwapResult {
  isLoading: boolean;
  isSwapping: boolean;
  error: Error | null;
  quote: SwapQuote | null;
  getQuote: (params: SwapParams) => Promise<SwapQuote | null>;
  executeTokenSwap: (quote: SwapQuote) => Promise<{ success: boolean; txHash?: string }>;
  resetState: () => void;
}

export function useTokenSwap(): UseTokenSwapResult {
  const [isLoading, setIsLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  
  const { activeWallet } = useWalletConnection();
  
  const resetState = useCallback(() => {
    setError(null);
    setQuote(null);
  }, []);
  
  const getQuote = useCallback(async (params: SwapParams): Promise<SwapQuote | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const quoteResult = await getSwapQuote(params);
      setQuote(quoteResult);
      return quoteResult;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error getting swap quote:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const executeTokenSwap = useCallback(async (quoteToExecute: SwapQuote): Promise<{ success: boolean; txHash?: string }> => {
    if (!activeWallet) {
      const error = new Error('No active wallet connected');
      setError(error);
      return { success: false };
    }
    
    setIsSwapping(true);
    setError(null);
    
    try {
      // In a real implementation, we would use the wallet's signAndSendTransaction method
      // For now, we'll use a mock implementation
      const mockSignAndSend = async (txData: any): Promise<string> => {
        // Simulate transaction signing and sending
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `0x${Array.from({ length: 64 })
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join('')}`;
      };
      
      const { txHash } = await executeSwap(quoteToExecute, mockSignAndSend);
      
      return { success: true, txHash };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Error executing token swap:', error);
      return { success: false };
    } finally {
      setIsSwapping(false);
    }
  }, [activeWallet]);
  
  return {
    isLoading,
    isSwapping,
    error,
    quote,
    getQuote,
    executeTokenSwap,
    resetState,
  };
}
