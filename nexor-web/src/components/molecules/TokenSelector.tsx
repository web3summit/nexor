import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import Image from 'next/image';

export interface Token {
  symbol: string;
  name: string;
  logo: string;
  chain: string;
  balance?: string;
}

export interface TokenSelectorProps {
  tokens: Token[];
  selectedToken?: Token;
  onSelectToken: (token: Token) => void;
  className?: string;
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
  tokens,
  selectedToken,
  onSelectToken,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {selectedToken ? (
          <>
            <div className="relative w-6 h-6">
              <Image
                src={selectedToken.logo}
                alt={selectedToken.symbol}
                fill
                className="rounded-full"
              />
            </div>
            <span className="font-medium">{selectedToken.symbol}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        ) : (
          <>
            <span>Select Token</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute z-10 mt-2 w-60 right-0"
        >
          <Card className="max-h-60 overflow-y-auto" padding="sm">
            <div className="mb-2 px-2">
              <h3 className="text-sm font-medium">Select Token</h3>
            </div>
            <div className="space-y-1">
              {tokens.map((token) => (
                <button
                  key={`${token.chain}-${token.symbol}`}
                  type="button"
                  onClick={() => handleSelectToken(token)}
                  className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                    selectedToken?.symbol === token.symbol ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src={token.logo}
                        alt={token.symbol}
                        fill
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{token.symbol}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{token.name}</span>
                    </div>
                  </div>
                  {token.balance && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {token.balance}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
