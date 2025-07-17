import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { usePaymentManagement } from '../../../hooks/usePaymentManagement';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useTokenPrices } from '../../../hooks/useTokenPrices';

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  chain: string;
  chainIcon: string;
  price: number;
}

export default function PaymentMethodPage() {
  const router = useRouter();
  const { id: invoiceId } = router.query;
  
  // State
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<any>(null);
  
  // Hooks
  const { getInvoiceById } = usePaymentManagement();
  const { getTokenPrices } = useTokenPrices();
  const { trackPageView, trackEvent } = useAnalytics();
  
  // Available tokens
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: 'dot',
      symbol: 'DOT',
      name: 'Polkadot',
      icon: '/assets/tokens/dot.svg',
      chain: 'Polkadot',
      chainIcon: '/assets/chains/polkadot.svg',
      price: 0
    },
    {
      id: 'ksm',
      symbol: 'KSM',
      name: 'Kusama',
      icon: '/assets/tokens/ksm.svg',
      chain: 'Kusama',
      chainIcon: '/assets/chains/kusama.svg',
      price: 0
    },
    {
      id: 'sol',
      symbol: 'SOL',
      name: 'Solana',
      icon: '/assets/tokens/sol.svg',
      chain: 'Solana',
      chainIcon: '/assets/chains/solana.svg',
      price: 0
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '/assets/tokens/usdc.svg',
      chain: 'Solana',
      chainIcon: '/assets/chains/solana.svg',
      price: 0
    },
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether',
      icon: '/assets/tokens/usdt.svg',
      chain: 'Solana',
      chainIcon: '/assets/chains/solana.svg',
      price: 0
    }
  ]);
  
  // Track page view
  useEffect(() => {
    if (invoiceId) {
      trackPageView('payment_method_page', { invoiceId: String(invoiceId) });
    }
  }, [invoiceId, trackPageView]);
  
  // Fetch invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const invoiceData = await getInvoiceById(String(invoiceId));
        setInvoice(invoiceData);
        
        // Get token prices
        const prices = await getTokenPrices(['DOT', 'KSM', 'SOL', 'USDC', 'USDT']);
        
        // Update tokens with prices
        setTokens(prevTokens => 
          prevTokens.map(token => ({
            ...token,
            price: prices[token.symbol] || 0
          }))
        );
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [invoiceId, getInvoiceById, getTokenPrices]);
  
  // Calculate token amount based on USD price
  const calculateTokenAmount = (token: Token) => {
    if (!invoice || token.price <= 0) return '0';
    
    const usdAmount = parseFloat(invoice.amount);
    const tokenAmount = usdAmount / token.price;
    
    // Format based on token value
    if (token.price > 100) {
      return tokenAmount.toFixed(4);
    } else if (token.price > 1) {
      return tokenAmount.toFixed(6);
    } else {
      return tokenAmount.toFixed(8);
    }
  };
  
  // Handle token selection
  const handleTokenSelect = (tokenId: string) => {
    setSelectedToken(tokenId);
    
    // Track event
    trackEvent({
      eventType: 'payment_method_selected',
      metadata: {
        invoiceId: String(invoiceId),
        tokenId: tokenId
      }
    });
  };
  
  // Handle continue button click
  const handleContinue = () => {
    if (!selectedToken) return;
    
    // Navigate to payment page
    router.push(`/invoice/${invoiceId}/payment?token=${selectedToken}`);
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-lg">Loading payment options...</p>
        </div>
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Card className="p-6 max-w-md w-full" glassmorphism>
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Error Loading Invoice</h2>
            <p className="text-gray-300 mb-6">{error || 'Invoice not found'}</p>
            <Button
              onClick={() => router.push('/')}
              glassmorphism
              fullWidth
            >
              Return to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Payment Method</h1>
          <p className="text-gray-300">
            Select the cryptocurrency you want to use for this payment
          </p>
        </div>
        
        {/* Invoice Summary */}
        <Card className="p-6 mb-8" glassmorphism>
          <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Invoice ID</p>
              <p className="font-mono">{invoice.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="text-xl font-bold">{formatCurrency(parseFloat(invoice.amount))}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Merchant</p>
              <p>{invoice.merchantName || 'Unknown Merchant'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Description</p>
              <p>{invoice.description || 'No description provided'}</p>
            </div>
          </div>
        </Card>
        
        {/* Payment Methods */}
        <Card className="p-6" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">Available Payment Methods</h2>
          
          <div className="space-y-4">
            {tokens.map((token) => (
              <motion.div
                key={token.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTokenSelect(token.id)}
                className={`p-4 rounded-lg cursor-pointer transition-all border ${
                  selectedToken === token.id
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <img
                        src={token.icon}
                        alt={token.symbol}
                        className="w-10 h-10 rounded-full"
                      />
                      <img
                        src={token.chainIcon}
                        alt={token.chain}
                        className="w-5 h-5 rounded-full absolute -bottom-1 -right-1 border border-gray-800"
                      />
                    </div>
                    
                    <div className="ml-4">
                      <p className="font-medium">{token.name}</p>
                      <p className="text-sm text-gray-400">{token.chain} Network</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-mono font-medium">
                      {calculateTokenAmount(token)} {token.symbol}
                    </p>
                    <p className="text-sm text-gray-400">
                      1 {token.symbol} = {formatCurrency(token.price)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button
              onClick={handleContinue}
              disabled={!selectedToken}
              glassmorphism
              fullWidth
              rightIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Continue to Payment
            </Button>
          </div>
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
