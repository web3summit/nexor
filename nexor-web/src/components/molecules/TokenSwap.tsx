import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { TokenSelector } from './TokenSelector';
import { useTokenSwap } from '../../hooks/useTokenSwap';
import { TokenInfo } from '../../types/tokens';
import { formatBalance } from '../../utils/blockchain';
import { getTokenInfo } from '../../utils/tokens';

interface TokenSwapProps {
  onSwapComplete?: (txHash: string) => void;
  onCancel?: () => void;
  defaultFromToken?: string;
  defaultToToken?: string;
  fromAddress?: string;
  toAddress?: string;
}

export const TokenSwap: React.FC<TokenSwapProps> = ({
  onSwapComplete,
  onCancel,
  defaultFromToken = 'DOT',
  defaultToToken = 'USDT',
  fromAddress,
  toAddress,
}) => {
  const [fromToken, setFromToken] = useState(defaultFromToken);
  const [toToken, setToToken] = useState(defaultToToken);
  const [amount, setAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  
  const {
    isLoading,
    isSwapping,
    error,
    quote,
    getQuote,
    executeTokenSwap,
    resetState,
  } = useTokenSwap();
  
  // Get token info
  const fromTokenInfo = getTokenInfo(fromToken);
  const toTokenInfo = getTokenInfo(toToken);
  
  // Update quote when inputs change
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (amount && parseFloat(amount) > 0 && fromToken && toToken && fromAddress && toAddress) {
        getQuote({
          fromToken,
          toToken,
          amount,
          slippage,
          fromAddress,
          toAddress,
        });
      }
    }, 500);
    
    return () => clearTimeout(debounceTimeout);
  }, [fromToken, toToken, amount, slippage, fromAddress, toAddress, getQuote]);
  
  // Handle swap tokens
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    resetState();
  };
  
  // Handle execute swap
  const handleExecuteSwap = async () => {
    if (!quote) return;
    
    try {
      const result = await executeTokenSwap(quote);
      
      if (result.success && result.txHash && onSwapComplete) {
        onSwapComplete(result.txHash);
      }
    } catch (err) {
      console.error('Swap execution failed:', err);
    }
  };
  
  // Handle slippage change
  const handleSlippageChange = (value: number) => {
    setSlippage(value);
  };
  
  // Format balance with proper decimals
  const formatTokenBalance = (balance: string, decimals: number): string => {
    return formatBalance(balance, decimals);
  };
  
  return (
    <Card className="p-6" glassmorphism>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Swap Tokens</h2>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      <div className="space-y-6">
        {/* From Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">From</label>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                glassmorphism
                fullWidth
              />
            </div>
            <div className="w-1/3">
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={(token) => {
                  setFromToken(token);
                  resetState();
                }}
                excludeTokens={[toToken]}
              />
            </div>
          </div>
          {fromTokenInfo && (
            <div className="text-sm text-gray-400">
              Balance: {formatTokenBalance('10.5', fromTokenInfo?.decimals || 18)} {fromToken}
            </div>
          )}
        </div>
        
        {/* Swap Direction Button */}
        <div className="flex justify-center">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 bg-opacity-30 p-2 rounded-full cursor-pointer"
            onClick={handleSwapTokens}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        </div>
        
        {/* To Token */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">To</label>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                type="number"
                value={quote?.outputAmount || '0.0'}
                readOnly
                placeholder="0.0"
                glassmorphism
                fullWidth
              />
            </div>
            <div className="w-1/3">
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={(token) => {
                  setToToken(token);
                  resetState();
                }}
                excludeTokens={[fromToken]}
              />
            </div>
          </div>
          {toTokenInfo && (
            <div className="text-sm text-gray-400">
              Balance: {formatTokenBalance('5.25', toTokenInfo?.decimals || 18)} {toToken}
            </div>
          )}
        </div>
        
        {/* Quote Details */}
        {quote && (
          <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Rate</span>
              <span className="text-sm">
                1 {fromToken} = {quote.exchangeRate.toFixed(6)} {toToken}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Fee</span>
              <span className="text-sm">{quote.fee} {fromToken}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Slippage</span>
              <span className="text-sm">{quote.slippage}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Estimated Time</span>
              <span className="text-sm">
                {Math.floor(quote.estimatedTime / 60) > 0
                  ? `${Math.floor(quote.estimatedTime / 60)}m ${quote.estimatedTime % 60}s`
                  : `${quote.estimatedTime}s`}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm text-gray-300">Provider</span>
              <span className="text-sm">{quote.provider}</span>
            </div>
          </div>
        )}
        
        {/* Slippage Settings */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Slippage Tolerance</label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1.0, 2.0].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={slippage === value ? 'primary' : 'outline'}
                onClick={() => handleSlippageChange(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm p-2 bg-red-900 bg-opacity-20 rounded-lg">
            {error.message}
          </div>
        )}
        
        {/* Action Button */}
        <Button
          variant="primary"
          fullWidth
          glassmorphism
          isLoading={isLoading || isSwapping}
          disabled={!quote || isLoading || isSwapping || !amount || parseFloat(amount) <= 0}
          onClick={handleExecuteSwap}
        >
          {isSwapping ? 'Swapping...' : 'Swap Tokens'}
        </Button>
      </div>
    </Card>
  );
};
