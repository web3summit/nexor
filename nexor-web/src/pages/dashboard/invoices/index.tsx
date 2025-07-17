import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Card } from '../../../components/atoms/Card';
import { Button } from '../../../components/atoms/Button';
import { useInvoiceManagement } from '../../../hooks/useInvoiceManagement';
import { useAnalytics } from '../../../hooks/useAnalytics';

export default function InvoicesPage() {
  const router = useRouter();
  const merchantId = 'merch_123456'; // Mock merchant ID for development
  
  // Hooks
  const { invoices, loading, error, refreshInvoices, cancelInvoice } = useInvoiceManagement(merchantId);
  const { trackPageView, trackEvent } = useAnalytics(merchantId);
  
  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Track page view
  useEffect(() => {
    trackPageView('invoices_page');
  }, [trackPageView]);
  
  // Handle refresh
  const handleRefresh = async () => {
    await refreshInvoices();
  };
  
  // Handle invoice cancellation
  const handleCancelInvoice = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
      const result = await cancelInvoice(invoiceId);
      if (result) {
        trackEvent({
          eventType: 'invoice_created',
          invoiceId,
          metadata: {
            action: 'cancel'
          }
        });
      }
    }
  };
  
  // Handle copy invoice link
  const handleCopyInvoiceLink = (invoiceId: string) => {
    const link = `${window.location.origin}/invoice/${invoiceId}`;
    navigator.clipboard.writeText(link);
    alert('Invoice link copied to clipboard!');
    
    trackEvent({
      eventType: 'invoice_created',
      invoiceId,
      metadata: {
        action: 'copy_link'
      }
    });
  };
  
  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      // Apply status filter
      if (statusFilter !== 'all' && invoice.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          invoice.id.toLowerCase().includes(searchLower) ||
          invoice.description?.toLowerCase().includes(searchLower) ||
          invoice.amount.toString().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      if (sortBy === 'amount') {
        return sortDirection === 'asc'
          ? parseFloat(a.amount) - parseFloat(b.amount)
          : parseFloat(b.amount) - parseFloat(a.amount);
      }
      
      // Sort by status
      const statusOrder = { PAID: 0, PENDING: 1, EXPIRED: 2, CANCELED: 3 };
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 4;
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 4;
      
      return sortDirection === 'asc' ? aOrder - bOrder : bOrder - aOrder;
    });
  
  // Toggle sort direction
  const handleSort = (newSortBy: 'date' | 'amount' | 'status') => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'PENDING':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'EXPIRED':
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
      case 'CANCELED':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-300">Manage and track your payment invoices</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              }
            >
              Refresh
            </Button>
            
            <Button
              onClick={() => router.push('/dashboard/invoices/create')}
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
            >
              Create Invoice
            </Button>
          </div>
        </div>
        
        <Card className="p-6 mb-6" glassmorphism>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full pl-10 pr-4 py-2 sm:text-sm border-gray-700 rounded-md"
                placeholder="Search invoices by ID, description, or amount"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex-shrink-0">
              <select
                className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full py-2 px-3 sm:text-sm border-gray-700 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELED">Canceled</option>
              </select>
            </div>
          </div>
        </Card>
        
        {/* Invoices Table */}
        <Card className="p-6" glassmorphism>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg p-4">
              <p className="text-red-300">Error loading invoices. Please try again.</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-300">No invoices found</h3>
              <p className="text-gray-400 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try changing your search or filter criteria'
                  : 'Create your first invoice to get started'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/dashboard/invoices/create')}
                  className="mt-4"
                  glassmorphism
                >
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      Invoice
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        <span>Amount</span>
                        {sortBy === 'amount' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        <span>Status</span>
                        {sortBy === 'status' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        <span>Date</span>
                        {sortBy === 'date' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            {sortDirection === 'asc' ? (
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            ) : (
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            )}
                          </svg>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-800 hover:bg-opacity-30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium">
                              {invoice.id.substring(0, 8)}...
                            </div>
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {invoice.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">
                          {parseFloat(invoice.amount).toFixed(2)} {invoice.currency}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${parseFloat(invoice.amountUsd).toFixed(2)} USD
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                        <div className="text-xs text-gray-400">
                          {new Date(invoice.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/invoice/${invoice.id}`)}
                            title="View Invoice"
                            aria-label="View Invoice"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyInvoiceLink(invoice.id)}
                            title="Copy Invoice Link"
                            aria-label="Copy Invoice Link"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                          </Button>
                          
                          {invoice.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvoice(invoice.id)}
                              title="Cancel Invoice"
                              aria-label="Cancel Invoice"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
