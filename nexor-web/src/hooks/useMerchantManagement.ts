import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_MERCHANT, REGENERATE_API_KEY } from '../graphql/mutations';
import { MERCHANT_BY_ID } from '../graphql/queries';

export interface MerchantCustomization {
  primaryColor?: string;
  logoUrl?: string;
  buttonStyle?: string;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  webhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  customization?: MerchantCustomization;
}

export interface UpdateMerchantInput {
  id: string;
  name?: string;
  email?: string;
  webhookUrl?: string;
  customization?: MerchantCustomization;
}

export interface UseMerchantManagementResult {
  merchant: Merchant | null;
  loading: boolean;
  error: Error | null;
  updateMerchant: (input: UpdateMerchantInput) => Promise<Merchant | null>;
  regenerateApiKey: (id: string) => Promise<Merchant | null>;
  refreshMerchant: () => Promise<void>;
}

export function useMerchantManagement(merchantId: string): UseMerchantManagementResult {
  const [error, setError] = useState<Error | null>(null);

  // Query for fetching merchant data
  const {
    data,
    loading,
    refetch,
  } = useQuery(MERCHANT_BY_ID, {
    variables: { id: merchantId },
    fetchPolicy: 'network-only',
    onError: (err) => {
      setError(err);
      console.error('Error fetching merchant data:', err);
    },
  });

  // Mutation for updating merchant
  const [updateMerchantMutation] = useMutation(UPDATE_MERCHANT, {
    refetchQueries: [{ query: MERCHANT_BY_ID, variables: { id: merchantId } }],
    onError: (err) => {
      setError(err);
      console.error('Error updating merchant:', err);
    },
  });

  // Mutation for regenerating API key
  const [regenerateApiKeyMutation] = useMutation(REGENERATE_API_KEY, {
    refetchQueries: [{ query: MERCHANT_BY_ID, variables: { id: merchantId } }],
    onError: (err) => {
      setError(err);
      console.error('Error regenerating API key:', err);
    },
  });

  // Update merchant data
  const updateMerchant = useCallback(
    async (input: UpdateMerchantInput): Promise<Merchant | null> => {
      try {
        const { data } = await updateMerchantMutation({
          variables: { ...input },
        });
        return data.updateMerchant;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [updateMerchantMutation]
  );

  // Regenerate API key
  const regenerateApiKey = useCallback(
    async (id: string): Promise<Merchant | null> => {
      try {
        const { data } = await regenerateApiKeyMutation({
          variables: { id },
        });
        return data.regenerateApiKey;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      }
    },
    [regenerateApiKeyMutation]
  );

  // Refresh merchant data
  const refreshMerchant = useCallback(async (): Promise<void> => {
    try {
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [refetch]);

  // Mock merchant data for development
  const mockMerchant: Merchant = {
    id: merchantId,
    name: 'Acme Corporation',
    email: 'payments@acmecorp.com',
    apiKey: 'sk_live_' + Array(32).fill(0).map(() => Math.random().toString(36)[2]).join(''),
    webhookUrl: 'https://acmecorp.com/api/webhooks/nexor',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-07-15T10:30:00Z',
    customization: {
      primaryColor: '#673AB7',
      logoUrl: 'https://acmecorp.com/logo.png',
      buttonStyle: 'rounded',
    },
  };

  // Use mock data for now, replace with real data when backend is ready
  const merchant = data?.merchant || mockMerchant;

  return {
    merchant,
    loading,
    error,
    updateMerchant,
    regenerateApiKey,
    refreshMerchant,
  };
}
