import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

// Cache for API instances
const apiInstances: Record<string, ApiPromise> = {};

/**
 * Initialize Polkadot API for a specific network
 */
export async function initPolkadotApi(network: 'polkadot' | 'kusama' | 'local'): Promise<ApiPromise> {
  // Return cached instance if available
  if (apiInstances[network]) {
    return apiInstances[network];
  }

  // RPC endpoints
  const endpoints = {
    polkadot: 'wss://rpc.polkadot.io',
    kusama: 'wss://kusama-rpc.polkadot.io',
    local: 'ws://127.0.0.1:9944',
  };

  // Create provider and API
  const provider = new WsProvider(endpoints[network]);
  const api = await ApiPromise.create({ provider });
  
  // Cache instance
  apiInstances[network] = api;
  
  return api;
}

/**
 * Initialize Solana connection
 */
export function initSolanaConnection(network: 'mainnet' | 'devnet' | 'testnet' | 'local'): Connection {
  // RPC endpoints
  const endpoints = {
    mainnet: 'https://api.mainnet-beta.solana.com',
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    local: 'http://localhost:8899',
  };

  return new Connection(endpoints[network]);
}

/**
 * Enable Polkadot extension
 */
export async function enablePolkadotExtension(appName: string): Promise<boolean> {
  try {
    const extensions = await web3Enable(appName);
    return extensions.length > 0;
  } catch (error) {
    console.error('Failed to enable Polkadot extension:', error);
    return false;
  }
}

/**
 * Get accounts from Polkadot extension
 */
export async function getPolkadotAccounts() {
  try {
    return await web3Accounts();
  } catch (error) {
    console.error('Failed to get Polkadot accounts:', error);
    return [];
  }
}

/**
 * Convert address between different SS58 formats
 */
export function convertAddress(address: string, ss58Format: number): string {
  try {
    const publicKey = decodeAddress(address);
    return encodeAddress(publicKey, ss58Format);
  } catch (error) {
    console.error('Failed to convert address:', error);
    return address;
  }
}

/**
 * Send tokens on Polkadot/Kusama
 */
export async function sendPolkadotTokens(
  api: ApiPromise,
  senderAddress: string,
  recipientAddress: string,
  amount: string,
): Promise<string> {
  try {
    // Enable extensions
    await web3Enable('Nexor Payment Widget');
    
    // Get injector for the sender address
    const injector = await web3FromAddress(senderAddress);
    
    // Create transfer transaction
    const transfer = api.tx.balances.transfer(recipientAddress, amount);
    
    // Sign and send transaction
    const hash = await transfer.signAndSend(senderAddress, { signer: injector.signer });
    
    return hash.toString();
  } catch (error) {
    console.error('Failed to send Polkadot tokens:', error);
    throw error;
  }
}

/**
 * Send SOL on Solana
 */
export async function sendSolanaTokens(
  connection: Connection,
  senderPublicKey: PublicKey,
  recipientPublicKey: PublicKey,
  amount: number,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
): Promise<string> {
  try {
    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderPublicKey,
        toPubkey: recipientPublicKey,
        lamports: amount,
      })
    );
    
    // Get recent blockhash
    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderPublicKey;
    
    // Sign transaction
    const signedTransaction = await signTransaction(transaction);
    
    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Failed to send Solana tokens:', error);
    throw error;
  }
}

/**
 * Format balance with appropriate units
 */
export function formatBalance(balance: string | number, decimals: number = 12): string {
  const balanceNumber = typeof balance === 'string' ? parseFloat(balance) : balance;
  const formattedBalance = balanceNumber / Math.pow(10, decimals);
  
  return formattedBalance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Parse balance to chain format
 */
export function parseBalance(amount: string | number, decimals: number = 12): string {
  const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount;
  const parsedAmount = BigInt(Math.floor(amountNumber * Math.pow(10, decimals)));
  
  return parsedAmount.toString();
}

/**
 * Validate address format
 */
export function isValidAddress(address: string, type: 'polkadot' | 'kusama' | 'solana'): boolean {
  try {
    if (type === 'polkadot' || type === 'kusama') {
      // Try to decode the address to validate it
      decodeAddress(address);
      return true;
    } else if (type === 'solana') {
      // Check if it's a valid Solana public key
      new PublicKey(address);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}
