import { useState, useEffect } from 'react';

export interface TokenPrice {
  symbol: string;
  name: string;
  priceUsd: number;
  percentChange24h?: number;
  lastUpdated: string;
}

export interface UseTokenPricesOptions {
  symbols: string[];
  refreshInterval?: number; // in milliseconds
  onError?: (error: Error) => void;
}

export function useTokenPrices({
  symbols,
  refreshInterval = 60000, // default: refresh every minute
  onError,
}: UseTokenPricesOptions) {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const fetchPrices = async () => {
      if (!symbols.length) return;
      
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch from our GraphQL API
        // For now, we'll use mock data
        const mockPrices: Record<string, TokenPrice> = {};
        
        // Generate mock prices for each symbol
        symbols.forEach(symbol => {
          const basePrice = {
            DOT: 5.23,
            KSM: 21.45,
            USDC: 1.00,
            USDT: 1.00,
            SOL: 43.78,
          }[symbol] || Math.random() * 100;
          
          // Add some randomness to simulate price changes
          const randomFactor = 0.995 + Math.random() * 0.01; // ±0.5%
          
          mockPrices[symbol] = {
            symbol,
            name: {
              DOT: 'Polkadot',
              KSM: 'Kusama',
              USDC: 'USD Coin',
              USDT: 'Tether',
              SOL: 'Solana',
            }[symbol] || symbol,
            priceUsd: basePrice * randomFactor,
            percentChange24h: (Math.random() * 10) - 5, // -5% to +5%
            lastUpdated: new Date().toISOString(),
          };
        });
        
        if (isMounted) {
          setPrices(mockPrices);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch token prices:', err);
        
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch token prices'));
          if (onError) onError(err instanceof Error ? err : new Error('Failed to fetch token prices'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Fetch prices immediately
    fetchPrices();
    
    // Set up interval for refreshing prices
    if (refreshInterval > 0) {
      intervalId = setInterval(fetchPrices, refreshInterval);
    }
    
    // Clean up
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [symbols, refreshInterval, onError]);

  // Helper function to get price for a specific token
  const getPrice = (symbol: string): TokenPrice | undefined => {
    return prices[symbol];
  };

  // Helper function to convert amount from one token to another
  const convertAmount = (amount: number, fromSymbol: string, toSymbol: string): number | undefined => {
    const fromPrice = prices[fromSymbol]?.priceUsd;
    const toPrice = prices[toSymbol]?.priceUsd;
    
    if (!fromPrice || !toPrice) return undefined;
    
    return (amount * fromPrice) / toPrice;
  };

  // Helper function to convert token amount to USD
  const toUsd = (amount: number, symbol: string): number | undefined => {
    const price = prices[symbol]?.priceUsd;
    return price ? amount * price : undefined;
  };

  // Helper function to convert USD amount to token
  const fromUsd = (usdAmount: number, symbol: string): number | undefined => {
    const price = prices[symbol]?.priceUsd;
    return price ? usdAmount / price : undefined;
  };

  return {
    prices,
    loading,
    error,
    getPrice,
    convertAmount,
    toUsd,
    fromUsd,
  };
}
