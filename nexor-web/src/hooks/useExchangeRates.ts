import { useState, useEffect, useCallback } from 'react';

export interface ExchangeRate {
  symbol: string;
  usdPrice: number;
  lastUpdated: number;
}

export interface UseExchangeRatesResult {
  rates: Record<string, ExchangeRate>;
  loading: boolean;
  error: Error | null;
  getUsdValue: (amount: string | number, symbol: string) => number;
  getTokenAmount: (usdAmount: string | number, symbol: string) => number;
  refreshRates: () => Promise<void>;
}

export function useExchangeRates(): UseExchangeRatesResult {
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Mock exchange rates for development
  const mockRates: Record<string, ExchangeRate> = {
    'DOT': {
      symbol: 'DOT',
      usdPrice: 5.23,
      lastUpdated: Date.now(),
    },
    'KSM': {
      symbol: 'KSM',
      usdPrice: 21.87,
      lastUpdated: Date.now(),
    },
    'SOL': {
      symbol: 'SOL',
      usdPrice: 42.15,
      lastUpdated: Date.now(),
    },
    'USDT': {
      symbol: 'USDT',
      usdPrice: 1.0,
      lastUpdated: Date.now(),
    },
    'USDC': {
      symbol: 'USDC',
      usdPrice: 1.0,
      lastUpdated: Date.now(),
    },
    'GLMR': {
      symbol: 'GLMR',
      usdPrice: 0.18,
      lastUpdated: Date.now(),
    },
    'ASTR': {
      symbol: 'ASTR',
      usdPrice: 0.043,
      lastUpdated: Date.now(),
    },
    'ACA': {
      symbol: 'ACA',
      usdPrice: 0.075,
      lastUpdated: Date.now(),
    },
  };
  
  // Fetch exchange rates
  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would call an API like CoinGecko
      // For now, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add some random variation to prices to simulate market movement
      const updatedRates = { ...mockRates };
      Object.keys(updatedRates).forEach(symbol => {
        const variation = (Math.random() * 0.02) - 0.01; // -1% to +1%
        updatedRates[symbol] = {
          ...updatedRates[symbol],
          usdPrice: updatedRates[symbol].usdPrice * (1 + variation),
          lastUpdated: Date.now(),
        };
      });
      
      setRates(updatedRates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error('Failed to fetch exchange rates:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchRates();
    
    // Refresh rates every 60 seconds
    const intervalId = setInterval(fetchRates, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchRates]);
  
  // Convert token amount to USD
  const getUsdValue = useCallback((amount: string | number, symbol: string): number => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) {
      return 0;
    }
    
    const rate = rates[symbol];
    if (!rate) {
      return 0;
    }
    
    return numericAmount * rate.usdPrice;
  }, [rates]);
  
  // Convert USD amount to token amount
  const getTokenAmount = useCallback((usdAmount: string | number, symbol: string): number => {
    const numericAmount = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
    
    if (isNaN(numericAmount)) {
      return 0;
    }
    
    const rate = rates[symbol];
    if (!rate || rate.usdPrice === 0) {
      return 0;
    }
    
    return numericAmount / rate.usdPrice;
  }, [rates]);
  
  return {
    rates,
    loading,
    error,
    getUsdValue,
    getTokenAmount,
    refreshRates: fetchRates,
  };
}
