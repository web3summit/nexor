import { useState, useEffect, useCallback } from 'react';
import { useMultiChainWallet } from './useMultiChainWallet';
import { ContractPromise } from '@polkadot/api-contract';
import type { WeightV2 } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

// Contract ABIs - these would be imported from compiled contract artifacts
import vaultAbi from '../contracts/vault.json';
import escrowAbi from '../contracts/escrow.json';
import streamingPaymentsAbi from '../contracts/streaming_payments.json';
import crossChainSwapAbi from '../contracts/cross_chain_swap.json';
import keyRegistryAbi from '../contracts/key_registry.json';

interface ContractAddresses {
  vault: string;
  escrow: string;
  streamingPayments: string;
  crossChainSwap: string;
  keyRegistry: string;
}

// Network-specific contract addresses
const contractAddresses: Record<string, ContractAddresses> = {
  'polkadot': {
    vault: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    escrow: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    streamingPayments: '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY',
    crossChainSwap: '5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc',
    keyRegistry: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
  },
  'kusama': {
    vault: 'FcxNWVy5RESDsErjwyZmPCW6Z8Y3fbfLzmou34YZTrbcraL',
    escrow: 'EXkCSUQ6Z1hKvGWMNkUDKrTMVHRduQHWc8G6vgo4NccUmhU',
    streamingPayments: 'J4hAvZoHCviZSoPHoSwLida8cEkZR1NXJcGrcfx8UmfqgYT',
    crossChainSwap: 'HmGLJ6sG34vyBwyQSJWvN8HUByatcisuoyuyDXS4JeUZScm',
    keyRegistry: 'EQBwtmKWCyRrQ8yGWg7LkB8p7hpEKXZz4qUg9WR8hZmieCM',
  },
  'rococo': {
    vault: '5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGJE',
    escrow: '5ECre9HYMwXqZWsvMmxLzHqVZR8Bj4fXhWRxTgw9YsiFCTfA',
    streamingPayments: '5H3ZtyGEGnbHKgTmAcHrQ9rUVsvGVhWtx7zcNyiNYUvYCgNh',
    crossChainSwap: '5DZLEGxx3XmBfz8uZmLwj6fmKEFBHJMQFgwS1C3VARHYtSBD',
    keyRegistry: '5GsjBLYV128Myh3bWTcFYyBWrZU1KiKmeXEKBdxUC9B95EwN',
  }
};

// Gas limits for contract calls
const GAS_LIMIT = new BN(100000000000);

export interface UseInkContractsResult {
  // Vault functions
  createVault: (name: string, beneficiaries: string[], threshold: number) => Promise<string>;
  depositToVault: (vaultId: string, amount: string, token: string) => Promise<string>;
  withdrawFromVault: (vaultId: string, amount: string, token: string, destination: string) => Promise<string>;
  
  // Escrow functions
  createEscrow: (seller: string, buyer: string, amount: string, token: string, releaseTime?: number) => Promise<string>;
  releaseEscrow: (escrowId: string) => Promise<string>;
  disputeEscrow: (escrowId: string, reason: string) => Promise<string>;
  
  // Streaming payments functions
  createStream: (recipient: string, amount: string, token: string, duration: number) => Promise<string>;
  cancelStream: (streamId: string) => Promise<string>;
  withdrawFromStream: (streamId: string) => Promise<string>;
  
  // Cross-chain swap functions
  initiateSwap: (sourceToken: string, targetToken: string, amount: string, recipient: string, targetChain: string) => Promise<string>;
  finalizeSwap: (swapId: string) => Promise<string>;
  
  // Key registry functions
  registerKey: (publicKey: string, metadata: Record<string, any>) => Promise<string>;
  revokeKey: (keyId: string) => Promise<string>;
  lookupKey: (keyId: string) => Promise<any>;
  
  // Status and errors
  isLoading: boolean;
  error: string | null;
}

export function useInkContracts(): UseInkContractsResult {
  const { api, accounts, activeChain, signAndSendTransaction } = useMultiChainWallet();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize contract instances
  const [contracts, setContracts] = useState<{
    vault: ContractPromise | null;
    escrow: ContractPromise | null;
    streamingPayments: ContractPromise | null;
    crossChainSwap: ContractPromise | null;
    keyRegistry: ContractPromise | null;
  }>({
    vault: null,
    escrow: null,
    streamingPayments: null,
    crossChainSwap: null,
    keyRegistry: null
  });
  
  // Initialize contracts when API is available
  useEffect(() => {
    if (!api || !activeChain) return;
    
    try {
      const addresses = contractAddresses[activeChain];
      if (!addresses) {
        setError(`No contract addresses found for chain: ${activeChain}`);
        return;
      }
      
      setContracts({
        vault: new ContractPromise(api, vaultAbi, addresses.vault),
        escrow: new ContractPromise(api, escrowAbi, addresses.escrow),
        streamingPayments: new ContractPromise(api, streamingPaymentsAbi, addresses.streamingPayments),
        crossChainSwap: new ContractPromise(api, crossChainSwapAbi, addresses.crossChainSwap),
        keyRegistry: new ContractPromise(api, keyRegistryAbi, addresses.keyRegistry),
      });
      
      setError(null);
    } catch (err) {
      console.error('Failed to initialize contracts:', err);
      setError('Failed to initialize smart contracts');
    }
  }, [api, activeChain]);
  
  // Helper function to call a contract method
  const callContract = useCallback(async (
    contract: ContractPromise | null,
    method: string,
    params: any[],
    value: BN = new BN(0)
  ) => {
    if (!contract || !api || !accounts || accounts.length === 0) {
      throw new Error('Contract or account not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: GAS_LIMIT,
        proofSize: new BN(1000000),
      }) as WeightV2;
      
      const txHash = await signAndSendTransaction({
        from: accounts[0].address,
        method: contract.tx[method],
        args: [...params, { gasLimit, value }],
      });
      
      setIsLoading(false);
      return txHash;
    } catch (err) {
      console.error(`Error calling ${method}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api, accounts, signAndSendTransaction]);
  
  // Vault functions
  const createVault = useCallback(async (name: string, beneficiaries: string[], threshold: number) => {
    return callContract(contracts.vault, 'createVault', [name, beneficiaries, threshold]);
  }, [callContract, contracts.vault]);
  
  const depositToVault = useCallback(async (vaultId: string, amount: string, token: string) => {
    return callContract(contracts.vault, 'deposit', [vaultId, amount, token]);
  }, [callContract, contracts.vault]);
  
  const withdrawFromVault = useCallback(async (vaultId: string, amount: string, token: string, destination: string) => {
    return callContract(contracts.vault, 'withdraw', [vaultId, amount, token, destination]);
  }, [callContract, contracts.vault]);
  
  // Escrow functions
  const createEscrow = useCallback(async (seller: string, buyer: string, amount: string, token: string, releaseTime?: number) => {
    const params = releaseTime ? [seller, buyer, amount, token, releaseTime] : [seller, buyer, amount, token];
    return callContract(contracts.escrow, 'createEscrow', params);
  }, [callContract, contracts.escrow]);
  
  const releaseEscrow = useCallback(async (escrowId: string) => {
    return callContract(contracts.escrow, 'release', [escrowId]);
  }, [callContract, contracts.escrow]);
  
  const disputeEscrow = useCallback(async (escrowId: string, reason: string) => {
    return callContract(contracts.escrow, 'dispute', [escrowId, reason]);
  }, [callContract, contracts.escrow]);
  
  // Streaming payments functions
  const createStream = useCallback(async (recipient: string, amount: string, token: string, duration: number) => {
    return callContract(contracts.streamingPayments, 'createStream', [recipient, amount, token, duration]);
  }, [callContract, contracts.streamingPayments]);
  
  const cancelStream = useCallback(async (streamId: string) => {
    return callContract(contracts.streamingPayments, 'cancelStream', [streamId]);
  }, [callContract, contracts.streamingPayments]);
  
  const withdrawFromStream = useCallback(async (streamId: string) => {
    return callContract(contracts.streamingPayments, 'withdraw', [streamId]);
  }, [callContract, contracts.streamingPayments]);
  
  // Cross-chain swap functions
  const initiateSwap = useCallback(async (sourceToken: string, targetToken: string, amount: string, recipient: string, targetChain: string) => {
    return callContract(contracts.crossChainSwap, 'initiateSwap', [sourceToken, targetToken, amount, recipient, targetChain]);
  }, [callContract, contracts.crossChainSwap]);
  
  const finalizeSwap = useCallback(async (swapId: string) => {
    return callContract(contracts.crossChainSwap, 'finalizeSwap', [swapId]);
  }, [callContract, contracts.crossChainSwap]);
  
  // Key registry functions
  const registerKey = useCallback(async (publicKey: string, metadata: Record<string, any>) => {
    return callContract(contracts.keyRegistry, 'registerKey', [publicKey, JSON.stringify(metadata)]);
  }, [callContract, contracts.keyRegistry]);
  
  const revokeKey = useCallback(async (keyId: string) => {
    return callContract(contracts.keyRegistry, 'revokeKey', [keyId]);
  }, [callContract, contracts.keyRegistry]);
  
  const lookupKey = useCallback(async (keyId: string) => {
    if (!contracts.keyRegistry || !api) {
      throw new Error('Contract or API not available');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contracts.keyRegistry.query.lookupKey(accounts?.[0]?.address || '', { gasLimit: GAS_LIMIT }, keyId);
      setIsLoading(false);
      
      if (result.result.isOk) {
        return JSON.parse(result.output.toString());
      } else {
        throw new Error('Error looking up key');
      }
    } catch (err) {
      console.error('Error looking up key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
      throw err;
    }
  }, [api, accounts, contracts.keyRegistry]);
  
  return {
    // Vault functions
    createVault,
    depositToVault,
    withdrawFromVault,
    
    // Escrow functions
    createEscrow,
    releaseEscrow,
    disputeEscrow,
    
    // Streaming payments functions
    createStream,
    cancelStream,
    withdrawFromStream,
    
    // Cross-chain swap functions
    initiateSwap,
    finalizeSwap,
    
    // Key registry functions
    registerKey,
    revokeKey,
    lookupKey,
    
    // Status and errors
    isLoading,
    error
  };
}
