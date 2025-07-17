import { useState, useCallback, useEffect } from 'react';
import { WalletAccount, TokenBalance } from './useMultiChainWallet';
import { useAnalytics } from './useAnalytics';
import { parseBalance, formatBalance } from '../utils/blockchain';

export type PaymentStatus = 'idle' | 'creating' | 'awaiting_confirmation' | 'processing' | 'confirming' | 'completed' | 'failed';

export interface PaymentDetails {
  id: string;
  merchantId: string;
  amount: string;
  tokenSymbol: string;
  amountUsd?: string;
  destinationAddress: string;
  sourceAddress?: string;
  txHash?: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  networkFee?: string;
  networkName?: string;
  blockExplorerUrl?: string;
}

export interface CreatePaymentParams {
  merchantId: string;
  amount: string;
  tokenSymbol: string;
  sourceAddress: string;
  amountUsd?: string;
  description?: string;
  invoiceId?: string;
}

export interface ConfirmPaymentParams {
  paymentId: string;
  txHash?: string;
  signature?: string;
}

export interface UsePaymentProcessorOptions {
  apiUrl?: string;
  onStatusChange?: (status: PaymentStatus, payment: PaymentDetails) => void;
  pollingInterval?: number; // in milliseconds
  signAndSendTransaction?: (txData: any) => Promise<string>;
  getTokenBalances?: (tokenSymbols: string[]) => Promise<TokenBalance[]>;
}

export function usePaymentProcessor({
  apiUrl = 'https://api.nexor.io',
  onStatusChange,
  pollingInterval = 5000,
  signAndSendTransaction,
  getTokenBalances,
}: UsePaymentProcessorOptions = {}) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [pollingId, setPollingId] = useState<NodeJS.Timeout | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { trackEvent } = useAnalytics();

  // Helper to update status and trigger callback
  const updateStatus = useCallback((newStatus: PaymentStatus, paymentDetails: PaymentDetails) => {
    setStatus(newStatus);
    setPayment(paymentDetails);
    
    if (onStatusChange) {
      onStatusChange(newStatus, paymentDetails);
    }
  }, [onStatusChange]);

  // Create a new payment
  const createPayment = useCallback(async ({
    merchantId,
    amount,
    tokenSymbol,
    sourceAddress,
    amountUsd,
    description,
    invoiceId,
  }: CreatePaymentParams): Promise<PaymentDetails> => {
    try {
      setStatus('creating');
      setError(null);
      setIsProcessing(true);
      
      // Track payment creation
      trackEvent('payment_create_start', {
        merchant_id: merchantId,
        token_symbol: tokenSymbol,
        amount,
        amount_usd: amountUsd,
      });
      
      // In a real implementation, we would call our GraphQL API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get merchant details (in real implementation, this would come from API)
      const merchantDetails = {
        name: 'Demo Merchant',
        destinationAddress: getDestinationAddressForToken(tokenSymbol),
        logo: 'https://via.placeholder.com/150',
      };
      
      // Get network details based on token
      const networkDetails = getNetworkDetailsForToken(tokenSymbol);
      
      const mockPayment: PaymentDetails = {
        id: `pay_${Math.random().toString(36).substring(2, 15)}`,
        merchantId,
        amount,
        tokenSymbol,
        amountUsd,
        sourceAddress,
        destinationAddress: merchantDetails.destinationAddress,
        status: 'awaiting_confirmation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Expires in 15 minutes
        networkName: networkDetails.name,
        blockExplorerUrl: networkDetails.blockExplorerUrl,
      };
      
      // Track successful payment creation
      trackEvent('payment_create_success', {
        payment_id: mockPayment.id,
        merchant_id: merchantId,
        token_symbol: tokenSymbol,
      });
      
      setIsProcessing(false);
      updateStatus('awaiting_confirmation', mockPayment);
      return mockPayment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create payment');
      console.error('Failed to create payment:', error);
      
      // Track error
      trackEvent('payment_create_error', {
        merchant_id: merchantId,
        token_symbol: tokenSymbol,
        error: error.message,
      });
      
      setError(error);
      setStatus('failed');
      setIsProcessing(false);
      throw error;
    }
  }, [updateStatus, trackEvent]);
  
  // Helper function to get destination address for token
  const getDestinationAddressForToken = (tokenSymbol: string): string => {
    // In a real implementation, this would come from the API
    // For now, we'll use mock addresses
    const addressMap: Record<string, string> = {
      'DOT': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      'KSM': '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      'SOL': '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
      'ETH': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      'MATIC': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      'AVAX': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      'BNB': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    };
    
    return addressMap[tokenSymbol] || addressMap['ETH']; // Default to ETH address
  };
  
  // Helper function to get network details for token
  const getNetworkDetailsForToken = (tokenSymbol: string): { name: string, blockExplorerUrl: string } => {
    // In a real implementation, this would come from the API
    // For now, we'll use mock network details
    const networkMap: Record<string, { name: string, blockExplorerUrl: string }> = {
      'DOT': { name: 'Polkadot', blockExplorerUrl: 'https://polkadot.subscan.io/extrinsic/' },
      'KSM': { name: 'Kusama', blockExplorerUrl: 'https://kusama.subscan.io/extrinsic/' },
      'SOL': { name: 'Solana', blockExplorerUrl: 'https://explorer.solana.com/tx/' },
      'ETH': { name: 'Ethereum', blockExplorerUrl: 'https://etherscan.io/tx/' },
      'MATIC': { name: 'Polygon', blockExplorerUrl: 'https://polygonscan.com/tx/' },
      'AVAX': { name: 'Avalanche', blockExplorerUrl: 'https://snowtrace.io/tx/' },
      'BNB': { name: 'Binance Smart Chain', blockExplorerUrl: 'https://bscscan.com/tx/' },
    };
    
    return networkMap[tokenSymbol] || networkMap['ETH']; // Default to ETH network
  };

  // Confirm a payment with transaction hash
  const confirmPayment = useCallback(async ({
    paymentId,
    txHash,
    signature,
  }: ConfirmPaymentParams): Promise<PaymentDetails> => {
    try {
      if (!payment || payment.id !== paymentId) {
        throw new Error('Payment not found');
      }
      
      setStatus('processing');
      setError(null);
      setIsProcessing(true);
      
      // Track payment confirmation start
      trackEvent('payment_confirm_start', {
        payment_id: paymentId,
        merchant_id: payment.merchantId,
        token_symbol: payment.tokenSymbol,
      });
      
      let transactionHash = txHash;
      
      // If no txHash provided, we need to send the transaction
      if (!transactionHash && signAndSendTransaction) {
        try {
          // Prepare transaction data
          const txData = {
            to: payment.destinationAddress,
            value: payment.amount,
            token: payment.tokenSymbol,
          };
          
          // Sign and send transaction
          transactionHash = await signAndSendTransaction(txData);
        } catch (txError) {
          const error = txError instanceof Error ? txError : new Error('Failed to send transaction');
          console.error('Failed to send transaction:', error);
          
          // Track transaction error
          trackEvent('transaction_error', {
            payment_id: paymentId,
            merchant_id: payment.merchantId,
            error: error.message,
          });
          
          setError(error);
          setStatus('failed');
          setIsProcessing(false);
          throw error;
        }
      }
      
      if (!transactionHash) {
        throw new Error('No transaction hash provided');
      }
      
      // In a real implementation, we would call our GraphQL API to confirm the payment
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Calculate network fee (mock data)
      const networkFee = (parseFloat(payment.amount) * 0.01).toFixed(6);
      
      const updatedPayment: PaymentDetails = {
        ...payment,
        txHash: transactionHash,
        status: 'processing',
        updatedAt: new Date().toISOString(),
        networkFee,
        confirmations: 0,
        requiredConfirmations: 12, // This would depend on the network
      };
      
      // Track successful payment confirmation
      trackEvent('payment_confirm_success', {
        payment_id: paymentId,
        merchant_id: payment.merchantId,
        token_symbol: payment.tokenSymbol,
        tx_hash: transactionHash.slice(0, 10) + '...',
      });
      
      updateStatus('processing', updatedPayment);
      setIsProcessing(false);
      
      // Start polling for payment status
      startPolling(updatedPayment.id);
      
      return updatedPayment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to confirm payment');
      console.error('Failed to confirm payment:', error);
      
      // Track error
      trackEvent('payment_confirm_error', {
        payment_id: paymentId,
        merchant_id: payment?.merchantId,
        error: error.message,
      });
      
      setError(error);
      setStatus('failed');
      setIsProcessing(false);
      throw error;
    }
  }, [payment, updateStatus, signAndSendTransaction, trackEvent]);

  // Poll for payment status
  const pollPaymentStatus = useCallback(async (paymentId: string): Promise<PaymentDetails> => {
    try {
      if (!payment || payment.id !== paymentId) {
        throw new Error('Payment not found');
      }
      
      // In a real implementation, we would call our GraphQL API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the elapsed time since the payment was last updated
      const elapsedTime = Date.now() - new Date(payment.updatedAt).getTime();
      
      // Simulate confirmation progress
      let updatedPayment: PaymentDetails;
      
      if (payment.status === 'processing' && elapsedTime > 2000) {
        // Move to confirming status after 2 seconds
        updatedPayment = {
          ...payment,
          status: 'confirming',
          confirmations: 1,
          updatedAt: new Date().toISOString(),
        };
      } else if (payment.status === 'confirming') {
        // Increment confirmations
        const currentConfirmations = payment.confirmations || 0;
        const requiredConfirmations = payment.requiredConfirmations || 12;
        
        // Add 1 confirmation every 1.5 seconds
        const newConfirmations = Math.min(
          requiredConfirmations,
          currentConfirmations + (elapsedTime > 1500 ? 1 : 0)
        );
        
        // Check if all confirmations are received
        const isCompleted = newConfirmations >= requiredConfirmations;
        
        updatedPayment = {
          ...payment,
          status: isCompleted ? 'completed' : 'confirming',
          confirmations: newConfirmations,
          updatedAt: new Date().toISOString(),
        };
        
        // Track confirmation progress
        if (newConfirmations > currentConfirmations) {
          trackEvent('payment_confirmation_progress', {
            payment_id: paymentId,
            confirmations: newConfirmations,
            required_confirmations: requiredConfirmations,
            percent_complete: Math.round((newConfirmations / requiredConfirmations) * 100)
          });
        }
      } else {
        // Keep the same status
        updatedPayment = { ...payment };
      }
      
      if (updatedPayment.status !== payment.status) {
        // Track status change
        trackEvent('payment_status_change', {
          payment_id: paymentId,
          previous_status: payment.status,
          new_status: updatedPayment.status,
        });
        
        updateStatus(updatedPayment.status, updatedPayment);
        
        // If completed, track completion event
        if (updatedPayment.status === 'completed') {
          trackEvent('payment_completed', {
            payment_id: paymentId,
            merchant_id: payment.merchantId,
            token_symbol: payment.tokenSymbol,
            amount: payment.amount,
            amount_usd: payment.amountUsd,
          });
        }
        
        // Stop polling if payment is completed or failed
        if (updatedPayment.status === 'completed' || updatedPayment.status === 'failed') {
          stopPolling();
        }
      } else if (updatedPayment.confirmations !== payment.confirmations) {
        // Update state if confirmations changed
        updateStatus(updatedPayment.status, updatedPayment);
      }
      
      return updatedPayment;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check payment status');
      console.error('Failed to check payment status:', error);
      setError(error);
      stopPolling();
      return payment;
    }
  }, [payment, updateStatus, trackEvent]);

  // Start polling for payment status
  const startPolling = useCallback((paymentId: string) => {
    // Clear existing polling interval if any
    stopPolling();
    
    // Start new polling interval
    const intervalId = setInterval(() => {
      pollPaymentStatus(paymentId);
    }, pollingInterval);
    
    setPollingId(intervalId);
  }, [pollPaymentStatus, pollingInterval]);

  // Stop polling for payment status
  const stopPolling = useCallback(() => {
    if (pollingId) {
      clearInterval(pollingId);
      setPollingId(null);
    }
  }, [pollingId]);

  // Reset payment state
  const reset = useCallback(() => {
    stopPolling();
    setPayment(null);
    setStatus('idle');
    setError(null);
  }, [stopPolling]);

  // Check if user has sufficient balance for payment
  const checkBalance = useCallback(async (tokenSymbol: string, amount: string): Promise<boolean> => {
    if (!getTokenBalances) {
      // If we can't check balances, assume it's sufficient
      return true;
    }
    
    try {
      const balances = await getTokenBalances([tokenSymbol]);
      const tokenBalance = balances.find(b => b.symbol === tokenSymbol);
      
      if (!tokenBalance) {
        return false;
      }
      
      // Convert both to same decimal places for comparison
      const balanceValue = parseFloat(formatBalance(tokenBalance.balance, tokenBalance.decimals));
      const amountValue = parseFloat(amount);
      
      return balanceValue >= amountValue;
    } catch (error) {
      console.error('Failed to check balance:', error);
      return false;
    }
  }, [getTokenBalances]);

  return {
    payment,
    status,
    error,
    isProcessing,
    paymentDetails: payment,
    createPayment,
    confirmPayment,
    pollPaymentStatus,
    checkBalance,
    resetPayment: reset,
  };
}
