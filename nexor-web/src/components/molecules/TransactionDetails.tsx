import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { TransactionDetails as TxDetails } from '../../utils/transactionMonitor';

interface TransactionDetailsProps {
  transaction: TxDetails;
  onViewExplorer?: () => void;
  compact?: boolean;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
  transaction,
  onViewExplorer,
  compact = false,
}) => {
  const {
    txHash,
    chain,
    fromAddress,
    toAddress,
    amount,
    tokenSymbol,
    blockNumber,
    confirmations,
    status,
    timestamp,
    explorerUrl,
  } = transaction;
  
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'processing':
        return 'bg-blue-500 bg-opacity-20 text-blue-300';
      case 'confirmed':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'failed':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };
  
  const getChainIcon = () => {
    switch (chain) {
      case 'polkadot':
        return '/images/polkadot-logo.svg';
      case 'kusama':
        return '/images/kusama-logo.svg';
      case 'solana':
        return '/images/solana-logo.svg';
      default:
        return '/images/blockchain-icon.svg';
    }
  };
  
  const handleViewExplorer = () => {
    if (onViewExplorer) {
      onViewExplorer();
    } else if (explorerUrl) {
      window.open(explorerUrl, '_blank');
    }
  };
  
  if (compact) {
    return (
      <Card className="p-4" glassmorphism>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={getChainIcon()} alt={chain} className="w-6 h-6" />
            <div>
              <div className="font-mono text-sm truncate max-w-[150px]">
                {formatAddress(txHash)}
              </div>
              <div className="text-xs text-gray-400">
                {amount} {tokenSymbol}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            
            <Button variant="ghost" size="sm" onClick={handleViewExplorer}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6" glassmorphism>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img src={getChainIcon()} alt={chain} className="w-8 h-8" />
          <div>
            <h3 className="text-lg font-semibold">Transaction Details</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
        
        {confirmations > 0 && (
          <motion.div 
            className="flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm text-gray-300">Confirmations:</span>
            <span className="text-sm font-medium">{confirmations}</span>
          </motion.div>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-800 bg-opacity-30 p-4 rounded-lg space-y-3">
          <div>
            <div className="text-sm text-gray-400">Transaction Hash</div>
            <div className="font-mono text-sm break-all">{txHash}</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">From</div>
              <div className="font-mono text-sm truncate">{formatAddress(fromAddress)}</div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">To</div>
              <div className="font-mono text-sm truncate">{formatAddress(toAddress)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Amount</div>
              <div className="text-sm">
                {amount} {tokenSymbol}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Timestamp</div>
              <div className="text-sm">{formatDate(timestamp)}</div>
            </div>
          </div>
          
          {blockNumber && (
            <div>
              <div className="text-sm text-gray-400">Block Number</div>
              <div className="text-sm">{blockNumber.toLocaleString()}</div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleViewExplorer} glassmorphism>
            View in Explorer
          </Button>
        </div>
      </div>
    </Card>
  );
};
