import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

interface Payment {
  id: string;
  date: string;
  amount: string;
  tokenSymbol: string;
  amountUsd: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceAddress: string;
  txHash?: string;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Mock payments data
  const mockPayments: Payment[] = [
    {
      id: 'pay_123456',
      date: '2025-07-16T14:30:00Z',
      amount: '100',
      tokenSymbol: 'DOT',
      amountUsd: '523.00',
      status: 'completed',
      sourceAddress: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    {
      id: 'pay_123457',
      date: '2025-07-15T10:15:00Z',
      amount: '50',
      tokenSymbol: 'KSM',
      amountUsd: '1072.50',
      status: 'processing',
      sourceAddress: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    },
    {
      id: 'pay_123458',
      date: '2025-07-14T08:45:00Z',
      amount: '1000',
      tokenSymbol: 'USDT',
      amountUsd: '1000.00',
      status: 'completed',
      sourceAddress: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
      txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    },
    {
      id: 'pay_123459',
      date: '2025-07-13T16:20:00Z',
      amount: '25',
      tokenSymbol: 'SOL',
      amountUsd: '1094.50',
      status: 'failed',
      sourceAddress: '5sgLNHECeYXJUHN12CGNgwJUNd8DimhYYgRhBiRyJGdT',
    },
    {
      id: 'pay_123460',
      date: '2025-07-12T09:10:00Z',
      amount: '500',
      tokenSymbol: 'USDC',
      amountUsd: '500.00',
      status: 'pending',
      sourceAddress: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    },
  ];

  // Filter payments based on search term, status, and date range
  const filteredPayments = mockPayments.filter((payment) => {
    // Filter by search term
    const searchMatch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.sourceAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.txHash && payment.txHash.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const statusMatch = statusFilter === 'all' || payment.status === statusFilter;

    // Filter by date range
    let dateMatch = true;
    if (dateRange.start) {
      dateMatch = dateMatch && new Date(payment.date) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      dateMatch = dateMatch && new Date(payment.date) <= new Date(dateRange.end);
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'processing':
        return 'bg-blue-500 bg-opacity-20 text-blue-300';
      case 'completed':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'failed':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-gray-300">View and manage your payment transactions</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4" glassmorphism>
              <nav className="space-y-2">
                <a
                  href="/dashboard"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                >
                  Dashboard
                </a>
                <a
                  href="/dashboard/payments"
                  className="block px-4 py-2 rounded-lg bg-purple-600 bg-opacity-50 transition-colors"
                >
                  Payments
                </a>
                <a
                  href="/dashboard/invoices"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                >
                  Invoices
                </a>
                <a
                  href="/dashboard/settings"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                >
                  Settings
                </a>
              </nav>
            </Card>

            {/* Filters */}
            <Card className="p-4 mt-4" glassmorphism>
              <h3 className="text-lg font-medium mb-4">Filters</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Date Range</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      placeholder="From"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      glassmorphism
                      fullWidth
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      glassmorphism
                      fullWidth
                    />
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateRange({ start: '', end: '' });
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6" glassmorphism>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Payment Transactions</h2>
                
                <div className="w-full md:w-64">
                  <Input
                    placeholder="Search by ID, address, hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    glassmorphism
                    fullWidth
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">USD Value</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-700">
                          <td className="py-3 px-4 font-mono text-sm">{payment.id}</td>
                          <td className="py-3 px-4">{formatDate(payment.date)}</td>
                          <td className="py-3 px-4">
                            {payment.amount} {payment.tokenSymbol}
                          </td>
                          <td className="py-3 px-4">${payment.amountUsd}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                payment.status
                              )}`}
                            >
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No payments found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing {filteredPayments.length} of {mockPayments.length} payments
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
