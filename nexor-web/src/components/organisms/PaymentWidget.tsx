import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentForm, PaymentFormData } from './PaymentForm';
import { PaymentStatus, PaymentStatusType } from '../molecules/PaymentStatus';
import { QRCode } from '../atoms/QRCode';
import { Button } from '../atoms/Button';
import { Card } from '../atoms/Card';

export interface PaymentWidgetProps {
  merchantId: string;
  merchantName: string;
  merchantLogo?: string;
  amount?: string;
  currency?: string;
  description?: string;
  onClose?: () => void;
  onPaymentComplete?: (txHash: string) => void;
  onPaymentFailed?: (error: Error) => void;
  className?: string;
}

// Mock data for demonstration
const MOCK_TOKENS = [
  {
    symbol: 'DOT',
    name: 'Polkadot',
    logo: '/tokens/dot.png',
    chain: 'polkadot',
  },
  {
    symbol: 'KSM',
    name: 'Kusama',
    logo: '/tokens/ksm.png',
    chain: 'kusama',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    logo: '/tokens/usdc.png',
    chain: 'polkadot',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    logo: '/tokens/usdt.png',
    chain: 'polkadot',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin (Solana)',
    logo: '/tokens/usdc.png',
    chain: 'solana',
  },
];

const MOCK_WALLETS = [
  {
    id: 'polkadot-js',
    name: 'Polkadot.js',
    logo: '/wallets/polkadot-js.png',
    chain: 'polkadot' as const,
  },
  {
    id: 'talisman',
    name: 'Talisman',
    logo: '/wallets/talisman.png',
    chain: 'polkadot' as const,
  },
  {
    id: 'subwallet',
    name: 'SubWallet',
    logo: '/wallets/subwallet.png',
    chain: 'polkadot' as const,
  },
  {
    id: 'phantom',
    name: 'Phantom',
    logo: '/wallets/phantom.png',
    chain: 'solana' as const,
  },
];

export const PaymentWidget: React.FC<PaymentWidgetProps> = ({
  merchantId,
  merchantName,
  merchantLogo,
  amount,
  currency,
  description,
  onClose,
  onPaymentComplete,
  onPaymentFailed,
  className = '',
}) => {
  const [currentView, setCurrentView] = useState<'form' | 'qr' | 'status'>('form');
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusType>('pending');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [paymentAddress, setPaymentAddress] = useState<string | undefined>();
  const [qrValue, setQrValue] = useState<string | undefined>();

  // Simulate fetching merchant data and supported tokens
  useEffect(() => {
    // In a real implementation, we would fetch this data from the API
    // For now, we'll use mock data
    console.log(`Fetching merchant data for ID: ${merchantId}`);
  }, [merchantId]);

  const handlePaymentSubmit = async (data: PaymentFormData) => {
    setPaymentData(data);
    
    // For QR-based wallets, show QR code
    if (data.wallet.id === 'polkadot-js') {
      // Generate payment address and QR code
      const mockAddress = 'DQiw78rUjGVF9rXG7jV8RgiXZKgQ5JFbWvgwZ1xvgPxcWMT';
      setPaymentAddress(mockAddress);
      setQrValue(`substrate:${mockAddress}:${data.amount}:${data.token.symbol}`);
      setCurrentView('qr');
    } else {
      // For direct wallet connections, process payment
      await processPayment(data);
    }
  };

  const processPayment = async (data: PaymentFormData) => {
    try {
      setCurrentView('status');
      setPaymentStatus('processing');
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock successful transaction
      const mockTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      setTxHash(mockTxHash);
      setPaymentStatus('completed');
      
      if (onPaymentComplete) {
        onPaymentComplete(mockTxHash);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setPaymentStatus('failed');
      
      if (onPaymentFailed && error instanceof Error) {
        onPaymentFailed(error);
      }
    }
  };

  const handleQrPaymentCheck = async () => {
    // In a real implementation, we would poll the blockchain for the transaction
    // For now, we'll simulate a successful payment after a delay
    setCurrentView('status');
    setPaymentStatus('processing');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockTxHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    setTxHash(mockTxHash);
    setPaymentStatus('completed');
    
    if (onPaymentComplete) {
      onPaymentComplete(mockTxHash);
    }
  };

  return (
    <Card className={`max-w-md w-full mx-auto ${className}`} glassmorphism>
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Nexor Payment</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentView === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentForm
              merchantName={merchantName}
              merchantLogo={merchantLogo}
              amount={amount}
              currency={currency}
              description={description}
              supportedTokens={MOCK_TOKENS}
              supportedWallets={MOCK_WALLETS}
              onSubmit={handlePaymentSubmit}
            />
          </motion.div>
        )}

        {currentView === 'qr' && qrValue && (
          <motion.div
            key="qr"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <QRCode
              value={qrValue}
              size={200}
              title="Scan to Pay"
              description={`Send ${paymentData?.amount} ${paymentData?.token.symbol} to the address below`}
              className="mb-4"
            />
            
            {paymentAddress && (
              <div className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6 overflow-hidden">
                <p className="text-sm font-mono text-center truncate">{paymentAddress}</p>
              </div>
            )}
            
            <div className="flex space-x-4 w-full">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setCurrentView('form')}
              >
                Back
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleQrPaymentCheck}
              >
                I've Sent the Payment
              </Button>
            </div>
          </motion.div>
        )}

        {currentView === 'status' && (
          <motion.div
            key="status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PaymentStatus
              status={paymentStatus}
              txHash={txHash}
              blockExplorerUrl={
                paymentData?.token.chain === 'polkadot'
                  ? 'https://polkadot.subscan.io'
                  : paymentData?.token.chain === 'kusama'
                  ? 'https://kusama.subscan.io'
                  : 'https://explorer.solana.com'
              }
            />
            
            {paymentStatus === 'completed' && (
              <Button
                variant="primary"
                fullWidth
                className="mt-6"
                onClick={onClose}
              >
                Done
              </Button>
            )}
            
            {paymentStatus === 'failed' && (
              <div className="flex space-x-4 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setCurrentView('form')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => processPayment(paymentData!)}
                >
                  Try Again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
