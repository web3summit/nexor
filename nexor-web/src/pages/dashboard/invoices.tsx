import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  currency: string;
  description: string;
  status: 'pending' | 'paid' | 'expired' | 'canceled';
  paymentId?: string;
  expiresAt: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock invoices data
  const mockInvoices: Invoice[] = [
    {
      id: 'inv_123456',
      date: '2025-07-16T14:30:00Z',
      amount: '500.00',
      currency: 'USD',
      description: 'Website development services',
      status: 'paid',
      paymentId: 'pay_123456',
      expiresAt: '2025-08-16T14:30:00Z',
    },
    {
      id: 'inv_123457',
      date: '2025-07-15T10:15:00Z',
      amount: '1200.00',
      currency: 'USD',
      description: 'Monthly subscription',
      status: 'pending',
      expiresAt: '2025-08-15T10:15:00Z',
    },
    {
      id: 'inv_123458',
      date: '2025-07-14T08:45:00Z',
      amount: '750.00',
      currency: 'USD',
      description: 'Consulting services',
      status: 'paid',
      paymentId: 'pay_123458',
      expiresAt: '2025-08-14T08:45:00Z',
    },
    {
      id: 'inv_123459',
      date: '2025-07-13T16:20:00Z',
      amount: '300.00',
      currency: 'USD',
      description: 'Product purchase',
      status: 'expired',
      expiresAt: '2025-07-20T16:20:00Z',
    },
    {
      id: 'inv_123460',
      date: '2025-07-12T09:10:00Z',
      amount: '1500.00',
      currency: 'USD',
      description: 'Annual license fee',
      status: 'canceled',
      expiresAt: '2025-08-12T09:10:00Z',
    },
  ];

  // Filter invoices based on search term, status, and date range
  const filteredInvoices = mockInvoices.filter((invoice) => {
    // Filter by search term
    const searchMatch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.paymentId && invoice.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;

    // Filter by date range
    let dateMatch = true;
    if (dateRange.start) {
      dateMatch = dateMatch && new Date(invoice.date) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      dateMatch = dateMatch && new Date(invoice.date) <= new Date(dateRange.end);
    }

    return searchMatch && statusMatch && dateMatch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Invoice['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 bg-opacity-20 text-yellow-300';
      case 'paid':
        return 'bg-green-500 bg-opacity-20 text-green-300';
      case 'expired':
        return 'bg-red-500 bg-opacity-20 text-red-300';
      case 'canceled':
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-300';
    }
  };

  // Create invoice form
  const CreateInvoiceForm = () => {
    const [formData, setFormData] = useState({
      amount: '',
      currency: 'USD',
      description: '',
      expiresIn: '30', // days
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // In a real implementation, we would call our GraphQL API
      // For now, we'll just close the modal
      setShowCreateModal(false);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          required
          glassmorphism
          fullWidth
        />
        
        <div>
          <label className="block text-sm font-medium mb-1">Currency</label>
          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>
        </div>
        
        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          glassmorphism
          fullWidth
        />
        
        <div>
          <label className="block text-sm font-medium mb-1">Expires In (Days)</label>
          <select
            name="expiresIn"
            value={formData.expiresIn}
            onChange={handleChange}
            className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowCreateModal(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" glassmorphism>
            Create Invoice
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-gray-300">Create and manage your payment invoices</p>
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
                  className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                >
                  Payments
                </a>
                <a
                  href="/dashboard/invoices"
                  className="block px-4 py-2 rounded-lg bg-purple-600 bg-opacity-50 transition-colors"
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
                    <option value="paid">Paid</option>
                    <option value="expired">Expired</option>
                    <option value="canceled">Canceled</option>
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
                <h2 className="text-2xl font-semibold">Invoice List</h2>
                
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="w-full md:w-64">
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      glassmorphism
                      fullWidth
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    glassmorphism
                  >
                    Create Invoice
                  </Button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Description</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-700">
                          <td className="py-3 px-4 font-mono text-sm">{invoice.id}</td>
                          <td className="py-3 px-4">{formatDate(invoice.date)}</td>
                          <td className="py-3 px-4">
                            {invoice.amount} {invoice.currency}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            {invoice.description}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                invoice.status
                              )}`}
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              {invoice.status === 'pending' && (
                                <Button variant="outline" size="sm">
                                  Share
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No invoices found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Showing {filteredInvoices.length} of {mockInvoices.length} invoices
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

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <Card className="w-full max-w-md p-6" glassmorphism>
            <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
            <CreateInvoiceForm />
          </Card>
        </div>
      )}
    </div>
  );
}
