import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

interface SettingsFormData {
  name: string;
  email: string;
  webhookUrl: string;
  primaryColor: string;
  logoUrl: string;
  buttonStyle: string;
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsFormData>({
    name: 'Acme Corporation',
    email: 'payments@acmecorp.com',
    webhookUrl: 'https://acmecorp.com/api/webhooks/nexor',
    primaryColor: '#673AB7',
    logoUrl: 'https://acmecorp.com/logo.png',
    buttonStyle: 'rounded',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // In a real implementation, we would call our GraphQL API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRegenerateApiKey = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate your current key.')) {
      return;
    }
    
    setIsRegenerating(true);
    
    try {
      // In a real implementation, we would call our GraphQL API
      // For now, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('API key regenerated successfully. Please copy your new API key.');
    } catch (error) {
      console.error('Failed to regenerate API key:', error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-300">Configure your merchant account and payment widget</p>
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
                  className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors"
                >
                  Invoices
                </a>
                <a
                  href="/dashboard/settings"
                  className="block px-4 py-2 rounded-lg bg-purple-600 bg-opacity-50 transition-colors"
                >
                  Settings
                </a>
              </nav>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-6" glassmorphism>
              <h2 className="text-2xl font-semibold mb-6">Account Settings</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Business Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      glassmorphism
                      fullWidth
                    />
                    
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      glassmorphism
                      fullWidth
                    />
                  </div>
                </div>
                
                {/* API Keys */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  
                  <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Live API Key</label>
                        <div className="font-mono text-sm bg-gray-900 p-2 rounded">
                          sk_live_•••••••••••••••••••••••••••••
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateApiKey}
                        isLoading={isRegenerating}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Webhook Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Webhook Configuration</h3>
                  
                  <Input
                    label="Webhook URL"
                    name="webhookUrl"
                    value={formData.webhookUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/webhook"
                    glassmorphism
                    fullWidth
                  />
                  
                  <p className="text-sm text-gray-400">
                    We'll send payment notifications to this URL. Learn more about{' '}
                    <a href="/docs/webhooks" className="text-purple-400 hover:underline">
                      webhook events
                    </a>
                    .
                  </p>
                </div>
                
                {/* Widget Customization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Widget Customization</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Primary Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                        <Input
                          name="primaryColor"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          glassmorphism
                          fullWidth
                        />
                      </div>
                    </div>
                    
                    <Input
                      label="Logo URL"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      glassmorphism
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Style</label>
                    <select
                      name="buttonStyle"
                      value={formData.buttonStyle}
                      onChange={handleChange}
                      className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="rounded">Rounded</option>
                      <option value="pill">Pill</option>
                      <option value="square">Square</option>
                    </select>
                  </div>
                </div>
                
                {/* Save Button */}
                <div className="flex items-center justify-end space-x-4">
                  {saveSuccess && (
                    <span className="text-green-400">Settings saved successfully!</span>
                  )}
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSaving}
                    glassmorphism
                  >
                    Save Settings
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
