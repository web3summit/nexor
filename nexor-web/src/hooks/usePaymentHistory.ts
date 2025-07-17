import { useState, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { PAYMENTS_BY_MERCHANT } from '../graphql/queries';
import { Payment } from '../components/organisms/PaymentHistory';

export interface PaymentFilters {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'all';
  startDate?: Date;
  endDate?: Date;
  search?: string;
  tokenSymbol?: string;
  limit?: number;
  offset?: number;
}

export interface UsePaymentHistoryResult {
  payments: Payment[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  refreshPayments: () => Promise<void>;
  currentFilters: PaymentFilters;
}

export function usePaymentHistory(merchantId: string): UsePaymentHistoryResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentFilters, setCurrentFilters] = useState<PaymentFilters>({
    status: 'all',
    limit: 10,
    offset: 0,
  });
  const [error, setError] = useState<Error | null>(null);

  // GraphQL query for fetching payments
  const [fetchPaymentsQuery, { loading }] = useLazyQuery(PAYMENTS_BY_MERCHANT, {
    onCompleted: (data) => {
      if (data?.paymentsByMerchant) {
        setPayments(data.paymentsByMerchant.payments);
        setTotalCount(data.paymentsByMerchant.totalCount);
      }
    },
    onError: (err) => {
      setError(err);
      console.error('Error fetching payments:', err);
    },
    fetchPolicy: 'network-only',
  });

  // Fetch payments with filters
  const fetchPayments = useCallback(
    async (filters?: PaymentFilters) => {
      try {
        const updatedFilters = { ...currentFilters, ...filters };
        setCurrentFilters(updatedFilters);

        // In a real implementation, we would call the GraphQL query
        // For now, we'll use mock data
        
        // Mock implementation for development
        const mockPayments = generateMockPayments(merchantId, updatedFilters);
        setPayments(mockPayments);
        setTotalCount(mockPayments.length + 15); // Simulate more available

        // This would be the real GraphQL call
        /*
        await fetchPaymentsQuery({
          variables: {
            merchantId,
            status: updatedFilters.status === 'all' ? undefined : updatedFilters.status,
            startDate: updatedFilters.startDate?.toISOString(),
            endDate: updatedFilters.endDate?.toISOString(),
            search: updatedFilters.search,
            tokenSymbol: updatedFilters.tokenSymbol,
            limit: updatedFilters.limit,
            offset: updatedFilters.offset,
          },
        });
        */
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [currentFilters, merchantId]
  );

  // Refresh payments with current filters
  const refreshPayments = useCallback(async () => {
    await fetchPayments(currentFilters);
  }, [fetchPayments, currentFilters]);

  return {
    payments,
    loading,
    error,
    totalCount,
    fetchPayments,
    refreshPayments,
    currentFilters,
  };
}

// Helper function to generate mock payments for development
function generateMockPayments(merchantId: string, filters: PaymentFilters): Payment[] {
  const tokens = ['DOT', 'KSM', 'SOL', 'USDT', 'USDC'];
  const statuses: Array<Payment['status']> = ['pending', 'processing', 'completed', 'failed'];
  
  // Apply status filter
  const filteredStatuses = filters.status === 'all' ? statuses : [filters.status as Payment['status']];
  
  // Apply token filter
  const filteredTokens = filters.tokenSymbol ? [filters.tokenSymbol] : tokens;
  
  // Generate random payments
  const mockPayments: Payment[] = Array.from({ length: filters.limit || 10 }, (_, i) => {
    const id = `pay_${Math.random().toString(36).substring(2, 10)}`;
    const tokenSymbol = filteredTokens[Math.floor(Math.random() * filteredTokens.length)];
    const status = filteredStatuses[Math.floor(Math.random() * filteredStatuses.length)];
    const amount = (Math.random() * 1000).toFixed(2);
    const amountUsd = (parseFloat(amount) * getTokenPrice(tokenSymbol)).toFixed(2);
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    const updatedAt = new Date(Date.parse(createdAt) + Math.random() * 24 * 60 * 60 * 1000).toISOString();
    
    return {
      id,
      merchantId,
      amount,
      amountUsd,
      tokenSymbol,
      status,
      txHash: status !== 'pending' ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` : undefined,
      createdAt,
      updatedAt,
      invoiceId: Math.random() > 0.5 ? `inv_${Math.random().toString(36).substring(2, 10)}` : undefined,
      customerEmail: Math.random() > 0.7 ? `customer${Math.floor(Math.random() * 100)}@example.com` : undefined,
      description: getRandomDescription(),
      metadata: Math.random() > 0.5 ? { orderId: `ord_${Math.random().toString(36).substring(2, 10)}` } : undefined,
    };
  });
  
  // Apply search filter if provided
  if (filters.search) {
    const search = filters.search.toLowerCase();
    return mockPayments.filter(payment => 
      payment.id.toLowerCase().includes(search) ||
      payment.txHash?.toLowerCase().includes(search) ||
      payment.tokenSymbol.toLowerCase().includes(search) ||
      payment.description?.toLowerCase().includes(search) ||
      payment.customerEmail?.toLowerCase().includes(search)
    );
  }
  
  return mockPayments;
}

// Helper function to get token price
function getTokenPrice(symbol: string): number {
  const prices: Record<string, number> = {
    'DOT': 5.23,
    'KSM': 21.87,
    'SOL': 42.15,
    'USDT': 1.0,
    'USDC': 1.0,
    'GLMR': 0.18,
    'ASTR': 0.043,
    'ACA': 0.075,
  };
  
  return prices[symbol] || 1.0;
}

// Helper function to get random description
function getRandomDescription(): string {
  const descriptions = [
    'Monthly subscription',
    'Product purchase',
    'Service fee',
    'Donation',
    'Premium membership',
    'One-time payment',
    'Invoice payment',
    'Consulting fee',
    'Software license',
    'Membership renewal',
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}
