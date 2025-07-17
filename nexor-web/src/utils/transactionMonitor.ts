/**
 * Utility for monitoring blockchain transactions across different chains
 */

export interface TransactionDetails {
  txHash: string;
  chain: 'polkadot' | 'kusama' | 'solana';
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  blockNumber?: number;
  confirmations: number;
  status: 'pending' | 'processing' | 'confirmed' | 'failed';
  timestamp: number;
  explorerUrl: string;
}

export interface TransactionMonitorOptions {
  pollingInterval?: number; // in milliseconds
  requiredConfirmations?: number;
  onStatusChange?: (details: TransactionDetails) => void;
  onConfirmation?: (details: TransactionDetails) => void;
  onError?: (error: Error, txHash: string) => void;
}

export class TransactionMonitor {
  private transactions: Map<string, TransactionDetails> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private options: Required<TransactionMonitorOptions>;

  constructor(options: TransactionMonitorOptions = {}) {
    this.options = {
      pollingInterval: options.pollingInterval || 5000,
      requiredConfirmations: options.requiredConfirmations || 6,
      onStatusChange: options.onStatusChange || (() => {}),
      onConfirmation: options.onConfirmation || (() => {}),
      onError: options.onError || (() => {}),
    };
  }

  /**
   * Add a transaction to monitor
   */
  public addTransaction(details: Omit<TransactionDetails, 'confirmations' | 'status' | 'timestamp'>): TransactionDetails {
    const txDetails: TransactionDetails = {
      ...details,
      confirmations: 0,
      status: 'pending',
      timestamp: Date.now(),
    };

    this.transactions.set(details.txHash, txDetails);
    this.startMonitoring(details.txHash);

    return txDetails;
  }

  /**
   * Stop monitoring a specific transaction
   */
  public stopMonitoring(txHash: string): void {
    const timer = this.timers.get(txHash);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(txHash);
    }
  }

  /**
   * Stop monitoring all transactions
   */
  public stopAll(): void {
    for (const txHash of this.timers.keys()) {
      this.stopMonitoring(txHash);
    }
  }

  /**
   * Get transaction details
   */
  public getTransaction(txHash: string): TransactionDetails | undefined {
    return this.transactions.get(txHash);
  }

  /**
   * Get all monitored transactions
   */
  public getAllTransactions(): TransactionDetails[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Start monitoring a transaction
   */
  private startMonitoring(txHash: string): void {
    const timer = setInterval(() => this.checkTransaction(txHash), this.options.pollingInterval);
    this.timers.set(txHash, timer);
    
    // Initial check
    this.checkTransaction(txHash);
  }

  /**
   * Check transaction status
   */
  private async checkTransaction(txHash: string): Promise<void> {
    const tx = this.transactions.get(txHash);
    if (!tx) return;

    try {
      // In a real implementation, we would call the appropriate blockchain API
      // For now, we'll simulate the process with random confirmations
      
      // Simulate transaction progression
      const newStatus = this.simulateTransactionStatus(tx);
      const newConfirmations = this.simulateConfirmations(tx);
      
      // Update transaction details
      const updatedTx: TransactionDetails = {
        ...tx,
        status: newStatus,
        confirmations: newConfirmations,
        blockNumber: tx.blockNumber || (newConfirmations > 0 ? this.simulateBlockNumber(tx) : undefined),
      };
      
      // Store updated transaction
      this.transactions.set(txHash, updatedTx);
      
      // Trigger callbacks
      if (tx.status !== updatedTx.status) {
        this.options.onStatusChange(updatedTx);
      }
      
      if (updatedTx.confirmations >= this.options.requiredConfirmations && 
          updatedTx.status === 'confirmed') {
        this.options.onConfirmation(updatedTx);
        this.stopMonitoring(txHash);
      }
      
      if (updatedTx.status === 'failed') {
        this.options.onError(new Error('Transaction failed'), txHash);
        this.stopMonitoring(txHash);
      }
    } catch (error) {
      this.options.onError(
        error instanceof Error ? error : new Error('Unknown error checking transaction'),
        txHash
      );
    }
  }

  /**
   * Simulate transaction status progression
   */
  private simulateTransactionStatus(tx: TransactionDetails): TransactionDetails['status'] {
    const elapsedSeconds = (Date.now() - tx.timestamp) / 1000;
    
    // Simulate a 5% chance of failure
    if (Math.random() < 0.05 && elapsedSeconds > 10) {
      return 'failed';
    }
    
    if (elapsedSeconds < 5) {
      return 'pending';
    } else if (elapsedSeconds < 15) {
      return 'processing';
    } else {
      return 'confirmed';
    }
  }

  /**
   * Simulate confirmations increasing over time
   */
  private simulateConfirmations(tx: TransactionDetails): number {
    const elapsedSeconds = (Date.now() - tx.timestamp) / 1000;
    
    // Simulate confirmations increasing over time
    // Different chains have different block times
    const blockTime = tx.chain === 'solana' ? 0.4 : tx.chain === 'kusama' ? 6 : 12;
    const expectedConfirmations = Math.floor(elapsedSeconds / blockTime);
    
    return Math.min(expectedConfirmations, this.options.requiredConfirmations + 2);
  }

  /**
   * Simulate a block number
   */
  private simulateBlockNumber(tx: TransactionDetails): number {
    // Generate a realistic block number based on the chain
    const baseBlock = tx.chain === 'polkadot' ? 15000000 : 
                      tx.chain === 'kusama' ? 20000000 : 
                      200000000; // Solana
    
    return baseBlock + Math.floor(Math.random() * 1000);
  }

  /**
   * Get explorer URL for a transaction
   */
  public static getExplorerUrl(chain: TransactionDetails['chain'], txHash: string): string {
    switch (chain) {
      case 'polkadot':
        return `https://polkadot.subscan.io/extrinsic/${txHash}`;
      case 'kusama':
        return `https://kusama.subscan.io/extrinsic/${txHash}`;
      case 'solana':
        return `https://explorer.solana.com/tx/${txHash}`;
      default:
        return '';
    }
  }
}
