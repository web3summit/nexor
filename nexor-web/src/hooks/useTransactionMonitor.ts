import { useState, useEffect, useRef, useCallback } from 'react';
import { TransactionMonitor, TransactionDetails, TransactionMonitorOptions } from '../utils/transactionMonitor';

export interface UseTransactionMonitorResult {
  transactions: TransactionDetails[];
  addTransaction: (details: Omit<TransactionDetails, 'confirmations' | 'status' | 'timestamp'>) => TransactionDetails;
  getTransaction: (txHash: string) => TransactionDetails | undefined;
  stopMonitoring: (txHash: string) => void;
  stopAll: () => void;
}

export function useTransactionMonitor(options: TransactionMonitorOptions = {}): UseTransactionMonitorResult {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const monitorRef = useRef<TransactionMonitor | null>(null);
  
  // Initialize the transaction monitor
  useEffect(() => {
    const combinedOptions: TransactionMonitorOptions = {
      ...options,
      onStatusChange: (details) => {
        options.onStatusChange?.(details);
        updateTransactionsList();
      },
      onConfirmation: (details) => {
        options.onConfirmation?.(details);
        updateTransactionsList();
      },
      onError: (error, txHash) => {
        options.onError?.(error, txHash);
        updateTransactionsList();
      },
    };
    
    monitorRef.current = new TransactionMonitor(combinedOptions);
    
    return () => {
      monitorRef.current?.stopAll();
    };
  }, []);
  
  // Update the transactions list
  const updateTransactionsList = useCallback(() => {
    if (monitorRef.current) {
      setTransactions(monitorRef.current.getAllTransactions());
    }
  }, []);
  
  // Add a transaction to monitor
  const addTransaction = useCallback((details: Omit<TransactionDetails, 'confirmations' | 'status' | 'timestamp'>): TransactionDetails => {
    if (!monitorRef.current) {
      throw new Error('Transaction monitor not initialized');
    }
    
    const tx = monitorRef.current.addTransaction(details);
    updateTransactionsList();
    return tx;
  }, [updateTransactionsList]);
  
  // Get transaction details
  const getTransaction = useCallback((txHash: string): TransactionDetails | undefined => {
    if (!monitorRef.current) {
      return undefined;
    }
    
    return monitorRef.current.getTransaction(txHash);
  }, []);
  
  // Stop monitoring a specific transaction
  const stopMonitoring = useCallback((txHash: string): void => {
    if (monitorRef.current) {
      monitorRef.current.stopMonitoring(txHash);
      updateTransactionsList();
    }
  }, [updateTransactionsList]);
  
  // Stop monitoring all transactions
  const stopAll = useCallback((): void => {
    if (monitorRef.current) {
      monitorRef.current.stopAll();
      updateTransactionsList();
    }
  }, [updateTransactionsList]);
  
  return {
    transactions,
    addTransaction,
    getTransaction,
    stopMonitoring,
    stopAll,
  };
}
