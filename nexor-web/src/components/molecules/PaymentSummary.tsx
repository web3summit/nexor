import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { formatCurrency } from '../../utils/formatters';

export interface PaymentDetails {
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
}

export interface PaymentSummaryProps {
  details: PaymentDetails;
  className?: string;
  showDetails?: boolean;
  glassmorphism?: boolean;
  onViewReceipt?: () => void;
}

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  details,
  className = '',
  showDetails = true,
  glassmorphism = true,
  onViewReceipt,
}) => {
  const [expanded, setExpanded] = useState(false);
  const {
    amount,
    sourceToken,
    destinationToken,
    sourceChain,
    destinationChain,
    exchangeRate,
    networkFee,
    estimatedTime,
    totalAmount,
    amountUsd,
    merchantName,
    merchantLogo,
    invoiceId,
    expiresAt,
    paymentDescription,
  } = details;

  const isCrossChain = sourceChain !== destinationChain;
  const isTokenSwap = sourceToken !== destinationToken;

  // Calculate time remaining if expiration exists
  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };
  
  const timeRemaining = getTimeRemaining();
  
  return (
    <Card 
      className={`${className} overflow-hidden`} 
      padding={showDetails ? "md" : "sm"}
      glassmorphism={glassmorphism}
    >
      {/* Merchant info if available */}
      {merchantName && (
        <div className="flex items-center space-x-3 mb-4">
          {merchantLogo && (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
              <img src={merchantLogo} alt={merchantName} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <h4 className="font-medium text-sm text-gray-500 dark:text-gray-400">Payment to</h4>
            <h3 className="font-semibold">{merchantName}</h3>
          </div>
        </div>
      )}
      
      {/* Payment description */}
      {paymentDescription && (
        <div className="mb-4 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-50 p-3 rounded-lg">
          <p className="text-sm">{paymentDescription}</p>
        </div>
      )}
      
      {/* Main payment amount */}
      <div className="flex flex-col items-center justify-center mb-4">
        <h2 className="text-2xl font-bold">
          {amount} {sourceToken}
        </h2>
        {amountUsd && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ≈ {amountUsd} USD
          </p>
        )}
      </div>
      
      {/* Time remaining if applicable */}
      {timeRemaining && (
        <div className="mb-4 flex items-center justify-center">
          <div className="bg-yellow-500 bg-opacity-20 text-yellow-300 px-3 py-1 rounded-full text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Expires in {timeRemaining}</span>
          </div>
        </div>
      )}
      
      {/* Toggle details button */}
      {showDetails && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-2"
        >
          {expanded ? 'Hide details' : 'Show details'}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {invoiceId && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Invoice ID</span>
                  <span className="font-mono text-sm">{invoiceId}</span>
                </div>
              )}
              
              {isTokenSwap && exchangeRate && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
                  <span className="font-medium">{exchangeRate}</span>
                </div>
              )}
              
              {networkFee && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
                  <span className="font-medium">{networkFee}</span>
                </div>
              )}
              
              {isCrossChain && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Source Chain</span>
                  <span className="font-medium capitalize">{sourceChain}</span>
                </div>
              )}
              
              {isCrossChain && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Destination Chain</span>
                  <span className="font-medium capitalize">{destinationChain}</span>
                </div>
              )}
              
              {estimatedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Estimated Time</span>
                  <span className="font-medium">{estimatedTime}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Total section */}
      <div className={`${showDetails ? 'pt-3 mt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
        <div className="flex justify-between">
          <span className="text-gray-700 dark:text-gray-200 font-medium">Total</span>
          <span className="font-semibold">{totalAmount} {sourceToken}</span>
        </div>
        {isTokenSwap && (
          <div className="flex justify-between mt-1">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Recipient receives</span>
            <span className="font-medium text-sm">
              {/* This would be calculated based on exchange rate */}
              {amount} {destinationToken}
            </span>
          </div>
        )}
      </div>
      
      {/* Receipt button */}
      {onViewReceipt && (
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            fullWidth 
            onClick={onViewReceipt}
            className="text-purple-400 hover:text-purple-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            View Receipt
          </Button>
        </motion.div>
      )}
    </Card>
  );
};
