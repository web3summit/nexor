import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { TransactionDetails } from '../../../components/molecules/TransactionDetails';
import { useInvoiceManagement } from '../../../hooks/useInvoiceManagement';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { usePaymentManagement } from '../../../hooks/usePaymentManagement';

export default function InvoiceSuccessPage() {
  const router = useRouter();
  const { id, payment } = router.query;
  const invoiceId = typeof id === 'string' ? id : '';
  const paymentId = typeof payment === 'string' ? payment : '';
  
  // Hooks
  const { invoice, loading: invoiceLoading } = useInvoiceManagement('').useInvoice(invoiceId);
  const { payment: paymentData, loading: paymentLoading } = usePaymentManagement().usePayment(paymentId);
  const { trackPageView, trackEvent } = useAnalytics();
  
  // Track page view
  useEffect(() => {
    if (invoiceId && paymentId) {
      trackPageView('invoice_success_page', { invoiceId, paymentId });
    }
  }, [invoiceId, paymentId, trackPageView]);
  
  // Loading state
  const loading = invoiceLoading || paymentLoading;
  
  // Error state
  const error = !loading && (!invoice || !paymentData);
  
  // Mock transaction data (in a real app, this would come from the blockchain)
  const mockTransaction = {
    txHash: paymentData?.txHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    chain: 'polkadot',
    fromAddress: paymentData?.fromAddress || '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    toAddress: paymentData?.toAddress || '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    amount: paymentData?.amount || '5.0',
    tokenSymbol: paymentData?.tokenSymbol || 'DOT',
    blockNumber: 12345678,
    confirmations: 12,
    status: 'confirmed',
    timestamp: Date.now(),
    explorerUrl: `https://polkadot.subscan.io/extrinsic/${paymentData?.txHash || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'}`,
  };
  
  // Handle view receipt
  const handleViewReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download functionality would be implemented here.');
    
    trackEvent({
      eventType: 'payment_completed',
      paymentId,
      invoiceId,
      metadata: {
        action: 'download_receipt'
      }
    });
  };
  
  // Handle return to merchant
  const handleReturnToMerchant = () => {
    // In a real app, this would redirect to the merchant's success URL
    if (invoice?.metadata?.successUrl) {
      window.location.href = invoice.metadata.successUrl;
    } else {
      router.push('/');
    }
    
    trackEvent({
      eventType: 'payment_completed',
      paymentId,
      invoiceId,
      metadata: {
        action: 'return_to_merchant'
      }
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-xl">Loading payment details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center" glassmorphism>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Payment Not Found</h1>
          <p className="text-gray-400 mb-6">
            We couldn't find the payment details you're looking for.
          </p>
          <Button
            onClick={() => router.push('/')}
            fullWidth
            glassmorphism
          >
            Return Home
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-300 text-lg">
              Your payment has been processed and confirmed.
            </p>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Details */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6" glassmorphism>
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-xl font-semibold">
                      {paymentData?.amount || '5.0'} {paymentData?.tokenSymbol || 'DOT'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">USD Value</span>
                    <span>${paymentData?.amountUsd || '100.00'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Payment ID</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Date</span>
                    <span>{new Date().toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
                      COMPLETED
                    </span>
                  </div>
                </div>
              </Card>
              
              {/* Transaction Details */}
              <TransactionDetails transaction={mockTransaction} />
            </div>
            
            {/* Invoice Summary */}
            <div>
              <Card className="p-6 mb-6" glassmorphism>
                <h2 className="text-xl font-semibold mb-4">Invoice Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Invoice ID</span>
                    <span className="font-mono text-sm">{invoiceId.substring(0, 8)}...</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Total Amount</span>
                    <span>{invoice?.amount || '100.00'} {invoice?.currency || 'USD'}</span>
                  </div>
                  
                  {invoice?.description && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-400">Description</span>
                      <span className="text-right">{invoice.description}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
                      PAID
                    </span>
                  </div>
                </div>
              </Card>
              
              {/* Actions */}
              <Card className="p-6" glassmorphism>
                <div className="space-y-4">
                  <Button
                    onClick={handleViewReceipt}
                    fullWidth
                    glassmorphism
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Download Receipt
                  </Button>
                  
                  <Button
                    onClick={handleReturnToMerchant}
                    variant="outline"
                    fullWidth
                    glassmorphism
                  >
                    Return to Merchant
                  </Button>
                  
                  <div className="text-center text-sm text-gray-400 mt-4">
                    <p>
                      Need help? <a href="#" className="text-primary hover:underline">Contact Support</a>
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
