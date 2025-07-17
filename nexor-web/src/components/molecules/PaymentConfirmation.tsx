import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentStatus, PaymentStatusType } from './PaymentStatus';
import { TransactionReceipt } from './TransactionReceipt';
import { Modal } from '../atoms/Modal';
import { useAnalytics } from '../../hooks/useAnalytics';

export interface PaymentConfirmationProps {
  status: PaymentStatusType;
  txHash?: string;
  blockExplorerUrl?: string;
  message?: string;
  confirmations?: number;
  requiredConfirmations?: number;
  fromAddress?: string;
  toAddress?: string;
  networkName?: string;
  timestamp?: Date;
  amount?: number;
  token?: string;
  usdEquivalent?: number;
  networkFee?: number;
  merchantName?: string;
  merchantLogo?: string;
  invoiceId?: string;
  paymentDescription?: string;
  className?: string;
  glassmorphism?: boolean;
  onClose?: () => void;
}

export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  status,
  txHash,
  blockExplorerUrl,
  message,
  confirmations = 0,
  requiredConfirmations = 3,
  fromAddress,
  toAddress,
  networkName = 'Unknown Network',
  timestamp = new Date(),
  amount = 0,
  token = '',
  usdEquivalent,
  networkFee,
  merchantName = 'Merchant',
  merchantLogo,
  invoiceId,
  paymentDescription,
  className = '',
  glassmorphism = true,
  onClose,
}) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const { trackEvent } = useAnalytics();

  const handleViewReceipt = () => {
    setShowReceipt(true);
    trackEvent({
      category: 'Payment',
      action: 'ViewReceipt',
      label: `${token} payment for ${amount}`,
      value: amount,
    });
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  return (
    <div className={className}>
      <PaymentStatus
        status={status}
        txHash={txHash}
        blockExplorerUrl={blockExplorerUrl}
        message={message}
        confirmations={confirmations}
        requiredConfirmations={requiredConfirmations}
        fromAddress={fromAddress}
        toAddress={toAddress}
        networkName={networkName}
        timestamp={timestamp}
        onViewReceipt={status === 'completed' ? handleViewReceipt : undefined}
        glassmorphism={glassmorphism}
      />

      <AnimatePresence>
        {showReceipt && (
          <Modal
            isOpen={showReceipt}
            onClose={handleCloseReceipt}
            className="max-w-lg"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <TransactionReceipt
                txHash={txHash || '0x0000000000000000000000000000000000000000000000000000000000000000'}
                fromAddress={fromAddress || '0x0000000000000000000000000000000000000000'}
                toAddress={toAddress || '0x0000000000000000000000000000000000000000'}
                amount={amount}
                token={token}
                usdEquivalent={usdEquivalent}
                networkFee={networkFee}
                networkName={networkName}
                timestamp={timestamp}
                merchantName={merchantName}
                merchantLogo={merchantLogo}
                invoiceId={invoiceId}
                paymentDescription={paymentDescription}
                onClose={handleCloseReceipt}
                glassmorphism={glassmorphism}
              />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};
