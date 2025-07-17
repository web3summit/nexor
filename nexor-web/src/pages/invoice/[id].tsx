import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { PaymentFlow } from '../../components/organisms/PaymentFlow';
import { PaymentQRCode } from '../../components/molecules/PaymentQRCode';
import { PaymentSummary } from '../../components/molecules/PaymentSummary';
import { PaymentStatus } from '../../components/molecules/PaymentStatus';
import { TransactionDetails } from '../../components/molecules/TransactionDetails';
import { useInvoiceManagement } from '../../hooks/useInvoiceManagement';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useExchangeRates } from '../../hooks/useExchangeRates';

export default function InvoicePage() {
  const router = useRouter();
  const { id } = router.query;
  const invoiceId = typeof id === 'string' ? id : '';
  
  // State for payment flow
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');
  
  // Hooks
  const { invoice, loading, error } = useInvoiceManagement('').useInvoice(invoiceId);
  const { trackPageView, trackEvent } = useAnalytics();
  const { rates } = useExchangeRates();
  
  // Track page view
  useEffect(() => {
    if (invoiceId) {
      trackPageView('invoice_page', { invoiceId });
    }
  }, [invoiceId, trackPageView]);
  
  // Handle payment button click
  const handlePayClick = () => {
    setShowPaymentFlow(true);
    trackEvent('invoice_pay_clicked', { invoiceId });
  };
  
  // Handle payment completion
  const handlePaymentComplete = (paymentId: string, txHash: string) => {
    trackEvent('invoice_payment_complete', { invoiceId, paymentId, txHash });
    // Redirect to success page or show success message
    router.push(`/invoice/${invoiceId}/success?payment=${paymentId}`);
  };
  
  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowPaymentFlow(false);
    trackEvent('invoice_payment_cancelled', { invoiceId });
  };
  
  // Format expiration time
  const formatExpirationTime = () => {
    if (!invoice?.expiresAt) return null;
    
    const expiresAt = new Date(invoice.expiresAt);
    const now = new Date();
    
    if (expiresAt < now) {
      return 'Expired';
    }
    
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `Expires in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    return `Expires in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };
  
  // Get invoice status color
  const getStatusColor = () => {
    if (!invoice) return 'bg-gray-500';
    
    switch (invoice.status) {
      case 'PAID':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'EXPIRED':
        return 'bg-gray-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-white mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-white text-xl">Loading invoice...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center" glassmorphism>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <p className="text-gray-400 mb-6">
            The invoice you're looking for doesn't exist or has been deleted.
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
          {/* Invoice Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Invoice #{invoice.id.substring(0, 8)}</h1>
            <div className="flex items-center justify-center space-x-2">
              <span className={`w-3 h-3 ${getStatusColor()} rounded-full`}></span>
              <span className="text-gray-300">{invoice.status}</span>
              {invoice.status === 'PENDING' && formatExpirationTime() && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{formatExpirationTime()}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Invoice Details */}
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6" glassmorphism>
                <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-xl font-semibold">{invoice.amount} {invoice.currency}</span>
                  </div>
                  
                  {invoice.description && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-400">Description</span>
                      <span>{invoice.description}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Created</span>
                    <span>{new Date(invoice.createdAt).toLocaleString()}</span>
                  </div>
                  
                  {invoice.expiresAt && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-400">Expires</span>
                      <span>{new Date(invoice.expiresAt).toLocaleString()}</span>
                    </div>
                  )}
                  
                  {invoice.customerEmail && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-400">Customer</span>
                      <span>{invoice.customerName || invoice.customerEmail}</span>
                    </div>
                  )}
                  
                  {invoice.paymentId && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                      <span className="text-gray-400">Payment ID</span>
                      <span className="font-mono text-sm">{invoice.paymentId}</span>
                    </div>
                  )}
                </div>
              </Card>
              
              {/* Payment Options */}
              {invoice.status === 'PENDING' && !showPaymentFlow && (
                <Card className="p-6" glassmorphism>
                  <h2 className="text-xl font-semibold mb-4">Payment Options</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="mb-4">
                        Select your preferred payment method to complete this invoice.
                      </p>
                      
                      <Button
                        onClick={handlePayClick}
                        fullWidth
                        glassmorphism
                      >
                        Pay with Cryptocurrency
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-700">
                      <h3 className="font-medium mb-2">Accepted Tokens</h3>
                      <div className="flex flex-wrap gap-2">
                        {rates.slice(0, 5).map(rate => (
                          <div
                            key={rate.symbol}
                            className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center"
                          >
                            <div className="w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center mr-1 text-xs">
                              {rate.symbol.charAt(0)}
                            </div>
                            <span>{rate.symbol}</span>
                          </div>
                        ))}
                        <div className="px-3 py-1 bg-white/10 rounded-full text-sm">
                          +{rates.length - 5} more
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Payment Flow */}
              {invoice.status === 'PENDING' && showPaymentFlow && (
                <Card className="p-6" glassmorphism>
                  <PaymentFlow
                    merchantId={invoice.merchantId}
                    amount={invoice.amount}
                    currency={invoice.currency}
                    description={invoice.description || ''}
                    invoiceId={invoice.id}
                    onComplete={handlePaymentComplete}
                    onCancel={handlePaymentCancel}
                  />
                </Card>
              )}
              
              {/* Payment Success */}
              {invoice.status === 'PAID' && invoice.paymentId && (
                <Card className="p-6" glassmorphism>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Payment Successful</h2>
                    <p className="text-gray-400">
                      This invoice has been paid successfully.
                    </p>
                  </div>
                  
                  <TransactionDetails
                    txHash="0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                    network="Polkadot"
                    from="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                    to="5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty"
                    amount="5.0"
                    tokenSymbol="DOT"
                    status="confirmed"
                    confirmations={12}
                    explorerUrl="https://polkadot.subscan.io/extrinsic/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
                  />
                </Card>
              )}
              
              {/* Invoice Expired */}
              {invoice.status === 'EXPIRED' && (
                <Card className="p-6" glassmorphism>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gray-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Invoice Expired</h2>
                    <p className="text-gray-400 mb-4">
                      This invoice has expired and can no longer be paid.
                    </p>
                    
                    <Button
                      onClick={() => window.location.href = `mailto:${invoice.merchantId}@example.com?subject=Expired Invoice ${invoice.id}`}
                      variant="outline"
                      glassmorphism
                    >
                      Contact Merchant
                    </Button>
                  </div>
                </Card>
              )}
              
              {/* Invoice Cancelled */}
              {invoice.status === 'CANCELLED' && (
                <Card className="p-6" glassmorphism>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-1">Invoice Cancelled</h2>
                    <p className="text-gray-400 mb-4">
                      This invoice has been cancelled by the merchant.
                    </p>
                    
                    <Button
                      onClick={() => window.location.href = `mailto:${invoice.merchantId}@example.com?subject=Cancelled Invoice ${invoice.id}`}
                      variant="outline"
                      glassmorphism
                    >
                      Contact Merchant
                    </Button>
                  </div>
                </Card>
              )}
            </div>
            
            {/* Merchant Info */}
            <div>
              <Card className="p-6 mb-6" glassmorphism>
                <h2 className="text-xl font-semibold mb-4">Merchant</h2>
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Nexor Merchant</h3>
                    <p className="text-sm text-gray-400">ID: {invoice.merchantId}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button
                    onClick={() => window.location.href = `mailto:support@example.com?subject=Invoice ${invoice.id}`}
                    variant="outline"
                    fullWidth
                    glassmorphism
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    }
                  >
                    Contact Support
                  </Button>
                  
                  <Button
                    as="a"
                    href="https://example.com"
                    target="_blank"
                    variant="outline"
                    fullWidth
                    glassmorphism
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                    }
                  >
                    Visit Website
                  </Button>
                </div>
              </Card>
              
              {/* QR Code for Invoice */}
              <Card className="p-6" glassmorphism>
                <h2 className="text-xl font-semibold mb-4">Share Invoice</h2>
                
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg mb-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                      alt="Invoice QR Code"
                      className="w-32 h-32"
                    />
                  </div>
                  
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Invoice URL copied to clipboard!');
                    }}
                    variant="outline"
                    fullWidth
                    glassmorphism
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    }
                  >
                    Copy Link
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
