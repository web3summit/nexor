import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { useExchangeRates } from '../../hooks/useExchangeRates';

interface ExchangeRatesTableProps {
  className?: string;
  onTokenSelect?: (symbol: string) => void;
  selectedTokens?: string[];
}

export const ExchangeRatesTable: React.FC<ExchangeRatesTableProps> = ({
  className = '',
  onTokenSelect,
  selectedTokens = [],
}) => {
  const { rates, loading, refreshRates } = useExchangeRates();
  const [sortBy, setSortBy] = useState<'symbol' | 'name' | 'price' | 'change'>('price');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle sort click
  const handleSortClick = (column: 'symbol' | 'name' | 'price' | 'change') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort rates
  const filteredAndSortedRates = [...rates]
    .filter(rate => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        rate.symbol.toLowerCase().includes(term) ||
        rate.name.toLowerCase().includes(term) ||
        rate.network.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.usdPrice - b.usdPrice;
          break;
        case 'change':
          comparison = (a.change24h || 0) - (b.change24h || 0);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  
  return (
    <Card className={`p-6 ${className}`} glassmorphism>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Exchange Rates</h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded-lg px-4 py-2.5 pl-10 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          
          <Button
            variant="ghost"
            onClick={refreshRates}
            disabled={loading}
            aria-label="Refresh"
            title="Refresh rates"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </Button>
        </div>
      </div>
      
      {loading && filteredAndSortedRates.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredAndSortedRates.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400">No tokens found</p>
          {searchTerm && (
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {onTokenSelect && (
                  <th className="text-left py-3 px-4 w-10"></th>
                )}
                <th 
                  className="text-left py-3 px-4 cursor-pointer hover:text-primary"
                  onClick={() => handleSortClick('symbol')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Symbol</span>
                    {sortBy === 'symbol' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 cursor-pointer hover:text-primary"
                  onClick={() => handleSortClick('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortBy === 'name' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4">Network</th>
                <th 
                  className="text-right py-3 px-4 cursor-pointer hover:text-primary"
                  onClick={() => handleSortClick('price')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Price (USD)</span>
                    {sortBy === 'price' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right py-3 px-4 cursor-pointer hover:text-primary"
                  onClick={() => handleSortClick('change')}
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>24h Change</span>
                    {sortBy === 'change' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        {sortDirection === 'asc' ? (
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        ) : (
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        )}
                      </svg>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedRates.map((rate, index) => (
                <motion.tr
                  key={rate.symbol}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-gray-700 hover:bg-white/5 ${onTokenSelect ? 'cursor-pointer' : ''}`}
                  onClick={() => onTokenSelect && onTokenSelect(rate.symbol)}
                >
                  {onTokenSelect && (
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <input
                          type="checkbox"
                          checked={selectedTokens.includes(rate.symbol)}
                          onChange={() => onTokenSelect(rate.symbol)}
                          className="rounded-sm bg-transparent border-gray-500 text-primary focus:ring-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {rate.logoUrl ? (
                        <img src={rate.logoUrl} alt={rate.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center">
                          {rate.symbol.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{rate.symbol}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{rate.name}</td>
                  <td className="py-3 px-4">{rate.network}</td>
                  <td className="py-3 px-4 text-right font-medium">
                    ${rate.usdPrice < 0.01 ? rate.usdPrice.toFixed(6) : rate.usdPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={rate.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {rate.change24h >= 0 ? '+' : ''}{rate.change24h?.toFixed(2)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {onTokenSelect && selectedTokens.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedTokens.length} token{selectedTokens.length !== 1 ? 's' : ''} selected
          </div>
          <Button
            variant="outline"
            onClick={() => onTokenSelect && selectedTokens.forEach(token => onTokenSelect(token))}
            size="sm"
            glassmorphism
          >
            Clear Selection
          </Button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-400 text-right">
        Last updated: {new Date().toLocaleString()}
      </div>
    </Card>
  );
};
