import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { formatAddress } from '../../utils/formatters';

export type PaymentStatusType = 'pending' | 'processing' | 'confirming' | 'completed' | 'failed';

export interface PaymentStatusProps {
  status: PaymentStatusType;
  txHash?: string;
  blockExplorerUrl?: string;
  message?: string;
  className?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  fromAddress?: string;
  toAddress?: string;
  networkName?: string;
  timestamp?: Date;
  onViewReceipt?: () => void;
  glassmorphism?: boolean;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  status,
  txHash,
  blockExplorerUrl,
  message,
  className = '',
  confirmations = 0,
  requiredConfirmations = 3,
  fromAddress,
  toAddress,
  networkName,
  timestamp,
  onViewReceipt,
  glassmorphism = true,
}) => {
  const [progressWidth, setProgressWidth] = useState(0);
  
  // Animate progress bar for confirming status
  useEffect(() => {
    if (status === 'confirming' && requiredConfirmations > 0) {
      const percentage = Math.min((confirmations / requiredConfirmations) * 100, 100);
      setProgressWidth(percentage);
    } else if (status === 'completed') {
      setProgressWidth(100);
    } else if (status === 'processing') {
      // Indeterminate progress animation
      const interval = setInterval(() => {
        setProgressWidth(prev => (prev >= 90 ? 10 : prev + 10));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setProgressWidth(0);
    }
  }, [status, confirmations, requiredConfirmations]);
  
  // Format timestamp to readable date
  const formatTimestamp = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: (
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Payment Pending',
          description: message || 'Your payment is waiting to be submitted to the blockchain.',
          color: 'border-yellow-500',
          bgColor: 'bg-yellow-500',
          textColor: 'text-yellow-500',
          bgOpacity: 'bg-opacity-10',
        };
      case 'processing':
        return {
          icon: (
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          title: 'Payment Processing',
          description: message || 'Your transaction is being processed on the blockchain.',
          color: 'border-blue-500',
          bgColor: 'bg-blue-500',
          textColor: 'text-blue-500',
          bgOpacity: 'bg-opacity-10',
        };
      case 'confirming':
        return {
          icon: (
            <div className="relative">
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {confirmations}
              </div>
            </div>
          ),
          title: 'Confirming',
          description: message || `Transaction confirmed with ${confirmations}/${requiredConfirmations} confirmations.`,
          color: 'border-purple-500',
          bgColor: 'bg-purple-500',
          textColor: 'text-purple-500',
          bgOpacity: 'bg-opacity-10',
        };
      case 'completed':
        return {
          icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: 'Payment Completed',
          description: message || 'Your payment has been successfully confirmed on the blockchain.',
          color: 'border-green-500',
          bgColor: 'bg-green-500',
          textColor: 'text-green-500',
          bgOpacity: 'bg-opacity-10',
        };
      case 'failed':
        return {
          icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          title: 'Payment Failed',
          description: message || 'There was an issue with your payment. Please try again.',
          color: 'border-red-500',
          bgColor: 'bg-red-500',
          textColor: 'text-red-500',
          bgOpacity: 'bg-opacity-10',
        };
      default:
        return {
          icon: (
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Unknown Status',
          description: 'The status of your payment is unknown.',
          color: 'border-gray-500',
          bgColor: 'bg-gray-500',
          textColor: 'text-gray-500',
          bgOpacity: 'bg-opacity-10',
        };
    }
  };

  const { icon, title, description, color, bgColor, textColor, bgOpacity } = getStatusConfig();

  return (
    <Card className={`${className}`} padding="md" glassmorphism={glassmorphism}>
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`p-4 rounded-full border-2 ${color} ${bgColor} ${bgOpacity} mb-4`}
        >
          {icon}
        </motion.div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        
        {/* Progress bar for confirming status */}
        {(status === 'confirming' || status === 'processing' || status === 'completed') && (
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 overflow-hidden">
            <motion.div 
              className={`h-full ${bgColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
        
        {/* Transaction details */}
        <AnimatePresence>
          {txHash && (
            <motion.div 
              className="w-full space-y-3 mb-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              {/* Transaction hash */}
              <div className="p-3 bg-gray-800 bg-opacity-30 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">Transaction Hash</span>
                  {blockExplorerUrl && (
                    <a
                      href={`${blockExplorerUrl}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs ${textColor} hover:underline`}
                    >
                      View
                    </a>
                  )}
                </div>
                <p className="text-sm font-mono truncate">{txHash}</p>
              </div>
              
              {/* From/To addresses if available */}
              {(fromAddress || toAddress) && (
                <div className="grid grid-cols-1 gap-2">
                  {fromAddress && (
                    <div className="p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">From</div>
                      <p className="text-sm font-mono truncate">{formatAddress(fromAddress, 10, 6)}</p>
                    </div>
                  )}
                  
                  {toAddress && (
                    <div className="p-3 bg-gray-800 bg-opacity-30 rounded-lg">
                      <div className="text-xs text-gray-400 mb-1">To</div>
                      <p className="text-sm font-mono truncate">{formatAddress(toAddress, 10, 6)}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Network and timestamp info */}
              <div className="flex justify-between text-xs text-gray-400">
                {networkName && <span>{networkName}</span>}
                {timestamp && <span>{formatTimestamp(timestamp)}</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Action buttons */}
        <div className="w-full flex flex-col space-y-2">
          {txHash && blockExplorerUrl && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => window.open(`${blockExplorerUrl}/tx/${txHash}`, '_blank')}
              glassmorphism
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
              View on Block Explorer
            </Button>
          )}
          
          {status === 'completed' && onViewReceipt && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={onViewReceipt}
              glassmorphism
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              View Receipt
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
