import { useState, useEffect, useCallback } from 'react';
import { useMultiChainWallet } from './useMultiChainWallet';
import { BN } from '@polkadot/util';
import type { ISubmittableResult } from '@polkadot/types/types';

// XCM format types
interface XcmDestination {
  parents: number;
  interior: {
    X1?: { Parachain: number } | { AccountId32: { id: string; network?: string } };
    X2?: [{ Parachain: number }, { AccountId32: { id: string; network?: string } | { PalletInstance: number } }];
    // Add more variants as needed
  };
}

interface AssetMetadata {
  id: number | string;
  name: string;
  symbol: string;
  decimals: number;
  minBalance: string;
  isFrozen: boolean;
  owner?: string;
  admin?: string;
  issuer?: string;
  freezer?: string;
}

interface XcmTransferParams {
  destChain: string;
  destAddress: string;
  currencyId: number | string;
  amount: string;
  weightLimit?: string;
}

export interface UseAssetsAndXcmResult {
  // Assets precompile functions
  getAssets: () => Promise<AssetMetadata[]>;
  getAssetBalance: (assetId: number | string, address?: string) => Promise<string>;
  transferAsset: (assetId: number | string, target: string, amount: string) => Promise<string>;
  mintAsset: (assetId: number | string, beneficiary: string, amount: string) => Promise<string>;
  burnAsset: (assetId: number | string, amount: string) => Promise<string>;
  createAsset: (metadata: Partial<AssetMetadata>) => Promise<number | string>;
  
  // XCM functions
  sendXcmTransfer: (params: XcmTransferParams) => Promise<string>;
  estimateXcmFees: (params: XcmTransferParams) => Promise<string>;
  getDestinationFeePerSecond: (destChain: string) => Promise<string>;
  
  // Status and errors
  isLoading: boolean;
  error: string | null;
}

// Chain ID mapping for XCM
const chainIdMap: Record<string, { paraId?: number; relayChain?: string; format: 'substrate' | 'ethereum' }> = {
  'polkadot': { format: 'substrate' },
  'kusama': { format: 'substrate' },
  'astar': { paraId: 2006, relayChain: 'polkadot', format: 'substrate' },
  'moonbeam': { paraId: 2004, relayChain: 'polkadot', format: 'ethereum' },
  'acala': { paraId: 2000, relayChain: 'polkadot', format: 'substrate' },
  'shiden': { paraId: 2007, relayChain: 'kusama', format: 'substrate' },
  'moonriver': { paraId: 2023, relayChain: 'kusama', format: 'ethereum' },
  'karura': { paraId: 2000, relayChain: 'kusama', format: 'substrate' },
};

export function useAssetsAndXcm(): UseAssetsAndXcmResult {
  const { api, accounts, activeChain, signAndSendTransaction } = useMultiChainWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to execute transactions
  const executeTransaction = useCallback(async (
    method: any,
    args: any[],
    value: BN = new BN(0)
  ): Promise<string> => {
    if (!api || !accounts || accounts.length === 0) {
      throw new Error('API or account not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const txHash = await signAndSendTransaction({
        from: accounts[0].address,
        method,
        args,
        value,
      });
      
      setIsLoading(false);
      return txHash;
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api, accounts, signAndSendTransaction]);

  // Assets precompile functions
  const getAssets = useCallback(async (): Promise<AssetMetadata[]> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the chain supports the assets precompile
      if (!api.query.assets) {
        throw new Error('Assets pallet not supported on this chain');
      }
      
      // Get all asset IDs
      const assetEntries = await api.query.assets.asset.entries();
      const assetIds = assetEntries.map(([key]) => {
        return key.args[0].toString();
      });
      
      // Get metadata for each asset
      const assetsMetadata = await Promise.all(
        assetIds.map(async (id) => {
          const [asset, metadata] = await Promise.all([
            api.query.assets.asset(id),
            api.query.assets.metadata(id),
          ]);
          
          const assetData = asset.unwrap().toJSON() as any;
          const metadataData = metadata.toJSON() as any;
          
          return {
            id,
            name: Buffer.from(metadataData.name, 'hex').toString(),
            symbol: Buffer.from(metadataData.symbol, 'hex').toString(),
            decimals: metadataData.decimals,
            minBalance: assetData.minBalance,
            isFrozen: assetData.isFrozen,
            owner: assetData.owner,
            admin: assetData.admin,
            issuer: assetData.issuer,
            freezer: assetData.freezer,
          };
        })
      );
      
      setIsLoading(false);
      return assetsMetadata;
    } catch (err) {
      console.error('Error getting assets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api]);

  const getAssetBalance = useCallback(async (assetId: number | string, address?: string): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    const targetAddress = address || accounts?.[0]?.address;
    if (!targetAddress) {
      throw new Error('No address provided');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if the chain supports the assets precompile
      if (!api.query.assets) {
        throw new Error('Assets pallet not supported on this chain');
      }
      
      const balance = await api.query.assets.account(assetId, targetAddress);
      
      setIsLoading(false);
      return balance.isSome ? balance.unwrap().balance.toString() : '0';
    } catch (err) {
      console.error('Error getting asset balance:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api, accounts]);

  const transferAsset = useCallback(async (assetId: number | string, target: string, amount: string): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    // Check if the chain supports the assets precompile
    if (!api.tx.assets) {
      throw new Error('Assets pallet not supported on this chain');
    }
    
    return executeTransaction(api.tx.assets.transfer, [assetId, target, amount]);
  }, [api, executeTransaction]);

  const mintAsset = useCallback(async (assetId: number | string, beneficiary: string, amount: string): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    // Check if the chain supports the assets precompile
    if (!api.tx.assets) {
      throw new Error('Assets pallet not supported on this chain');
    }
    
    return executeTransaction(api.tx.assets.mint, [assetId, beneficiary, amount]);
  }, [api, executeTransaction]);

  const burnAsset = useCallback(async (assetId: number | string, amount: string): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    // Check if the chain supports the assets precompile
    if (!api.tx.assets) {
      throw new Error('Assets pallet not supported on this chain');
    }
    
    return executeTransaction(api.tx.assets.burn, [assetId, accounts?.[0]?.address, amount]);
  }, [api, accounts, executeTransaction]);

  const createAsset = useCallback(async (metadata: Partial<AssetMetadata>): Promise<number | string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    // Check if the chain supports the assets precompile
    if (!api.tx.assets) {
      throw new Error('Assets pallet not supported on this chain');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the next available asset ID
      const assetEntries = await api.query.assets.asset.entries();
      const assetIds = assetEntries.map(([key]) => {
        return parseInt(key.args[0].toString());
      });
      
      const nextId = assetIds.length > 0 ? Math.max(...assetIds) + 1 : 1;
      
      // Create the asset
      const admin = accounts?.[0]?.address;
      if (!admin) {
        throw new Error('No admin account available');
      }
      
      const txHash = await executeTransaction(
        api.tx.assets.create,
        [nextId, admin, metadata.minBalance || '1']
      );
      
      // Set metadata
      if (metadata.name && metadata.symbol) {
        await executeTransaction(
          api.tx.assets.setMetadata,
          [
            nextId,
            metadata.name,
            metadata.symbol,
            metadata.decimals || 12
          ]
        );
      }
      
      setIsLoading(false);
      return nextId;
    } catch (err) {
      console.error('Error creating asset:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api, accounts, executeTransaction]);

  // XCM functions
  const buildXcmDestination = useCallback((destChain: string, destAddress: string): XcmDestination => {
    const chainInfo = chainIdMap[destChain];
    if (!chainInfo) {
      throw new Error(`Unsupported destination chain: ${destChain}`);
    }
    
    // If destination is a parachain
    if (chainInfo.paraId && chainInfo.relayChain) {
      return {
        parents: 1, // 1 for relay chain
        interior: {
          X2: [
            { Parachain: chainInfo.paraId },
            { AccountId32: { id: destAddress, network: chainInfo.relayChain } }
          ]
        }
      };
    }
    
    // If destination is a relay chain
    return {
      parents: 0,
      interior: {
        X1: { AccountId32: { id: destAddress } }
      }
    };
  }, []);

  const sendXcmTransfer = useCallback(async (params: XcmTransferParams): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    // Check if the chain supports XCM
    if (!api.tx.xcmPallet) {
      throw new Error('XCM pallet not supported on this chain');
    }
    
    const { destChain, destAddress, currencyId, amount, weightLimit } = params;
    
    // Build the XCM destination
    const destination = buildXcmDestination(destChain, destAddress);
    
    // Default weight limit if not provided
    const defaultWeightLimit = {
      Unlimited: null
    };
    
    // Execute the XCM transfer
    return executeTransaction(
      api.tx.xcmPallet.reserveTransferAssets,
      [
        { V1: destination },
        { V1: { beneficiary: { V1: { X1: { AccountId32: { id: destAddress } } } } } },
        { V1: [{ id: { Concrete: { parents: 0, interior: { X1: { GeneralIndex: currencyId } } } }, fun: { Fungible: amount } }] },
        0, // fee index
        weightLimit || defaultWeightLimit
      ]
    );
  }, [api, buildXcmDestination, executeTransaction]);

  const estimateXcmFees = useCallback(async (params: XcmTransferParams): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a simplified estimation - in a real implementation,
      // you would need to query the destination chain for fee data
      // and calculate based on XCM instruction weights
      
      // For now, we'll return a fixed percentage of the amount as an estimate
      const amountBN = new BN(params.amount);
      const feePercentage = new BN(5); // 5%
      const estimatedFee = amountBN.mul(feePercentage).div(new BN(100));
      
      setIsLoading(false);
      return estimatedFee.toString();
    } catch (err) {
      console.error('Error estimating XCM fees:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api]);

  const getDestinationFeePerSecond = useCallback(async (destChain: string): Promise<string> => {
    if (!api) {
      throw new Error('API not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would query the destination chain
      // for its fee per second data. For now, we'll return mock values.
      const mockFeePerSecond: Record<string, string> = {
        'polkadot': '10000000000',
        'kusama': '100000000',
        'astar': '5000000000',
        'moonbeam': '8000000000',
        'acala': '6000000000',
        'shiden': '3000000000',
        'moonriver': '4000000000',
        'karura': '2000000000',
      };
      
      const feePerSecond = mockFeePerSecond[destChain] || '5000000000';
      
      setIsLoading(false);
      return feePerSecond;
    } catch (err) {
      console.error('Error getting destination fee per second:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api]);

  return {
    // Assets precompile functions
    getAssets,
    getAssetBalance,
    transferAsset,
    mintAsset,
    burnAsset,
    createAsset,
    
    // XCM functions
    sendXcmTransfer,
    estimateXcmFees,
    getDestinationFeePerSecond,
    
    // Status and errors
    isLoading,
    error
  };
}
