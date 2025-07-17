/**
 * Token-related type definitions
 */

export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  address: string;
  coingeckoId?: string;
}

export interface TokenInfo {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
  address: string;
  coingeckoId?: string;
  balance?: string;
  price?: number;
  priceChange24h?: number;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  balanceFormatted: string;
  usdValue?: number;
}

export interface TokenPrice {
  symbol: string;
  usd: number;
  change24h?: number;
  lastUpdated: Date;
}

export interface SwapQuote {
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  rate: number;
  priceImpact: number;
  fee: string;
  route?: string[];
}

export interface TokenSwapParams {
  fromToken: Token;
  toToken: Token;
  amount: string;
  slippage: number;
  recipient?: string;
}

// Common token definitions
export const COMMON_TOKENS: Record<string, Token> = {
  DOT: {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    decimals: 10,
    chainId: 1000, // Polkadot parachain ID
    address: '0x0000000000000000000000000000000000000000',
    coingeckoId: 'polkadot',
  },
  KSM: {
    id: 'kusama',
    symbol: 'KSM',
    name: 'Kusama',
    decimals: 12,
    chainId: 2000, // Kusama parachain ID
    address: '0x0000000000000000000000000000000000000000',
    coingeckoId: 'kusama',
  },
  USDC: {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chainId: 1, // Ethereum mainnet
    address: '0xA0b86a33E6441d0C6E6b8b0c6E6b8b0c6E6b8b0c',
    coingeckoId: 'usd-coin',
  },
  USDT: {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    chainId: 1, // Ethereum mainnet
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    coingeckoId: 'tether',
  },
};

export type TokenSymbol = keyof typeof COMMON_TOKENS;
