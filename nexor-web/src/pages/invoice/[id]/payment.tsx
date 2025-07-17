import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { usePaymentManagement } from '../../../hooks/usePaymentManagement';
import { useWalletConnection } from '../../../hooks/useWalletConnection';
import { useTokenSwap } from '../../../hooks/useTokenSwap';
import { useAnalytics } from '../../../hooks/useAnalytics';

export default function PaymentPage() {
  const router = useRouter();
  const { id: invoiceId, token: selectedToken } = router.query;
  
  // State
  const [step, setStep] = useState<'connect' | 'confirm' | 'processing' | 'complete' | 'error'>('connect');
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  
  // Hooks
  const { getInvoiceById, createPayment, updatePaymentStatus } = usePaymentManagement();
  const { connected, account, connect, disconnect, signAndSendTransaction } = useWalletConnection();
  const { getSwapQuote, executeSwap } = useTokenSwap();
  const { trackPageView, trackEvent } = useAnalytics();
  
  // Token data (would come from a proper token registry in production)
  const tokenData = {
    dot: {
      symbol: 'DOT',
      name: 'Polkadot',
      icon: '/assets/tokens/dot.svg',
      chain: 'Polkadot',
      decimals: 10
    },
    ksm: {
      symbol: 'KSM',
      name: 'Kusama',
      icon: '/assets/tokens/ksm.svg',
      chain: 'Kusama',
      decimals: 12
    },
    sol: {
      symbol: 'SOL',
      name: 'Solana',
      icon: '/assets/tokens/sol.svg',
      chain: 'Solana',
      decimals: 9
    },
    usdc: {
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '/assets/tokens/usdc.svg',
      chain: 'Solana',
      decimals: 6
    },
    usdt: {
      symbol: 'USDT',
      name: 'Tether',
      icon: '/assets/tokens/usdt.svg',
      chain: 'Solana',
      decimals: 6
    }
  };
  
  // Get current token
  const token = selectedToken && typeof selectedToken === 'string' 
    ? tokenData[selectedToken as keyof typeof tokenData] 
    : null;
  
  // Track page view
  useEffect(() => {
    if (invoiceId) {
      trackPageView('payment_page', { 
        invoiceId: String(invoiceId),
        token: selectedToken as string
      });
    }
  }, [invoiceId, selectedToken, trackPageView]);
  
  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const invoiceData = await getInvoiceById(String(invoiceId));
        setInvoice(invoiceData);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [invoiceId, getInvoiceById]);
  
  // Connect wallet
  const handleConnect = async () => {
    try {
      await connect(token?.chain.toLowerCase() || 'polkadot');
      setStep('confirm');
      
      trackEvent({
        eventType: 'wallet_connected',
        metadata: {
          invoiceId: String(invoiceId),
          chain: token?.chain || 'unknown'
        }
      });
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };
  
  // Handle payment confirmation
  const handleConfirm = async () => {
    if (!invoice || !token || !account) return;
    
    setStep('processing');
    setError(null);
    
    try {
      // Create payment record
      const payment = await createPayment({
        invoiceId: invoice.id,
        amount: invoice.amount,
        token: token.symbol,
        walletAddress: account.address
      });
      
      // Track event
      trackEvent({
        eventType: 'payment_initiated',
        metadata: {
          invoiceId: String(invoiceId),
          paymentId: payment.id,
          token: token.symbol
        }
      });
      
      // Mock transaction for development
      // In production, this would use the actual blockchain SDK
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      
      // Simulate blockchain confirmation time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update payment status
      await updatePaymentStatus(payment.id, 'completed', txHash);
      
      // Set transaction data
      setTransaction({
        hash: txHash,
        from: account.address,
        to: '0x3F4a354c8b133d4F63268c69d15bd39F8f465f19', // Mock merchant address
        amount: invoice.amount,
        token: token.symbol,
        timestamp: new Date().toISOString()
      });
      
      // Track successful payment
      trackEvent({
        eventType: 'payment_completed',
        metadata: {
          invoiceId: String(invoiceId),
          paymentId: payment.id,
          transactionHash: txHash
        }
      });
      
      setStep('complete');
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Payment failed. Please try again.');
      setStep('error');
      
      // Track failed payment
      trackEvent({
        eventType: 'payment_failed',
        metadata: {
          invoiceId: String(invoiceId),
          error: String(err)
        }
      });
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && step !== 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Card className="p-6 max-w-md w-full" glassmorphism>
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button
              onClick={() => router.push(`/invoice/${invoiceId}/payment-method`)}
              glassmorphism
              fullWidth
            >
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  // Render main payment flow
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'connect' && 'Connect Your Wallet'}
            {step === 'confirm' && 'Confirm Payment'}
            {step === 'processing' && 'Processing Payment'}
            {step === 'complete' && 'Payment Complete'}
            {step === 'error' && 'Payment Failed'}
          </h1>
          <p className="text-gray-300">
            {step === 'connect' && 'Connect your wallet to proceed with the payment'}
            {step === 'confirm' && 'Review and confirm your payment details'}
            {step === 'processing' && 'Please wait while we process your payment'}
            {step === 'complete' && 'Your payment has been successfully processed'}
            {step === 'error' && 'There was an error processing your payment'}
          </p>
        </div>
        
        {/* Payment Card */}
        <Card className="p-6" glassmorphism>
          {/* Connect Wallet Step */}
          {step === 'connect' && (
            <div className="text-center">
              <div className="mb-8">
                <img 
                  src={token?.icon || '/assets/tokens/generic.svg'} 
                  alt={token?.name || 'Token'} 
                  className="w-20 h-20 mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-1">
                  Pay with {token?.name || 'Cryptocurrency'}
                </h2>
                <p className="text-gray-400">
                  Amount: {invoice && formatCurrency(parseFloat(invoice.amount))}
                </p>
              </div>
              
              <Button
                onClick={handleConnect}
                glassmorphism
                fullWidth
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                }
              >
                Connect {token?.chain || 'Wallet'}
              </Button>
              
              <div className="mt-6 text-sm text-gray-400">
                <p>
                  By connecting your wallet, you agree to our{' '}
                  <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                </p>
              </div>
            </div>
          )}
          
          {/* Confirm Payment Step */}
          {step === 'confirm' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <img 
                    src={token?.icon || '/assets/tokens/generic.svg'} 
                    alt={token?.name || 'Token'} 
                    className="w-10 h-10 mr-3"
                  />
                  <div>
                    <p className="font-medium">{token?.name || 'Token'}</p>
                    <p className="text-sm text-gray-400">{token?.chain || 'Blockchain'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{invoice && formatCurrency(parseFloat(invoice.amount))}</p>
                  <p className="text-sm text-gray-400">USD</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-sm">{account ? formatAddress(account.address) : 'Not connected'}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={disconnect}
                    >
                      Change
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Merchant</p>
                  <p>{invoice?.merchantName || 'Unknown Merchant'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Description</p>
                  <p>{invoice?.description || 'No description provided'}</p>
                </div>
              </div>
              
              <Button
                onClick={handleConfirm}
                glassmorphism
                fullWidth
              >
                Confirm Payment
              </Button>
              
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/invoice/${invoiceId}/payment-method`)}
                >
                  Change Payment Method
                </Button>
              </div>
            </div>
          )}
          
          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <svg className="animate-spin absolute inset-0 h-full w-full text-primary opacity-25" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <img 
                    src={token?.icon || '/assets/tokens/generic.svg'} 
                    alt={token?.name || 'Token'} 
                    className="w-12 h-12"
                  />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-2">Processing Your Payment</h3>
              <p className="text-gray-400 mb-6">
                Please keep this page open while we process your transaction
              </p>
              
              <div className="space-y-2 max-w-xs mx-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Connecting wallet</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Preparing transaction</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Signing transaction</span>
                  <div className="animate-pulse">
                    <div className="h-5 w-5 bg-primary bg-opacity-50 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-sm text-gray-400">Confirming on blockchain</span>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-500"></div>
                </div>
                
                <div className="flex justify-between items-center opacity-50">
                  <span className="text-sm text-gray-400">Completing payment</span>
                  <div className="h-5 w-5 rounded-full border-2 border-gray-500"></div>
                </div>
              </div>
            </div>
          )}
          
          {/* Complete Step */}
          {step === 'complete' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="rounded-full bg-green-500 bg-opacity-20 p-4 inline-block mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
                <p className="text-gray-400">
                  Your payment of {invoice && formatCurrency(parseFloat(invoice.amount))} has been processed successfully
                </p>
              </div>
              
              <div className="space-y-4 mb-6 text-left">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Transaction Hash</p>
                  <p className="font-mono text-sm break-all">{transaction?.hash}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">From</p>
                    <p className="font-mono text-sm">{formatAddress(transaction?.from)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">To</p>
                    <p className="font-mono text-sm">{formatAddress(transaction?.to)}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <p>{invoice && formatCurrency(parseFloat(invoice.amount))}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => router.push(`/invoice/${invoiceId}/success`)}
                  glassmorphism
                  fullWidth
                >
                  View Receipt
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would navigate to the merchant's return URL
                    window.location.href = invoice?.returnUrl || '/';
                  }}
                  glassmorphism
                >
                  Return to Merchant
                </Button>
              </div>
            </div>
          )}
          
          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="rounded-full bg-red-500 bg-opacity-20 p-4 inline-block mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
                <p className="text-gray-400 mb-4">
                  {error || 'There was an error processing your payment'}
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => setStep('connect')}
                  glassmorphism
                  fullWidth
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push(`/invoice/${invoiceId}/payment-method`)}
                  glassmorphism
                >
                  Change Payment Method
                </Button>
              </div>
            </div>
          )}
        </Card>
        
        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need help? <a href="/support" className="text-primary hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
