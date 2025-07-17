import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { PaymentQRCode } from '../molecules/PaymentQRCode';
import { TransactionDetails } from '../molecules/TransactionDetails';
import { PaymentReceiptData, downloadReceiptPdf, sendReceiptEmail } from '../../utils/paymentReceipt';
import { Input } from '../atoms/Input';

interface PaymentReceiptProps {
  paymentData: PaymentReceiptData;
  onClose?: () => void;
  onNewPayment?: () => void;
}

export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  paymentData,
  onClose,
  onNewPayment,
}) => {
  const [emailInput, setEmailInput] = useState(paymentData.customerEmail || '');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const handleDownloadReceipt = () => {
    downloadReceiptPdf(paymentData, {
      includeQrCode: true,
      includeBlockExplorerLink: true,
      includeMerchantLogo: true,
    });
  };
  
  const handleSendEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      const success = await sendReceiptEmail(
        paymentData,
        emailInput,
        {
          includeQrCode: true,
          includeBlockExplorerLink: true,
          includeMerchantLogo: true,
        }
      );
      
      if (success) {
        setEmailSent(true);
        setTimeout(() => {
          setEmailSent(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to send receipt email:', error);
    } finally {
      setIsSendingEmail(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      className="max-w-lg mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="p-6" glassmorphism>
        <motion.div variants={itemVariants} className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {paymentData.status === 'completed' ? (
              <div className="bg-green-500 bg-opacity-20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            ) : paymentData.status === 'pending' ? (
              <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="bg-red-500 bg-opacity-20 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-1">
            {paymentData.status === 'completed' ? 'Payment Successful!' : 
             paymentData.status === 'pending' ? 'Payment Pending' : 'Payment Failed'}
          </h2>
          
          <p className="text-gray-400">
            {paymentData.status === 'completed' ? 'Your transaction has been confirmed.' : 
             paymentData.status === 'pending' ? 'Waiting for blockchain confirmation.' : 'There was an issue with your payment.'}
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Amount</span>
              <span className="text-lg font-semibold">${paymentData.amountUsd}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Paid with</span>
              <span>{paymentData.tokenAmount} {paymentData.tokenSymbol}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Date</span>
              <span>{paymentData.date}</span>
            </div>
            
            {paymentData.description && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Description</span>
                <span>{paymentData.description}</span>
              </div>
            )}
          </div>
        </motion.div>
        
        {paymentData.txHash && (
          <motion.div variants={itemVariants} className="mb-6">
            {paymentData.status === 'completed' && (
              <PaymentQRCode
                paymentAddress={paymentData.txHash}
                className="mb-4"
              />
            )}
            
            <TransactionDetails
              transaction={{
                txHash: paymentData.txHash,
                chain: paymentData.tokenSymbol.includes('DOT') ? 'polkadot' :
                       paymentData.tokenSymbol.includes('KSM') ? 'kusama' : 'solana',
                fromAddress: 'Unknown', // This would come from the actual transaction data
                toAddress: 'Unknown', // This would come from the actual transaction data
                amount: paymentData.tokenAmount,
                tokenSymbol: paymentData.tokenSymbol,
                confirmations: paymentData.status === 'completed' ? 6 : 0,
                status: paymentData.status === 'completed' ? 'confirmed' :
                        paymentData.status === 'pending' ? 'pending' : 'failed',
                timestamp: new Date(paymentData.date).getTime(),
                explorerUrl: '',
              }}
            />
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Receipt</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Button
              onClick={handleDownloadReceipt}
              fullWidth
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              }
            >
              Download Receipt
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Input
              type="email"
              placeholder="Email address for receipt"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              glassmorphism
              fullWidth
            />
            
            <Button
              onClick={handleSendEmail}
              variant="outline"
              disabled={!emailInput.includes('@') || isSendingEmail}
              glassmorphism
            >
              {isSendingEmail ? 'Sending...' : emailSent ? 'Sent!' : 'Send'}
            </Button>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex space-x-3">
          {onNewPayment && (
            <Button
              onClick={onNewPayment}
              variant="outline"
              fullWidth
              glassmorphism
            >
              New Payment
            </Button>
          )}
          
          {onClose && (
            <Button
              onClick={onClose}
              fullWidth
              glassmorphism
            >
              Close
            </Button>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
};
