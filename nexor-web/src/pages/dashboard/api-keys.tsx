import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { useMerchantManagement } from '../../hooks/useMerchantManagement';
import { useAnalytics } from '../../hooks/useAnalytics';
import { motion } from 'framer-motion';

export default function ApiKeysPage() {
  // Mock merchant ID for development
  const merchantId = 'merch_123456';
  
  // Hooks for data fetching and analytics
  const { merchant, regenerateApiKey, loading } = useMerchantManagement(merchantId);
  const { trackEvent } = useAnalytics();
  
  // State for API key visibility and webhook settings
  const [showApiKey, setShowApiKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(merchant?.webhookUrl || '');
  const [webhookSecret, setWebhookSecret] = useState(merchant?.webhookSecret || '');
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [regenerateConfirm, setRegenerateConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Handle regenerate API key
  const handleRegenerateApiKey = async () => {
    if (!regenerateConfirm) {
      setRegenerateConfirm(true);
      return;
    }
    
    try {
      await regenerateApiKey();
      setShowApiKey(true);
      setRegenerateConfirm(false);
      
      // Track event
      trackEvent('api_key_regenerated', {
        merchantId,
      });
      
      // Show success message temporarily
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error regenerating API key:', error);
      alert('Failed to regenerate API key. Please try again.');
      setRegenerateConfirm(false);
    }
  };
  
  // Handle save webhook settings
  const handleSaveWebhook = async () => {
    try {
      await useMerchantManagement(merchantId).updateMerchant({
        webhookUrl,
        webhookSecret,
      });
      
      // Track event
      trackEvent('webhook_settings_updated', {
        merchantId,
        hasWebhook: !!webhookUrl,
      });
      
      // Show success message temporarily
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving webhook settings:', error);
      alert('Failed to save webhook settings. Please try again.');
    }
  };
  
  // Format API key for display
  const formatApiKey = (key: string) => {
    if (!key) return '';
    if (!showApiKey) {
      return '•'.repeat(24);
    }
    return key;
  };
  
  // Format webhook secret for display
  const formatWebhookSecret = (secret: string) => {
    if (!secret) return '';
    if (!showWebhookSecret) {
      return '•'.repeat(16);
    }
    return secret;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">API Keys & Webhooks</h1>
          <p className="text-gray-300">Manage your API credentials and webhook settings</p>
        </div>
        
        {/* Success Message */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-30 rounded-lg p-4 text-green-300"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Settings saved successfully!</span>
            </div>
          </motion.div>
        )}
        
        {/* API Key Section */}
        <Card className="p-6 mb-8" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">API Key</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Your API Key</label>
              <div className="flex items-center space-x-3">
                <Input
                  value={formatApiKey(merchant?.apiKey || '')}
                  readOnly
                  glassmorphism
                  className="font-mono flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowApiKey(!showApiKey)}
                  glassmorphism
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (merchant?.apiKey) {
                      navigator.clipboard.writeText(merchant.apiKey);
                      alert('API key copied to clipboard!');
                    }
                  }}
                  glassmorphism
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Keep this key secret! It provides full access to your merchant account.
              </p>
            </div>
            
            <div>
              <Button
                variant={regenerateConfirm ? 'danger' : 'outline'}
                onClick={handleRegenerateApiKey}
                disabled={loading}
                glassmorphism
              >
                {regenerateConfirm ? 'Confirm Regenerate Key' : 'Regenerate API Key'}
              </Button>
              {regenerateConfirm && (
                <p className="text-sm text-red-300 mt-2">
                  Warning: Regenerating your API key will invalidate your current key.
                  All applications using the old key will stop working.
                </p>
              )}
            </div>
          </div>
        </Card>
        
        {/* Webhook Settings */}
        <Card className="p-6 mb-8" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">Webhook Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/webhook"
                glassmorphism
                fullWidth
              />
              <p className="text-xs text-gray-400 mt-1">
                We'll send payment events to this URL. Leave blank to disable webhooks.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Webhook Secret</label>
              <div className="flex items-center space-x-3">
                <Input
                  value={formatWebhookSecret(webhookSecret)}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  type={showWebhookSecret ? 'text' : 'password'}
                  placeholder="Enter a secret key"
                  glassmorphism
                  className="flex-grow"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  glassmorphism
                >
                  {showWebhookSecret ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Used to verify webhook requests are coming from us. We'll include this in the X-Webhook-Signature header.
              </p>
            </div>
            
            <div>
              <Button
                onClick={handleSaveWebhook}
                disabled={loading}
                glassmorphism
              >
                Save Webhook Settings
              </Button>
            </div>
          </div>
        </Card>
        
        {/* API Documentation */}
        <Card className="p-6" glassmorphism>
          <h2 className="text-xl font-semibold mb-6">API Documentation</h2>
          
          <div className="space-y-6">
            <div>
              <p className="mb-4">
                Our API allows you to programmatically create invoices, check payment statuses, and manage your merchant settings.
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
{`// Example: Create an invoice
curl -X POST https://api.nexor.io/v1/invoices \\
  -H "Authorization: Bearer ${merchant?.apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": "100.00",
    "currency": "USD",
    "description": "Premium subscription",
    "customerEmail": "customer@example.com"
  }'`}
              </div>
              
              <Button
                as="a"
                href="/docs/api"
                target="_blank"
                variant="outline"
                glassmorphism
              >
                View Full API Documentation
              </Button>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
              <h3 className="font-semibold mb-3">Webhook Events</h3>
              
              <p className="mb-4">
                Webhooks allow you to receive real-time updates when events happen in your account.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-4">Event</th>
                      <th className="text-left py-2 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4 font-mono text-sm">payment.created</td>
                      <td className="py-2 px-4">A new payment has been initiated</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4 font-mono text-sm">payment.processing</td>
                      <td className="py-2 px-4">Payment transaction is being processed</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4 font-mono text-sm">payment.completed</td>
                      <td className="py-2 px-4">Payment has been completed successfully</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4 font-mono text-sm">payment.failed</td>
                      <td className="py-2 px-4">Payment has failed</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4 font-mono text-sm">invoice.created</td>
                      <td className="py-2 px-4">A new invoice has been created</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 font-mono text-sm">invoice.paid</td>
                      <td className="py-2 px-4">An invoice has been paid</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
