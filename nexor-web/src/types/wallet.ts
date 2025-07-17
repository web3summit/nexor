/**
 * Wallet-related type definitions
 */

export type ChainType = 'polkadot' | 'kusama' | 'ethereum' | 'solana';

export interface WalletAccount {
  address: string;
  name?: string;
  source: string;
  type?: string;
  genesisHash?: string;
}

export interface ConnectOptions {
  chain: ChainType;
  walletId: string;
}

export interface MultiChainWallet {
  isInstalled: (walletId: string, chain: ChainType) => boolean;
  connect: (options: ConnectOptions) => Promise<WalletAccount | undefined>;
  disconnect: () => Promise<void>;
  getAccounts: (chain: ChainType) => Promise<WalletAccount[]>;
  signMessage: (message: string, account: WalletAccount) => Promise<string>;
  signTransaction: (transaction: any, account: WalletAccount) => Promise<string>;
  isConnected: boolean;
  currentAccount?: WalletAccount;
  currentChain?: ChainType;
  supportedChains: ChainType[];
  switchChain: (chain: ChainType) => Promise<void>;
  walletId?: string;
}

export interface WalletState {
  isConnected: boolean;
  account?: WalletAccount;
  chain?: ChainType;
  isLoading: boolean;
  error?: string;
}

export interface PaymentFlowProps {
  amount: number;
  currency: string;
  description?: string;
  invoiceId?: string;
  onComplete: (paymentId: string, txHash: string) => void;
  onCancel: () => void;
}

export interface InkContracts {
  vaultContract?: any;
  escrowContract?: any;
  streamingPaymentsContract?: any;
  crossChainSwapContract?: any;
  keyRegistryContract?: any;
}

export interface UseInkContractsResult {
  contracts: InkContracts;
  isLoading: boolean;
  error?: string;
}
