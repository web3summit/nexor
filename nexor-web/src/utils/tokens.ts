import { formatBalance, parseBalance } from './blockchain';

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  chain: 'polkadot' | 'kusama' | 'solana';
  isStablecoin: boolean;
  contractAddress?: string; // For tokens that have contracts (e.g., ERC20-like tokens)
}

// Token registry with common tokens
export const TOKENS: Record<string, TokenInfo> = {
  // Polkadot ecosystem
  DOT: {
    symbol: 'DOT',
    name: 'Polkadot',
    decimals: 10,
    logo: '/tokens/dot.png',
    chain: 'polkadot',
    isStablecoin: false,
  },
  KSM: {
    symbol: 'KSM',
    name: 'Kusama',
    decimals: 12,
    logo: '/tokens/ksm.png',
    chain: 'kusama',
    isStablecoin: false,
  },
  USDT_DOT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logo: '/tokens/usdt.png',
    chain: 'polkadot',
    isStablecoin: true,
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678', // Example contract address
  },
  USDC_DOT: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: '/tokens/usdc.png',
    chain: 'polkadot',
    isStablecoin: true,
    contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12', // Example contract address
  },
  
  // Solana ecosystem
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logo: '/tokens/sol.png',
    chain: 'solana',
    isStablecoin: false,
  },
  USDC_SOL: {
    symbol: 'USDC',
    name: 'USD Coin (Solana)',
    decimals: 6,
    logo: '/tokens/usdc.png',
    chain: 'solana',
    isStablecoin: true,
    contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // Solana USDC mint address
  },
  USDT_SOL: {
    symbol: 'USDT',
    name: 'Tether USD (Solana)',
    decimals: 6,
    logo: '/tokens/usdt.png',
    chain: 'solana',
    isStablecoin: true,
    contractAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // Solana USDT mint address
  },
};

/**
 * Get token info by symbol and chain
 */
export function getTokenInfo(symbol: string, chain?: 'polkadot' | 'kusama' | 'solana'): TokenInfo | undefined {
  // If chain is specified, find the exact token
  if (chain) {
    return Object.values(TOKENS).find(
      token => token.symbol === symbol && token.chain === chain
    );
  }
  
  // Otherwise, return the first matching token by symbol
  return Object.values(TOKENS).find(token => token.symbol === symbol);
}

/**
 * Format token amount with symbol
 */
export function formatTokenAmount(amount: string | number, symbol: string, includeSymbol: boolean = true): string {
  const tokenInfo = getTokenInfo(symbol);
  if (!tokenInfo) {
    // Default to 6 decimals if token info not found
    const formatted = formatBalance(amount, 6);
    return includeSymbol ? `${formatted} ${symbol}` : formatted;
  }
  
  const formatted = formatBalance(amount, tokenInfo.decimals);
  return includeSymbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Parse token amount to chain format
 */
export function parseTokenAmount(amount: string | number, symbol: string): string {
  const tokenInfo = getTokenInfo(symbol);
  if (!tokenInfo) {
    // Default to 6 decimals if token info not found
    return parseBalance(amount, 6);
  }
  
  return parseBalance(amount, tokenInfo.decimals);
}

/**
 * Get tokens by chain
 */
export function getTokensByChain(chain: 'polkadot' | 'kusama' | 'solana'): TokenInfo[] {
  return Object.values(TOKENS).filter(token => token.chain === chain);
}

/**
 * Get stablecoins
 */
export function getStablecoins(): TokenInfo[] {
  return Object.values(TOKENS).filter(token => token.isStablecoin);
}

/**
 * Check if a token is a stablecoin
 */
export function isStablecoin(symbol: string, chain?: 'polkadot' | 'kusama' | 'solana'): boolean {
  const tokenInfo = getTokenInfo(symbol, chain);
  return tokenInfo?.isStablecoin || false;
}

/**
 * Convert token amount to USD based on price
 */
export function tokenAmountToUsd(amount: string | number, symbol: string, price: number): number {
  const tokenInfo = getTokenInfo(symbol);
  if (!tokenInfo) return 0;
  
  const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
  return amountNumber * price;
}

/**
 * Convert USD amount to token based on price
 */
export function usdToTokenAmount(usdAmount: number, symbol: string, price: number): number {
  if (price <= 0) return 0;
  return usdAmount / price;
}
