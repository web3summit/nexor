import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Tabs } from '../atoms/Tabs';
import Image from 'next/image';
import { useAnalytics } from '../../hooks/useAnalytics';

export interface Wallet {
  id: string;
  name: string;
  logo: string;
  description?: string;
  chain: 'polkadot' | 'kusama' | 'solana' | 'ethereum' | 'polygon' | 'avalanche' | 'binance';
  popular?: boolean;
  installed?: boolean;
}

export interface WalletConnectorProps {
  wallets: Wallet[];
  onConnectWallet: (wallet: Wallet) => void;
  isConnecting: boolean;
  connectingWalletId?: string;
  className?: string;
  error?: string;
  onClearError?: () => void;
  preferredChains?: string[];
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  wallets,
  onConnectWallet,
  isConnecting,
  connectingWalletId,
  className = '',
  error,
  onClearError,
  preferredChains = [],
}) => {
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [recentWallets, setRecentWallets] = useState<string[]>([]);
  const { trackEvent } = useAnalytics();
  
  // Load recent wallets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexor-recent-wallets');
      if (saved) {
        setRecentWallets(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load recent wallets:', err);
    }
  }, []);
  
  const handleConnectWallet = (wallet: Wallet) => {
    // Track wallet connection attempt
    trackEvent('wallet_connect_attempt', {
      wallet_id: wallet.id,
      wallet_name: wallet.name,
      chain: wallet.chain
    });
    
    // Save to recent wallets
    const updatedRecent = [wallet.id, ...recentWallets.filter(id => id !== wallet.id)].slice(0, 3);
    try {
      localStorage.setItem('nexor-recent-wallets', JSON.stringify(updatedRecent));
      setRecentWallets(updatedRecent);
    } catch (err) {
      console.error('Failed to save recent wallet:', err);
    }
    
    // Clear any previous errors
    if (onClearError) {
      onClearError();
    }
    
    onConnectWallet(wallet);
  };

  // Filter wallets based on selected chain
  const filteredWallets = wallets.filter(wallet => 
    selectedChain === 'all' || wallet.chain === selectedChain
  );
  
  // Sort wallets: installed first, then popular, then recent, then alphabetically
  const sortedWallets = [...filteredWallets].sort((a, b) => {
    // Installed wallets first
    if (a.installed && !b.installed) return -1;
    if (!a.installed && b.installed) return 1;
    
    // Recent wallets next
    const aIsRecent = recentWallets.includes(a.id);
    const bIsRecent = recentWallets.includes(b.id);
    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;
    
    // Sort recent wallets by recency
    if (aIsRecent && bIsRecent) {
      return recentWallets.indexOf(a.id) - recentWallets.indexOf(b.id);
    }
    
    // Popular wallets next
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    
    // Alphabetical sort as fallback
    return a.name.localeCompare(b.name);
  });
  
  // Get unique chains from wallets
  const availableChains = ['all', ...new Set(wallets.map(wallet => wallet.chain))];
  
  // Prioritize preferred chains in the tabs
  const sortedChains = availableChains.sort((a, b) => {
    if (a === 'all') return -1;
    if (b === 'all') return 1;
    
    const aIsPreferred = preferredChains.includes(a);
    const bIsPreferred = preferredChains.includes(b);
    
    if (aIsPreferred && !bIsPreferred) return -1;
    if (!aIsPreferred && bIsPreferred) return 1;
    
    return 0;
  });
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium">Connect Wallet</h3>
      
      {/* Chain filter tabs */}
      <Tabs
        tabs={sortedChains.map(chain => ({
          id: chain,
          label: chain === 'all' ? 'All Chains' : chain.charAt(0).toUpperCase() + chain.slice(1),
        }))}
        activeTab={selectedChain}
        onChange={setSelectedChain}
        glassmorphism
      />
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500 bg-opacity-20 text-red-200 p-3 rounded-lg text-sm flex justify-between items-center"
          >
            <span>{error}</span>
            {onClearError && (
              <button 
                onClick={onClearError}
                className="text-red-200 hover:text-white"
                aria-label="Dismiss error"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 gap-3">
        {sortedWallets.length > 0 ? sortedWallets.map((wallet) => (
          <motion.div
            key={wallet.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className="cursor-pointer"
              padding="sm"
              hoverEffect={false}
              onClick={() => handleConnectWallet(wallet)}
              glassmorphism
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={wallet.logo}
                      alt={wallet.name}
                      fill
                      className="rounded-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{wallet.name}</h4>
                      {wallet.installed && (
                        <span className="bg-green-500 bg-opacity-20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                          Installed
                        </span>
                      )}
                      {recentWallets.includes(wallet.id) && (
                        <span className="bg-blue-500 bg-opacity-20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                          Recent
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      {wallet.description && (
                        <p className="text-sm text-gray-300">
                          {wallet.description}
                        </p>
                      )}
                      <span className="text-xs text-gray-400 capitalize">
                        {wallet.chain}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  glassmorphism
                  isLoading={isConnecting && connectingWalletId === wallet.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnectWallet(wallet);
                  }}
                >
                  Connect
                </Button>
              </div>
            </Card>
          </motion.div>
        )) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="bg-gray-800 bg-opacity-30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No wallets available</h3>
            <p className="text-gray-400 text-sm">
              {selectedChain === 'all' 
                ? 'No compatible wallets found. Try installing one of our supported wallets.'
                : `No wallets found for ${selectedChain}. Try selecting a different chain or 'All Chains'.`}
            </p>
          </motion.div>
        )}
      </div>
      
      {/* Help text */}
      <p className="text-sm text-gray-400 mt-4">
        Don't have a wallet? <a href="/docs/wallets" className="text-purple-400 hover:underline">Learn how to set one up</a>
      </p>
    </div>
  );
};
