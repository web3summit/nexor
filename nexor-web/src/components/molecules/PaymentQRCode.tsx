import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface PaymentQRCodeProps {
  paymentAddress: string;
  amount?: string;
  tokenSymbol?: string;
  chain?: string;
  memo?: string;
  onCopyAddress?: () => void;
  className?: string;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  paymentAddress,
  amount,
  tokenSymbol,
  chain,
  memo,
  onCopyAddress,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [qrValue, setQrValue] = useState('');
  
  useEffect(() => {
    // Create a payment URI based on the chain
    // This is a simplified implementation - in a real app, we would use the proper URI scheme for each chain
    let uri = '';
    
    switch (chain?.toLowerCase()) {
      case 'polkadot':
      case 'kusama':
        uri = `substrate:${paymentAddress}${amount ? `?amount=${amount}` : ''}${memo ? `&memo=${encodeURIComponent(memo)}` : ''}`;
        break;
      case 'solana':
        uri = `solana:${paymentAddress}${amount ? `?amount=${amount}` : ''}${memo ? `&memo=${encodeURIComponent(memo)}` : ''}`;
        break;
      default:
        // Generic format as fallback
        uri = `pay:${paymentAddress}${amount ? `?amount=${amount}` : ''}${tokenSymbol ? `&token=${tokenSymbol}` : ''}${memo ? `&memo=${encodeURIComponent(memo)}` : ''}`;
    }
    
    setQrValue(uri);
  }, [paymentAddress, amount, tokenSymbol, chain, memo]);
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        if (onCopyAddress) {
          onCopyAddress();
        }
      })
      .catch((err) => {
        console.error('Failed to copy address:', err);
      });
  };
  
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  
  return (
    <Card className={`p-6 ${className}`} glassmorphism>
      <div className="flex flex-col items-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-3 rounded-lg"
        >
          <QRCode
            value={qrValue}
            size={200}
            level="H"
            includeMargin={true}
            renderAs="svg"
          />
        </motion.div>
        
        {(amount || tokenSymbol) && (
          <div className="text-center">
            <p className="text-lg font-semibold">
              {amount && `${amount} `}{tokenSymbol || ''}
            </p>
            {chain && (
              <p className="text-sm text-gray-400">
                on {chain.charAt(0).toUpperCase() + chain.slice(1)}
              </p>
            )}
          </div>
        )}
        
        <div className="w-full">
          <div className="text-sm text-gray-400 mb-1 text-center">Send to this address</div>
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg font-mono text-sm overflow-hidden">
              {formatAddress(paymentAddress)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              aria-label="Copy address"
              title="Copy address"
            >
              {copied ? (
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </motion.svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
              )}
            </Button>
          </div>
        </div>
        
        {memo && (
          <div className="w-full">
            <div className="text-sm text-gray-400 mb-1">Memo/Reference (required)</div>
            <div className="bg-gray-800 bg-opacity-50 px-4 py-2 rounded-lg text-sm overflow-hidden text-center">
              {memo}
            </div>
          </div>
        )}
        
        <div className="text-center text-sm text-gray-400 mt-2">
          <p>Scan this QR code with your wallet app</p>
          <p>or copy the address and send manually</p>
        </div>
      </div>
    </Card>
  );
};
