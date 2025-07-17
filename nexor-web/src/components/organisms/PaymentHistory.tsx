import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { TransactionDetails } from '../molecules/TransactionDetails';

export interface Payment {
  id: string;
  merchantId: string;
  amount: string;
  amountUsd: string;
  tokenSymbol: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  updatedAt: string;
  invoiceId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface PaymentHistoryProps {
  payments: Payment[];
  loading?: boolean;
  onViewDetails?: (payment: Payment) => void;
  onRefresh?: () => void;
  className?: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  loading = false,
  onViewDetails,
  onRefresh,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Filter payments based on search term and status filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get status badge color
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'processing':
        return 'bg-blue-500 bg-opacity-20 text-blue-300';
      case 'completed':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'failed':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };
  
  return (
    <Card className={`p-6 ${className}`} glassmorphism>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Payment History</h2>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            glassmorphism
            className="w-full sm:w-64"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            }
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          
          {onRefresh && (
            <Button
              variant="ghost"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Refresh"
              title="Refresh payments"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </Button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400">No payments found</p>
          {searchTerm || statusFilter !== 'all' ? (
            <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 hover:bg-white/5 transition-colors cursor-pointer" glassmorphism onClick={() => onViewDetails?.(payment)}>
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{payment.tokenSymbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-400 mt-1">
                      ID: {payment.id.substring(0, 8)}...
                    </div>
                    
                    {payment.txHash && (
                      <div className="text-sm font-mono text-gray-400 mt-1">
                        Tx: {payment.txHash.substring(0, 8)}...{payment.txHash.substring(payment.txHash.length - 8)}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${payment.amountUsd}</div>
                    <div className="text-sm">{payment.amount} {payment.tokenSymbol}</div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(payment.createdAt)}</div>
                  </div>
                </div>
                
                {payment.description && (
                  <div className="mt-3 text-sm text-gray-300 border-t border-gray-700 pt-2">
                    {payment.description}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {filteredPayments.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" glassmorphism>
            Load More
          </Button>
        </div>
      )}
    </Card>
  );
};
