import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { TokenSelector, Token } from '../molecules/TokenSelector';
import { PaymentSummary } from '../molecules/PaymentSummary';
import { WalletConnector, Wallet } from '../molecules/WalletConnector';

export interface PaymentFormProps {
  merchantName: string;
  merchantLogo?: string;
  amount?: string;
  currency?: string;
  description?: string;
  supportedTokens: Token[];
  supportedWallets: Wallet[];
  onSubmit: (paymentData: PaymentFormData) => void;
  className?: string;
}

export interface PaymentFormData {
  amount: string;
  token: Token;
  wallet: Wallet;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  merchantName,
  merchantLogo,
  amount: initialAmount = '',
  currency = 'USD',
  description,
  supportedTokens,
  supportedWallets,
  onSubmit,
  className = '',
}) => {
  const [currentStep, setCurrentStep] = useState<'amount' | 'wallet' | 'summary'>('amount');
  const [amount, setAmount] = useState(initialAmount);
  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    supportedTokens.length > 0 ? supportedTokens[0] : undefined
  );
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletId, setConnectingWalletId] = useState<string | undefined>();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setAmount(value);
  };

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
  };

  const handleConnectWallet = async (wallet: Wallet) => {
    setIsConnecting(true);
    setConnectingWalletId(wallet.id);
    
    try {
      // Here we would implement the actual wallet connection logic
      // For now, we'll just simulate a connection after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setSelectedWallet(wallet);
      setCurrentStep('summary');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
      setConnectingWalletId(undefined);
    }
  };

  const handleSubmit = () => {
    if (!selectedToken || !selectedWallet || !amount) return;
    
    onSubmit({
      amount,
      token: selectedToken,
      wallet: selectedWallet,
    });
  };

  const handleContinueToWallet = () => {
    if (!amount || !selectedToken) return;
    setCurrentStep('wallet');
  };

  const handleBack = () => {
    if (currentStep === 'wallet') {
      setCurrentStep('amount');
    } else if (currentStep === 'summary') {
      setCurrentStep('wallet');
    }
  };

  return (
    <Card className={`max-w-md w-full mx-auto ${className}`} glassmorphism>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {merchantLogo && (
            <img src={merchantLogo} alt={merchantName} className="w-8 h-8 rounded-full" />
          )}
          <h2 className="text-lg font-semibold">{merchantName}</h2>
        </div>
        {currentStep !== 'amount' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back
          </Button>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      )}

      {/* Step 1: Amount and Token Selection */}
      {currentStep === 'amount' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                fullWidth
                glassmorphism
                className="text-xl font-medium"
              />
              <TokenSelector
                tokens={supportedTokens}
                selectedToken={selectedToken}
                onSelectToken={handleTokenSelect}
              />
            </div>
            
            {amount && selectedToken && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {/* This would be calculated based on real exchange rates */}
                ≈ ${parseFloat(amount) * 10} {currency}
              </div>
            )}
            
            <Button
              variant="primary"
              fullWidth
              glassmorphism
              disabled={!amount || parseFloat(amount) <= 0 || !selectedToken}
              onClick={handleContinueToWallet}
            >
              Continue to Payment
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Wallet Selection */}
      {currentStep === 'wallet' && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <WalletConnector
            wallets={supportedWallets.filter(wallet => wallet.chain === selectedToken?.chain)}
            onConnectWallet={handleConnectWallet}
            isConnecting={isConnecting}
            connectingWalletId={connectingWalletId}
          />
        </motion.div>
      )}

      {/* Step 3: Payment Summary */}
      {currentStep === 'summary' && selectedToken && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6">
            <PaymentSummary
              details={{
                amount,
                sourceToken: selectedToken.symbol,
                destinationToken: selectedToken.symbol,
                sourceChain: selectedToken.chain,
                destinationChain: selectedToken.chain,
                networkFee: '0.01 ' + selectedToken.symbol,
                estimatedTime: '< 1 minute',
                totalAmount: (parseFloat(amount) + 0.01).toString(),
              }}
            />
            
            <Button
              variant="primary"
              fullWidth
              glassmorphism
              onClick={handleSubmit}
            >
              Confirm Payment
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  );
};
