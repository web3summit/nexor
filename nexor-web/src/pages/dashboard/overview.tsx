import React, { useState, useEffect } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { PaymentHistory } from '../../components/organisms/PaymentHistory';
import { usePaymentHistory } from '../../hooks/usePaymentHistory';
import { useMerchantManagement } from '../../hooks/useMerchantManagement';
import { useInvoiceManagement } from '../../hooks/useInvoiceManagement';
import Link from 'next/link';

export default function DashboardOverview() {
  // Mock merchant ID for development
  const merchantId = 'merch_123456';
  
  // Hooks for data fetching
  const { merchant, loading: merchantLoading } = useMerchantManagement(merchantId);
  const { payments, loading: paymentsLoading, refreshPayments } = usePaymentHistory(merchantId);
  const { invoices, loading: invoicesLoading } = useInvoiceManagement(merchantId);
  
  // Stats
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalVolume: 0,
    successRate: 0,
    pendingPayments: 0,
  });
  
  // Calculate stats when payments change
  useEffect(() => {
    if (payments.length > 0) {
      const totalPayments = payments.length;
      const totalVolume = payments.reduce((sum, payment) => sum + parseFloat(payment.amountUsd), 0);
      const completedPayments = payments.filter(p => p.status === 'completed').length;
      const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;
      const pendingPayments = payments.filter(p => p.status === 'pending').length;
      
      setStats({
        totalPayments,
        totalVolume,
        successRate,
        pendingPayments,
      });
    }
  }, [payments]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-300">Welcome back, {merchant?.name || 'Merchant'}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              as={Link}
              href="/dashboard/settings"
              variant="outline"
              glassmorphism
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              }
            >
              Settings
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6" glassmorphism>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Volume</p>
                <h3 className="text-2xl font-bold">${stats.totalVolume.toFixed(2)}</h3>
              </div>
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6" glassmorphism>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Payments</p>
                <h3 className="text-2xl font-bold">{stats.totalPayments}</h3>
              </div>
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6" glassmorphism>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <h3 className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</h3>
              </div>
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
          
          <Card className="p-6" glassmorphism>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Payments</p>
                <h3 className="text-2xl font-bold">{stats.pendingPayments}</h3>
              </div>
              <div className="bg-yellow-500 bg-opacity-20 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Recent Payments */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Payments</h2>
            <Button
              as={Link}
              href="/dashboard/payments"
              variant="ghost"
              glassmorphism
            >
              View All
            </Button>
          </div>
          
          <PaymentHistory
            payments={payments.slice(0, 5)}
            loading={paymentsLoading}
            onRefresh={refreshPayments}
          />
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:bg-white/5 transition-colors cursor-pointer" glassmorphism>
              <Link href="/dashboard/invoices/new" className="flex flex-col items-center text-center">
                <div className="bg-purple-500 bg-opacity-20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Create Invoice</h3>
                <p className="text-sm text-gray-400">Generate a new payment invoice</p>
              </Link>
            </Card>
            
            <Card className="p-6 hover:bg-white/5 transition-colors cursor-pointer" glassmorphism>
              <Link href="/dashboard/widget" className="flex flex-col items-center text-center">
                <div className="bg-blue-500 bg-opacity-20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Customize Widget</h3>
                <p className="text-sm text-gray-400">Personalize your payment widget</p>
              </Link>
            </Card>
            
            <Card className="p-6 hover:bg-white/5 transition-colors cursor-pointer" glassmorphism>
              <Link href="/docs/widget-integration" className="flex flex-col items-center text-center">
                <div className="bg-green-500 bg-opacity-20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">Integration Guide</h3>
                <p className="text-sm text-gray-400">Learn how to add the widget</p>
              </Link>
            </Card>
            
            <Card className="p-6 hover:bg-white/5 transition-colors cursor-pointer" glassmorphism>
              <Link href="/dashboard/api-keys" className="flex flex-col items-center text-center">
                <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-1">API Keys</h3>
                <p className="text-sm text-gray-400">Manage your API credentials</p>
              </Link>
            </Card>
          </div>
        </div>
        
        {/* Recent Invoices */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Invoices</h2>
            <Button
              as={Link}
              href="/dashboard/invoices"
              variant="ghost"
              glassmorphism
            >
              View All
            </Button>
          </div>
          
          <Card className="p-6" glassmorphism>
            {invoicesLoading ? (
              <div className="flex justify-center items-center py-12">
                <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-400">No invoices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">Invoice ID</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-700 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/invoices/${invoice.id}`} className="hover:text-primary">
                            {invoice.id.substring(0, 8)}...
                          </Link>
                        </td>
                        <td className="py-3 px-4">{invoice.description || 'N/A'}</td>
                        <td className="py-3 px-4">${invoice.amountUsd}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            invoice.status === 'PAID' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                            invoice.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
                            invoice.status === 'EXPIRED' ? 'bg-gray-500 bg-opacity-20 text-gray-300' :
                            'bg-red-500 bg-opacity-20 text-red-300'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
