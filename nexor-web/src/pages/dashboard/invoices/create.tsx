import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { useInvoiceManagement } from '../../../hooks/useInvoiceManagement';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { useMerchantManagement } from '../../../hooks/useMerchantManagement';

export default function CreateInvoicePage() {
  const router = useRouter();
  const merchantId = 'merch_123456'; // Mock merchant ID for development
  
  // Hooks
  const { createInvoice } = useInvoiceManagement(merchantId);
  const { trackPageView, trackEvent } = useAnalytics(merchantId);
  const { merchant } = useMerchantManagement(merchantId);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [metadata, setMetadata] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track page view
  React.useEffect(() => {
    trackPageView('invoice_create_page');
  }, [trackPageView]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate form
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      
      // Parse metadata if provided
      let parsedMetadata = {};
      if (metadata) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch (err) {
          throw new Error('Invalid metadata JSON format');
        }
      }
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays || '7', 10));
      
      // Create invoice
      const invoice = await createInvoice({
        merchantId,
        amount,
        currency,
        description,
        expiresAt: expiresAt.toISOString(),
        metadata: {
          ...parsedMetadata,
          customerEmail,
          customerName,
        },
      });
      
      if (invoice) {
        // Track event
        trackEvent({
          eventType: 'invoice_created',
          invoiceId: invoice.id,
          amount,
          amountUsd: amount, // Assuming USD for now
          metadata: {
            currency,
            description,
          },
        });
        
        // Redirect to invoice list
        router.push('/dashboard/invoices');
      } else {
        throw new Error('Failed to create invoice');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error creating invoice:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Create Invoice</h1>
              <p className="text-gray-300">Generate a new payment invoice for your customer</p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/invoices')}
              glassmorphism
            >
              Cancel
            </Button>
          </div>
          
          <Card className="p-6" glassmorphism>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4 mb-6"
              >
                <p className="text-red-300">{error}</p>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Amount and Currency */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                    Amount*
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      step="0.01"
                      min="0.01"
                      className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full pl-7 pr-20 py-3 sm:text-sm border-gray-700 rounded-md"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <select
                        id="currency"
                        name="currency"
                        className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-400 sm:text-sm rounded-r-md focus:ring-primary focus:border-primary"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Expiry */}
                <div>
                  <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-300 mb-1">
                    Expires After
                  </label>
                  <select
                    id="expiryDays"
                    name="expiryDays"
                    className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-3 px-4 sm:text-sm border-gray-700 rounded-md"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-3 px-4 sm:text-sm border-gray-700 rounded-md"
                  placeholder="Invoice for services rendered"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-1">
                    Customer Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    id="customerEmail"
                    className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-3 px-4 sm:text-sm border-gray-700 rounded-md"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    id="customerName"
                    className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-3 px-4 sm:text-sm border-gray-700 rounded-md"
                    placeholder="John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Advanced: Metadata */}
              <div className="border-t border-gray-700 pt-6">
                <details className="group">
                  <summary className="flex justify-between items-center text-sm font-medium text-gray-300 cursor-pointer">
                    <span>Advanced Options</span>
                    <span className="transition group-open:rotate-180">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </summary>
                  
                  <div className="mt-4 space-y-6">
                    <div>
                      <label htmlFor="metadata" className="block text-sm font-medium text-gray-300 mb-1">
                        Metadata (JSON)
                      </label>
                      <textarea
                        id="metadata"
                        name="metadata"
                        rows={4}
                        className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-3 px-4 sm:text-sm border-gray-700 rounded-md font-mono"
                        placeholder='{"orderId": "123", "productId": "456"}'
                        value={metadata}
                        onChange={(e) => setMetadata(e.target.value)}
                      />
                      <p className="mt-1 text-xs text-gray-400">
                        Optional JSON metadata to attach to this invoice. This will be stored with the invoice but not displayed to the customer.
                      </p>
                    </div>
                  </div>
                </details>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto"
                  glassmorphism
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </div>
                  ) : (
                    'Create Invoice'
                  )}
                </Button>
              </div>
            </form>
          </Card>
          
          {/* Preview Card */}
          {amount && (
            <Card className="mt-8 p-6" glassmorphism>
              <h2 className="text-xl font-semibold mb-4">Invoice Preview</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-xl font-semibold">{parseFloat(amount).toFixed(2)} {currency}</span>
                </div>
                
                {description && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Description</span>
                    <span>{description}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Created</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                  <span className="text-gray-400">Expires</span>
                  <span>{(() => {
                    const date = new Date();
                    date.setDate(date.getDate() + parseInt(expiryDays || '7', 10));
                    return date.toLocaleString();
                  })()}</span>
                </div>
                
                {customerName && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Customer</span>
                    <span>{customerName}</span>
                  </div>
                )}
                
                {customerEmail && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-700">
                    <span className="text-gray-400">Email</span>
                    <span>{customerEmail}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Status</span>
                  <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 rounded-full text-xs">
                    PENDING
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
