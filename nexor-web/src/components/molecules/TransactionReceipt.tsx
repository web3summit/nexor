import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { formatCurrency, formatAddress } from '../../utils/formatters';
import Image from 'next/image';

export interface TransactionReceiptProps {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  token: string;
  usdEquivalent?: number;
  networkFee?: number;
  networkName: string;
  timestamp: Date;
  merchantName: string;
  merchantLogo?: string;
  invoiceId?: string;
  paymentDescription?: string;
  className?: string;
  glassmorphism?: boolean;
  onClose?: () => void;
}

export const TransactionReceipt: React.FC<TransactionReceiptProps> = ({
  txHash,
  fromAddress,
  toAddress,
  amount,
  token,
  usdEquivalent,
  networkFee,
  networkName,
  timestamp,
  merchantName,
  merchantLogo,
  invoiceId,
  paymentDescription,
  className = '',
  glassmorphism = true,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate PDF receipt (mock implementation)
  const downloadReceipt = () => {
    // In a real implementation, this would use a library like jsPDF or html2canvas
    // to generate a PDF from the receipt content
    alert('Receipt download functionality will be implemented with a PDF generation library');
    
    // Example implementation would be:
    // html2canvas(receiptRef.current).then(canvas => {
    //   const imgData = canvas.toDataURL('image/png');
    //   const pdf = new jsPDF();
    //   pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    //   pdf.save(`receipt-${invoiceId || txHash.substring(0, 8)}.pdf`);
    // });
  };

  return (
    <Card className={`${className} max-w-md mx-auto`} padding="lg" glassmorphism={glassmorphism}>
      <div ref={receiptRef} className="flex flex-col">
        {/* Header with logo and close button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {merchantLogo ? (
              <div className="w-10 h-10 mr-3 rounded-full overflow-hidden">
                <Image 
                  src={merchantLogo} 
                  alt={`${merchantName} logo`} 
                  width={40} 
                  height={40} 
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold">{merchantName.charAt(0)}</span>
              </div>
            )}
            <h2 className="text-xl font-bold">{merchantName}</h2>
          </div>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Receipt title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Payment Receipt</h1>
          <p className="text-gray-500 dark:text-gray-400">{formatDate(timestamp)}</p>
          {invoiceId && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice #{invoiceId}</p>
          )}
        </div>
        
        {/* Payment details */}
        <div className="mb-6 bg-gray-800 bg-opacity-20 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-gray-500 dark:text-gray-400">Amount</span>
            <span className="font-bold">{amount} {token}</span>
          </div>
          
          {usdEquivalent !== undefined && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">USD Equivalent</span>
              <span>{formatCurrency(usdEquivalent)}</span>
            </div>
          )}
          
          {networkFee !== undefined && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 dark:text-gray-400">Network Fee</span>
              <span>{networkFee} {token}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Total</span>
            <span className="font-bold">{amount + (networkFee || 0)} {token}</span>
          </div>
        </div>
        
        {/* Transaction details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Hash</p>
              <p className="font-mono text-sm truncate">{txHash}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
              <p className="font-mono text-sm truncate">{fromAddress}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
              <p className="font-mono text-sm truncate">{toAddress}</p>
            </div>
            
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                <p>{networkName}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p>{formatDate(timestamp)}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Payment description if available */}
        {paymentDescription && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 dark:text-gray-300">{paymentDescription}</p>
          </div>
        )}
        
        {/* QR code with transaction hash */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-lg">
            {/* In a real implementation, use a QR code library */}
            <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-500">QR Code Placeholder</span>
            </div>
          </div>
        </div>
        
        {/* Download button */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={downloadReceipt}
            glassmorphism
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Receipt
          </Button>
        </motion.div>
        
        {/* Footer with verification message */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>This receipt is cryptographically verifiable on the {networkName} blockchain.</p>
          <p className="mt-1">Nexor Payment Widget v1.0</p>
        </div>
      </div>
    </Card>
  );
};
