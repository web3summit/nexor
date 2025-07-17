import React, { useState, useEffect } from 'react';
import { Box, Text, Button, VStack, HStack, Spinner, Icon, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { CheckIcon, CloseIcon, RepeatIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import BigNumber from 'bignumber.js';
// Using type import to avoid conflicts
import type { WalletAccount, ChainType } from '../../types/wallet';

// Define interfaces for wallet connection
interface ConnectOptions {
  chain: ChainType;
  walletId: string;
}

// Define MultiChainWallet interface to include activeChain property
interface MultiChainWallet {
  isInstalled: (walletId: string, chain: ChainType) => boolean;
  connect: ({ chain, walletId }: ConnectOptions) => Promise<WalletAccount | undefined>;
  disconnect: () => Promise<void>;
  activeChain?: string;
  walletId?: string;
  supportedChains?: string[];
  switchChain?: (chain: string) => Promise<void>;
  // Add other properties as needed
}
import { useMultiChainWallet } from '../../hooks/useMultiChainWallet';
import { usePaymentProcessor } from '../../hooks/usePaymentProcessor';
import { useTokenSwap } from '../../hooks/useTokenSwap';
import { useAnalytics } from '../../hooks/useAnalytics';
import { TokenSelector } from '../molecules/TokenSelector';
import { TokenSwap } from '../molecules/TokenSwap';
import { PaymentSummary } from '../molecules/PaymentSummary';
import { WalletConnector } from '../molecules/WalletConnector';

// Types

interface Token {
  symbol: string;
  name: string;
  chain: ChainType;
  address: string;
  decimals: number;
  balance?: string;
  logoURI?: string;
}

interface TokenBalance {
  symbol: string;
  chain: ChainType;
  balance: string;
  token: Token;
}

interface PaymentFlowProps {
  recipientAddress: string;
  recipientName?: string;
  amount: string;
  currency: string;
  onComplete: (result: any) => void;
  onClose?: () => void;
}

interface PaymentDetails {
  amount?: string;
  recipientAddress?: string;
  recipientName?: string;
  paymentId?: string; 
  id?: string; 
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
  sourceAddress?: string;
  sourceToken?: string;
  destinationToken?: string;
  sourceChain?: string;
  destinationChain?: string;
  exchangeRate?: string;
  networkFee?: string;
  estimatedTime?: string;
  totalAmount?: string;
  amountUsd?: string;
  merchantName?: string;
  merchantLogo?: string;
  invoiceId?: string;
  expiresAt?: Date;
  paymentDescription?: string;
}

interface PaymentResult {
  paymentId: string;
  transactionHash: string;
  amount: string;
  token: Token;
  timestamp: number;
}

interface PaymentError {
  error: string;
  step: string;
}

interface WalletAccount {
  address: string;
  name: string;
  chain: ChainType;
}

interface CheckBalanceParams {
  address: string;
  chain: ChainType;
  tokenAddress?: string;
}

interface CreatePaymentParams {
  amount: string;
  token: Token;
  recipientAddress: string;
  sourceAddress: string;
}

interface PaymentConfirmationParams {
  paymentId: string;
  signature?: string;
  transactionHash?: string;
}

interface PaymentConfirmationResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

interface SwapResult {
  success: boolean;
  token: Token;
  amount: string;
  transactionHash?: string;
  error?: string;
}

interface SwapParams {
  fromToken: Token;
  toTokenSymbol: string;
  amount: number;
}

interface UseTokenSwapResult {
  initiateSwap: (params: SwapParams) => Promise<void>;
  completeSwap: (result: SwapResult) => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
}

type PaymentStep = 'connect-wallet' | 'select-token' | 'swap-tokens' | 'confirm-payment' | 'processing' | 'complete' | 'failed';

// Removed EventType interface as we're now using the AnalyticsEvent interface directly

// Component props
// Local interface to match the actual PaymentSummary component props
interface PaymentSummaryProps {
  details: {
    amount: string;
    sourceToken: string;
    destinationToken: string;
    sourceChain: string;
    destinationChain: string;
    exchangeRate?: string;
    networkFee?: string;
    estimatedTime?: string;
    totalAmount: string;
    amountUsd?: string;
    merchantName?: string;
    merchantLogo?: string;
    invoiceId?: string;
    expiresAt?: Date;
    paymentDescription?: string;
  };
  className?: string;
  showDetails?: boolean;
  glassmorphism?: boolean;
  onViewReceipt?: () => void;
}

interface TokenSelectorProps {
  onSelect: (token: Token) => Promise<void>;
  selectedToken?: string;
  isLoading?: boolean;
}

interface WalletConnectorProps {
  onConnect: (chain: ChainType, walletId: string) => Promise<void>;
  isLoading?: boolean;
}

type StrictAny<T> = T extends object ? { [K in keyof T]: StrictAny<T[K]> } : T;

declare module '../../types/wallet' {
  export interface WalletAccount {
    address: string;
    name: string;
    chain: string;
  }
  export type ChainType = 'evm' | 'substrate' | 'solana';
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  recipientAddress,
  recipientName = '',
  amount,
  currency,
  onComplete,
  onClose,
}) => {
  // State management
  const [currentStep, setCurrentStep] = useState<PaymentStep>('connect-wallet');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentDetails | null>(null);
  const [needsSwap, setNeedsSwap] = useState<boolean>(false);
  const [swapCompleted, setSwapCompleted] = useState<boolean>(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [activeWallet, setActiveWallet] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Hooks
  const walletResult = useMultiChainWallet();
  // Cast wallet to MultiChainWallet type to fix TypeScript errors
  const wallet = walletResult as unknown as MultiChainWallet;
  const { trackEvent: trackAnalyticsEvent } = useAnalytics();
  const { createPayment, confirmPayment } = usePaymentProcessor();
  const tokenSwap = useTokenSwap();

  // Define the wallet interface to match the actual implementation
  const walletWithAccount = wallet as unknown as {
    isInstalled: (walletId: string, chain: ChainType) => boolean;
    connect: ({ chain, walletId }: { chain: ChainType; walletId: string }) => Promise<WalletAccount | undefined>;
    disconnect: () => Promise<void>;
    getTokenBalances: () => Promise<TokenBalance[]>;
    activeAccount: WalletAccount | null;
    isConnected: boolean;
    walletId?: string;
  };

  useEffect(() => {
    if (!paymentInfo) {
      setPaymentInfo({
        paymentId: '',
        transactionHash: undefined,
        status: 'pending',
        error: undefined
      });
    }
  }, [amount, recipientAddress, recipientName, paymentInfo]);

  // Handler for wallet connection
  const handleConnectWallet = async (chain: ChainType, walletId: string): Promise<void> => {
    setError(null);
    setIsConnecting(true);
    
    try {
      trackAnalyticsEvent({ 
        eventType: 'wallet_connected', 
        chain,
        walletType: walletId,
        metadata: { connection_attempt: true } 
      });
      
      // Connect wallet
      await walletWithAccount.connect({ chain, walletId });
      
      // Get active account
      const account = walletWithAccount.activeAccount;
      
      if (account) {
        setActiveWallet({
          address: account.address,
          chain: chain
        });
        
        trackAnalyticsEvent({ 
          eventType: 'wallet_connected', 
          chain,
          walletType: walletId,
          metadata: { success: true } 
        });
        setCurrentStep('select-token');
      } else {
        throw new Error('No active account found after connection');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      trackAnalyticsEvent({ 
        eventType: 'wallet_disconnected', 
        chain,
        walletType: walletId,
        error: err instanceof Error ? err.message : 'Unknown error',
        metadata: { connection_failed: true }
      });
      
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Handler for token selection
  const handleTokenSelect = async (token: Token): Promise<void> => {
    setSelectedToken(token);
    setError(null);
    
    trackAnalyticsEvent({ 
      eventType: 'token_selected', 
      tokenSymbol: token.symbol,
      chain: token.chain,
      metadata: { balance: token.balance || '0' }
    });

    try {
      setIsCheckingBalance(true);
      
      // Check if the user has sufficient balance
      const tokenBalances = await walletWithAccount.getTokenBalances() || [];
      const tokenBalance = tokenBalances.find(t => 
        t.symbol === token.symbol && 
        t.chain === token.chain
      )?.balance || '0';
      
      const hasBalance = new BigNumber(tokenBalance).isGreaterThanOrEqualTo(amount);
      
      if (hasBalance) {
        // User has sufficient balance
        
        // Update payment info with selected token
        setPaymentInfo(prev => ({
          ...prev!,
          status: 'pending'
        }));
        
        // Check if token matches required token
        if (currency && token.symbol !== currency) {
          // Token doesn't match required token, need to swap
          setFromToken(token);
          
          // Find target token in available tokens
          const targetToken = tokenBalances.find(t => 
            t.symbol === currency
          ) || {
            symbol: currency,
            chain: token.chain,
            balance: '0',
            token: {
              symbol: currency,
              name: currency,
              chain: token.chain,
              address: '',
              decimals: 18
            }
          };
          
          const toTokenObj = targetToken.token;
          
          setToToken(toTokenObj);
          setCurrentStep('swap-tokens');
          
          try {
            // Initiate token swap
            await (tokenSwap as any).initiateSwap({
              fromToken: token,
              toTokenSymbol: currency,
              amount: Number(amount)
            });
          } catch (swapError) {
            console.error('Swap initiation error:', swapError);
            setError('Failed to initiate token swap. Please try again.');
          }
        } else {
          // Token matches required token or no specific token required
          setCurrentStep('confirm-payment');
        }
      } else {
        // Insufficient balance
        trackAnalyticsEvent({ 
          eventType: 'token_selected', 
          tokenSymbol: token.symbol,
          chain: token.chain,
          error: 'Insufficient balance',
          metadata: { 
            success: false,
            required: amount.toString(), 
            available: new BigNumber(tokenBalance).toString() 
          }
        });
        setError(`Insufficient balance. You need at least ${amount} ${token.symbol}.`);
      }
    } catch (err) {
      console.error('Token selection error:', err);
      trackAnalyticsEvent({ 
        eventType: 'token_selected', 
        tokenSymbol: token.symbol,
        chain: token.chain,
        error: err instanceof Error ? err.message : 'Unknown error',
        metadata: { success: false }
      });
      setError('Failed to process token selection. Please try again.');
    } finally {
      setIsCheckingBalance(false);
    }
  };

  // Handler for swap completion
  const handleSwapComplete = async (result: SwapResult): Promise<void> => {
    if (result.success) {
      trackAnalyticsEvent({ 
        eventType: 'token_swap_completed', 
        tokenSymbol: result.token.symbol,
        amount: result.amount,
        metadata: { 
          destinationToken: result.token.symbol,
          txHash: result.transactionHash,
          exchangeRate: result.exchangeRate
        }
      });
      
      setSelectedToken(result.token);
      setCurrentStep('confirm-payment');
    } else {
      trackAnalyticsEvent({
        eventType: 'token_swap_initiated',
        tokenSymbol: fromToken?.symbol || '',
        error: result.error || 'Unknown error',
        metadata: {
          success: false,
          destination_token: result.token?.symbol
        }
      });
      
      setError(`Swap failed: ${result.error || 'Unknown error'}`);
      setCurrentStep('failed');
    }
  };

  // Handler for cancellation
  const handleCancel = (): void => {
    trackAnalyticsEvent({ 
      eventType: 'payment_failed', 
      paymentId: paymentInfo?.paymentId || 'not_created',
      metadata: { 
        reason: 'user_cancelled',
        step: currentStep
      }
    });
    
    setCurrentStep('connect-wallet');
    setSelectedToken(null);
    setPaymentInfo({
      paymentId: '',
      transactionHash: undefined,
      status: 'pending',
      error: undefined
    });
    setError(null);
    
    if (onClose) {
      onClose();
    }
  };

  // Handler for retry
  const handleRetry = (): void => {
    setError(null);
    setCurrentStep('connect-wallet');
    trackAnalyticsEvent({ 
      eventType: 'payment_created', 
      metadata: { 
        retry: true,
        previous_step: currentStep 
      }
    });
  };

  // Handler for payment confirmation
  const handleConfirmPayment = async (): Promise<void> => {
    if (!selectedToken) {
      setError('No token selected for payment');
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep('processing');
    setError(null);
    
    try {
      trackAnalyticsEvent({ 
        eventType: 'payment_created', 
        tokenSymbol: selectedToken.symbol,
        amount: amount.toString(),
        metadata: { 
          recipient: recipientAddress,
          confirmation_attempt: true 
        }
      });
      
      // Create payment
      const paymentDetails = await createPayment({
        token: selectedToken,
        amount: amount,
        recipient: recipientAddress
      });
      
      if (paymentDetails) {
        setPaymentInfo({
          ...paymentInfo,
          paymentId: paymentDetails.id || '',
          status: 'confirmed'
        });
        
        // Confirm payment
        const confirmationResult = await confirmPayment({
          paymentId: paymentDetails.id || '',
          token: selectedToken,
          amount: amount
        });
        
        if (confirmationResult.success) {
          trackAnalyticsEvent({ 
            eventType: 'payment_confirmed', 
            paymentId: paymentDetails.id || '',
            metadata: { transaction_hash: confirmationResult.transactionHash }
          });
          
          setPaymentInfo({
            ...paymentInfo,
            transactionHash: confirmationResult.transactionHash || undefined,
            status: 'confirmed'
          });
          
          setCurrentStep('complete');
        } else {
          throw new Error(confirmationResult.error || 'Payment confirmation failed');
        }
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      trackAnalyticsEvent({ 
        eventType: 'payment_failed', 
        error: errorMessage,
        metadata: { step: 'confirmation' }
      });
      
      setError(`Payment failed: ${errorMessage}`);
      setPaymentInfo({
        ...paymentInfo,
        status: 'failed',
        error: errorMessage
      });
      setCurrentStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepNumber = (step: PaymentStep): number => {
    const stepOrder: PaymentStep[] = [
      'connect-wallet',
      'select-token',
      'swap-tokens',
      'confirm-payment',
      'processing',
      'complete',
      'failed'
    ];
    
    const index = stepOrder.indexOf(step);
    return index >= 0 ? index + 1 : 1;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'connect-wallet':
        return (
          <VStack spacing={4} align="stretch">
            <Text>Connect your wallet to continue with the payment.</Text>
            <WalletConnector 
              onConnect={handleConnectWallet} 
              loading={isConnecting} 
            />
          </VStack>
        );

      case 'select-token':
        return (
          <VStack spacing={4} align="stretch">
            <PaymentSummary 
              details={{
                amount: amount.toString(),
                sourceToken: currency,
                destinationToken: currency,
                sourceChain: wallet?.activeChain || 'Unknown',
                destinationChain: wallet?.activeChain || 'Unknown',
                totalAmount: amount.toString(),
                merchantName: recipientName,
                paymentDescription: `Payment to ${recipientName || recipientAddress.substring(0, 8) + '...'}`
              }}
              showDetails={true}
            />
            <Text>Select a token to pay with:</Text>
            <TokenSelector 
              onSelect={handleTokenSelect} 
              selectedToken={currency} 
              loading={isCheckingBalance} 
            />
          </VStack>
        );

      case 'swap-tokens':
        return (
          <VStack spacing={4} align="stretch">
            <Text>You need to swap tokens to complete this payment.</Text>
            <TokenSwap 
              onSwap={handleSwapComplete} 
            />
          </VStack>
        );

      case 'confirm-payment':
        return (
          <VStack spacing={4} align="stretch">
            <PaymentSummary 
              address={recipientAddress}
              name={recipientName}
              amount={amount.toString()}
              currency={currency}
              token={selectedToken || undefined}
            />
            <Button 
              colorScheme="blue" 
              size="lg" 
              onClick={handleConfirmPayment}
              isLoading={isProcessing}
              leftIcon={<Icon as={CheckIcon} />}
            >
              Confirm Payment
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isProcessing}
            >
              Cancel
            </Button>
          </VStack>
        );

      case 'processing':
        return (
          <VStack spacing={6} align="center">
            <Spinner size="xl" color="blue.500" />
            <Text>Processing your payment...</Text>
          </VStack>
        );

      case 'complete':
        return (
          <VStack spacing={6} align="center">
            <Box
              bg="green.100"
              color="green.700"
              p={4}
              borderRadius="full"
              boxSize="80px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={CheckIcon} boxSize={10} />
            </Box>
            <Text fontSize="xl" fontWeight="bold">Payment Complete!</Text>
            <Text>Your transaction has been confirmed.</Text>
            {paymentInfo?.transactionHash && (
              <Text fontSize="sm">
                Transaction Hash: {paymentInfo.transactionHash.slice(0, 10)}...{paymentInfo.transactionHash.slice(-10)}
              </Text>
            )}
            <Button
              colorScheme="blue"
              onClick={() => {
                if (onComplete && selectedToken) {
                  onComplete({
                    paymentId: paymentInfo?.paymentId || '',
                    transactionHash: paymentInfo?.transactionHash || '',
                    amount: amount.toString(),
                    token: selectedToken,
                    timestamp: Date.now()
                  });
                }
              }}
            >
              Done
            </Button>
          </VStack>
        );

      case 'failed':
        return (
          <VStack spacing={6} align="center">
            <Box 
              bg="red.100" 
              p={4} 
              borderRadius="full"
            >
              <Icon as={CloseIcon} w={10} h={10} color="red.500" />
            </Box>
            <Text fontSize="xl" fontWeight="bold">Payment Failed</Text>
            {error && (
              <Text color="red.500" textAlign="center">
                {error}
              </Text>
            )}
            <HStack spacing={4} mt={2}>
              <Button leftIcon={<CloseIcon />} variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button leftIcon={<RepeatIcon />} colorScheme="blue" onClick={handleRetry}>
                Try Again
              </Button>
            </HStack>
          </VStack>
        );

      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box 
      className="nexor-payment-flow"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      bg="white"
      p={4}
      width="100%"
      maxW="500px"
    >
      {/* Header */}
      <HStack justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Payment Flow
        </Text>
        <Text fontSize="md" color="gray.500">
          {currentStep !== 'complete' && currentStep !== 'failed' && (
            <>
              Step {getStepNumber(currentStep)} of {getStepNumber('complete')}
            </>
          )}
        </Text>
      </HStack>

      {/* Main content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>

      {/* Error display */}
      {error && currentStep !== 'failed' && (
        <Box mt={4} p={3} bg="red.50" borderRadius="md" borderLeft="4px" borderColor="red.500">
          <Text color="red.500">{error}</Text>
        </Box>
      )}
    </Box>
  );
};

export default PaymentFlow;
