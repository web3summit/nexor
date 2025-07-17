import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_INVOICE, UPDATE_INVOICE_STATUS } from '../graphql/mutations';
import { INVOICES_BY_MERCHANT } from '../graphql/queries';

export interface Invoice {
  id: string;
  merchantId: string;
  amount: string;
  amountUsd: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  payments?: Array<{
    id: string;
    amount: string;
    tokenSymbol: string;
    status: string;
    txHash?: string;
    createdAt: string;
  }>;
}

export interface CreateInvoiceInput {
  merchantId: string;
  amount: string;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface UseInvoiceManagementResult {
  invoices: Invoice[];
  loading: boolean;
  error: Error | null;
  createInvoice: (input: CreateInvoiceInput) => Promise<Invoice | null>;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => Promise<Invoice | null>;
  cancelInvoice: (id: string) => Promise<Invoice | null>;
  refreshInvoices: () => Promise<void>;
}

export function useInvoiceManagement(merchantId: string): UseInvoiceManagementResult {
  const [error, setError] = useState<Error | null>(null);

  // Query for fetching invoices
  const {
    data,
    loading,
    refetch,
  } = useQuery(INVOICES_BY_MERCHANT, {
    variables: { merchantId },
    fetchPolicy: 'network-only',
    onError: (err) => {
      setError(err);
      console.error('Error fetching invoices:', err);
    },
  });

  // Mutation for creating an invoice
  const [createInvoiceMutation] = useMutation(CREATE_INVOICE, {
    refetchQueries: [{ query: INVOICES_BY_MERCHANT, variables: { merchantId } }],
    onError: (err) => {
      setError(err);
      console.error('Error creating invoice:', err);
    },
  });

  // Mutation for updating invoice status
  const [updateInvoiceStatusMutation] = useMutation(UPDATE_INVOICE_STATUS, {
    refetchQueries: [{ query: INVOICES_BY_MERCHANT, variables: { merchantId } }],
    onError: (err) => {
      setError(err);
      console.error('Error updating invoice status:', err);
    },
  });

  // Create a new invoice
  const createInvoice = useCallback(
    async (input: CreateInvoiceInput): Promise<Invoice | null> => {
      try {
        const { data } = await createInvoiceMutation({
          variables: { ...input },
        });
        return data.createInvoice;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [createInvoiceMutation]
  );

  // Update invoice status
  const updateInvoiceStatus = useCallback(
    async (id: string, status: Invoice['status']): Promise<Invoice | null> => {
      try {
        const { data } = await updateInvoiceStatusMutation({
          variables: { id, status },
        });
        return data.updateInvoiceStatus;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [updateInvoiceStatusMutation]
  );

  // Cancel an invoice
  const cancelInvoice = useCallback(
    async (id: string): Promise<Invoice | null> => {
      return updateInvoiceStatus(id, 'CANCELED');
    },
    [updateInvoiceStatus]
  );

  // Refresh invoices
  const refreshInvoices = useCallback(async (): Promise<void> => {
    try {
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [refetch]);

  // Mock implementation for development
  const mockInvoices: Invoice[] = [
    {
      id: 'inv_123456',
      merchantId: merchantId,
      amount: '500.00',
      amountUsd: '500.00',
      currency: 'USD',
      description: 'Website development services',
      status: 'PAID',
      createdAt: '2025-07-16T14:30:00Z',
      updatedAt: '2025-07-16T15:30:00Z',
      expiresAt: '2025-08-16T14:30:00Z',
      payments: [
        {
          id: 'pay_123456',
          amount: '100',
          tokenSymbol: 'DOT',
          status: 'COMPLETED',
          txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          createdAt: '2025-07-16T15:30:00Z',
        },
      ],
    },
    {
      id: 'inv_123457',
      merchantId: merchantId,
      amount: '1200.00',
      amountUsd: '1200.00',
      currency: 'USD',
      description: 'Monthly subscription',
      status: 'PENDING',
      createdAt: '2025-07-15T10:15:00Z',
      updatedAt: '2025-07-15T10:15:00Z',
      expiresAt: '2025-08-15T10:15:00Z',
    },
    {
      id: 'inv_123458',
      merchantId: merchantId,
      amount: '750.00',
      amountUsd: '750.00',
      currency: 'USD',
      description: 'Consulting services',
      status: 'PAID',
      createdAt: '2025-07-14T08:45:00Z',
      updatedAt: '2025-07-14T09:45:00Z',
      expiresAt: '2025-08-14T08:45:00Z',
      payments: [
        {
          id: 'pay_123458',
          amount: '1000',
          tokenSymbol: 'USDT',
          status: 'COMPLETED',
          txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
          createdAt: '2025-07-14T09:45:00Z',
        },
      ],
    },
    {
      id: 'inv_123459',
      merchantId: merchantId,
      amount: '300.00',
      amountUsd: '300.00',
      currency: 'USD',
      description: 'Product purchase',
      status: 'EXPIRED',
      createdAt: '2025-07-13T16:20:00Z',
      updatedAt: '2025-07-20T16:20:00Z',
      expiresAt: '2025-07-20T16:20:00Z',
    },
    {
      id: 'inv_123460',
      merchantId: merchantId,
      amount: '1500.00',
      amountUsd: '1500.00',
      currency: 'USD',
      description: 'Annual license fee',
      status: 'CANCELED',
      createdAt: '2025-07-12T09:10:00Z',
      updatedAt: '2025-07-12T10:10:00Z',
      expiresAt: '2025-08-12T09:10:00Z',
    },
  ];

  // Use mock data for now, replace with real data when backend is ready
  const invoices = data?.invoicesByMerchant || mockInvoices;

  return {
    invoices,
    loading,
    error,
    createInvoice,
    updateInvoiceStatus,
    cancelInvoice,
    refreshInvoices,
  };
}
