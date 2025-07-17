import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices' | 'settings'>('payments');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Nexor Merchant Dashboard</h1>
          <p className="text-gray-300">Manage your crypto payments</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4" glassmorphism>
              <nav className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'payments' ? 'bg-purple-600 bg-opacity-50' : 'hover:bg-gray-700 hover:bg-opacity-30'
                  }`}
                  onClick={() => setActiveTab('payments')}
                >
                  Payments
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'invoices' ? 'bg-purple-600 bg-opacity-50' : 'hover:bg-gray-700 hover:bg-opacity-30'
                  }`}
                  onClick={() => setActiveTab('invoices')}
                >
                  Invoices
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-purple-600 bg-opacity-50' : 'hover:bg-gray-700 hover:bg-opacity-30'
                  }`}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'payments' && (
              <Card className="p-6" glassmorphism>
                <h2 className="text-2xl font-semibold mb-6">Recent Payments</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4">pay_123456</td>
                        <td className="py-3 px-4">2025-07-16</td>
                        <td className="py-3 px-4">100 DOT</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
                            Completed
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4">pay_123457</td>
                        <td className="py-3 px-4">2025-07-15</td>
                        <td className="py-3 px-4">50 KSM</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-yellow-500 bg-opacity-20 text-yellow-300 rounded-full text-xs">
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'invoices' && (
              <Card className="p-6" glassmorphism>
                <h2 className="text-2xl font-semibold mb-6">Invoices</h2>
                <div className="flex justify-end mb-4">
                  <Button variant="primary" size="sm">
                    Create Invoice
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4">inv_123456</td>
                        <td className="py-3 px-4">2025-07-16</td>
                        <td className="py-3 px-4">$500</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-xs">
                            Paid
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-700">
                        <td className="py-3 px-4">inv_123457</td>
                        <td className="py-3 px-4">2025-07-15</td>
                        <td className="py-3 px-4">$250</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-300 rounded-full text-xs">
                            Unpaid
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {activeTab === 'settings' && (
              <Card className="p-6" glassmorphism>
                <h2 className="text-2xl font-semibold mb-6">Widget Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">API Keys</h3>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm">sk_live_•••••••••••••••••••••••••••••</div>
                        <Button variant="outline" size="sm">
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Widget Customization</h3>
                    <p className="text-gray-300 mb-4">
                      Customize the appearance of your payment widget
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Primary Color</label>
                        <input type="color" className="w-full h-10 rounded-lg" defaultValue="#673AB7" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Logo URL</label>
                        <input 
                          type="text" 
                          className="w-full p-2 bg-gray-800 rounded-lg" 
                          placeholder="https://example.com/logo.png" 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Webhook URL</h3>
                    <input 
                      type="text" 
                      className="w-full p-2 bg-gray-800 rounded-lg" 
                      placeholder="https://example.com/webhook" 
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      We'll send payment notifications to this URL
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="primary">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
