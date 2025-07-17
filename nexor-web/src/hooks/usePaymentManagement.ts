import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { CREATE_PAYMENT, UPDATE_PAYMENT_STATUS } from '../graphql/mutations';
import { PAYMENT_BY_ID, PAYMENTS_BY_INVOICE_ID } from '../graphql/queries';

export interface PaymentToken {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  chainId: string;
  chainName: string;
  logoUrl?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  merchantId: string;
  amount: string;
  amountUsd: string;
  tokenSymbol: string;
  tokenAddress?: string;
  chainId: string;
  chainName: string;
  fromAddress?: string;
  toAddress: string;
  txHash?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface CreatePaymentInput {
  invoiceId: string;
  merchantId: string;
  amount: string;
  tokenSymbol: string;
  tokenAddress?: string;
  chainId: string;
  toAddress: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentStatusInput {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  txHash?: string;
  fromAddress?: string;
  metadata?: Record<string, any>;
}

export interface UsePaymentResult {
  payment: Payment | null;
  loading: boolean;
  error: Error | null;
}

export interface UsePaymentsResult {
  payments: Payment[];
  loading: boolean;
  error: Error | null;
}

export interface UsePaymentManagementResult {
  createPayment: (input: CreatePaymentInput) => Promise<Payment | null>;
  updatePaymentStatus: (input: UpdatePaymentStatusInput) => Promise<Payment | null>;
  usePayment: (paymentId: string) => UsePaymentResult;
  usePaymentsByInvoice: (invoiceId: string) => UsePaymentsResult;
}

export function usePaymentManagement(): UsePaymentManagementResult {
  const [error, setError] = useState<Error | null>(null);

  // Mutation for creating a payment
  const [createPaymentMutation] = useMutation(CREATE_PAYMENT, {
    onError: (err) => {
      setError(err);
      console.error('Error creating payment:', err);
    },
  });

  // Mutation for updating payment status
  const [updatePaymentStatusMutation] = useMutation(UPDATE_PAYMENT_STATUS, {
    onError: (err) => {
      setError(err);
      console.error('Error updating payment status:', err);
    },
  });

  // Create a new payment
  const createPayment = useCallback(
    async (input: CreatePaymentInput): Promise<Payment | null> => {
      try {
        const { data } = await createPaymentMutation({
          variables: { input },
        });
        return data.createPayment;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [createPaymentMutation]
  );

  // Update payment status
  const updatePaymentStatus = useCallback(
    async (input: UpdatePaymentStatusInput): Promise<Payment | null> => {
      try {
        const { data } = await updatePaymentStatusMutation({
          variables: { input },
        });
        return data.updatePaymentStatus;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [updatePaymentStatusMutation]
  );

  // Hook for fetching a single payment
  const usePayment = (paymentId: string): UsePaymentResult => {
    const [paymentError, setPaymentError] = useState<Error | null>(null);

    const { data, loading } = useQuery(PAYMENT_BY_ID, {
      variables: { id: paymentId },
      skip: !paymentId,
      fetchPolicy: 'network-only',
      onError: (err) => {
        setPaymentError(err);
        console.error('Error fetching payment:', err);
      },
    });

    // Mock payment data for development
    const mockPayment: Payment = paymentId
      ? {
          id: paymentId,
          invoiceId: 'inv_' + Math.random().toString(36).substring(2, 10),
          merchantId: 'merch_' + Math.random().toString(36).substring(2, 10),
          amount: '5.0',
          amountUsd: '100.00',
          tokenSymbol: 'DOT',
          tokenAddress: undefined,
          chainId: 'polkadot',
          chainName: 'Polkadot',
          fromAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
          toAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
          txHash: '0x' + Array(64).fill(0).map(() => Math.random().toString(16)[2]).join(''),
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
          updatedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour from now
          metadata: {
            paymentMethod: 'wallet',
            walletType: 'polkadot-js',
          },
        }
      : null;

    // Use mock data for now, replace with real data when backend is ready
    const payment = data?.payment || mockPayment;

    return {
      payment,
      loading,
      error: paymentError,
    };
  };

  // Hook for fetching payments by invoice ID
  const usePaymentsByInvoice = (invoiceId: string): UsePaymentsResult => {
    const [paymentsError, setPaymentsError] = useState<Error | null>(null);

    const { data, loading } = useQuery(PAYMENTS_BY_INVOICE_ID, {
      variables: { invoiceId },
      skip: !invoiceId,
      fetchPolicy: 'network-only',
      onError: (err) => {
        setPaymentsError(err);
        console.error('Error fetching payments:', err);
      },
    });

    // Mock payments data for development
    const mockPayments: Payment[] = invoiceId
      ? [
          {
            id: 'pay_' + Math.random().toString(36).substring(2, 10),
            invoiceId,
            merchantId: 'merch_' + Math.random().toString(36).substring(2, 10),
            amount: '5.0',
            amountUsd: '100.00',
            tokenSymbol: 'DOT',
            chainId: 'polkadot',
            chainName: 'Polkadot',
            fromAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            toAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            txHash: '0x' + Array(64).fill(0).map(() => Math.random().toString(16)[2]).join(''),
            status: 'COMPLETED',
            createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
            metadata: {
              paymentMethod: 'wallet',
              walletType: 'polkadot-js',
            },
          },
        ]
      : [];

    // Use mock data for now, replace with real data when backend is ready
    const payments = data?.paymentsByInvoiceId || mockPayments;

    return {
      payments,
      loading,
      error: paymentsError,
    };
  };

  return {
    createPayment,
    updatePaymentStatus,
    usePayment,
    usePaymentsByInvoice,
  };
}
