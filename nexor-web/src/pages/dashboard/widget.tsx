import React, { useState, useEffect } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { WidgetPreview } from '../../components/organisms/WidgetPreview';
import { useMerchantManagement } from '../../hooks/useMerchantManagement';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function WidgetCustomization() {
  // Mock merchant ID for development
  const merchantId = 'merch_123456';
  
  // Hooks for data fetching and analytics
  const { merchant, updateMerchant, loading } = useMerchantManagement(merchantId);
  const { trackEvent } = useAnalytics();
  
  // Widget customization state
  const [customization, setCustomization] = useState({
    primaryColor: '#673AB7',
    logoUrl: '',
    buttonStyle: 'rounded',
    supportedTokens: ['DOT', 'KSM', 'SOL', 'USDT', 'USDC'],
    defaultToken: 'DOT',
    modalTitle: 'Pay with Crypto',
    successRedirectUrl: '',
    cancelRedirectUrl: '',
  });
  
  // Load merchant customization settings when merchant data is available
  useEffect(() => {
    if (merchant?.widgetSettings) {
      setCustomization({
        ...customization,
        ...merchant.widgetSettings,
      });
    }
  }, [merchant]);
  
  // Handle input changes
  const handleInputChange = (key: string, value: string) => {
    setCustomization({
      ...customization,
      [key]: value,
    });
  };
  
  // Handle token selection
  const handleTokenToggle = (token: string) => {
    const supportedTokens = [...customization.supportedTokens];
    
    if (supportedTokens.includes(token)) {
      // Don't allow removing the default token
      if (token === customization.defaultToken) {
        return;
      }
      
      // Remove token
      const updatedTokens = supportedTokens.filter(t => t !== token);
      setCustomization({
        ...customization,
        supportedTokens: updatedTokens,
      });
    } else {
      // Add token
      setCustomization({
        ...customization,
        supportedTokens: [...supportedTokens, token],
      });
    }
  };
  
  // Handle default token change
  const handleDefaultTokenChange = (token: string) => {
    // Ensure the default token is in the supported tokens list
    const supportedTokens = [...customization.supportedTokens];
    if (!supportedTokens.includes(token)) {
      supportedTokens.push(token);
    }
    
    setCustomization({
      ...customization,
      defaultToken: token,
      supportedTokens,
    });
  };
  
  // Save customization settings
  const handleSave = async () => {
    try {
      await updateMerchant({
        widgetSettings: customization,
      });
      
      // Track event
      trackEvent('widget_customization_saved', {
        merchantId,
        primaryColor: customization.primaryColor,
        buttonStyle: customization.buttonStyle,
        supportedTokens: customization.supportedTokens,
      });
      
      // Show success message
      alert('Widget customization saved successfully!');
    } catch (error) {
      console.error('Error saving widget customization:', error);
      alert('Failed to save widget customization. Please try again.');
    }
  };
  
  // Available tokens for selection
  const availableTokens = [
    { symbol: 'DOT', name: 'Polkadot', network: 'Polkadot' },
    { symbol: 'KSM', name: 'Kusama', network: 'Kusama' },
    { symbol: 'GLMR', name: 'Moonbeam', network: 'Polkadot' },
    { symbol: 'ASTR', name: 'Astar', network: 'Polkadot' },
    { symbol: 'ACA', name: 'Acala', network: 'Polkadot' },
    { symbol: 'SOL', name: 'Solana', network: 'Solana' },
    { symbol: 'USDT', name: 'Tether', network: 'Multiple' },
    { symbol: 'USDC', name: 'USD Coin', network: 'Multiple' },
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Widget Customization</h1>
          <p className="text-gray-300">Personalize your payment widget to match your brand</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customization Options */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6" glassmorphism>
              <h2 className="text-xl font-semibold mb-6">Appearance</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={customization.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      glassmorphism
                      className="w-32"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Logo URL</label>
                  <Input
                    value={customization.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    glassmorphism
                    fullWidth
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended size: 200x200px. PNG or SVG with transparent background.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Button Style</label>
                  <div className="flex flex-wrap gap-3">
                    {['rounded', 'pill', 'square'].map((style) => (
                      <Button
                        key={style}
                        variant={customization.buttonStyle === style ? 'default' : 'outline'}
                        onClick={() => handleInputChange('buttonStyle', style)}
                        className={style === 'pill' ? 'rounded-full' : style === 'square' ? 'rounded-none' : ''}
                        glassmorphism
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Modal Title</label>
                  <Input
                    value={customization.modalTitle}
                    onChange={(e) => handleInputChange('modalTitle', e.target.value)}
                    placeholder="Pay with Crypto"
                    glassmorphism
                    fullWidth
                  />
                </div>
              </div>
            </Card>
            
            <Card className="p-6 mb-6" glassmorphism>
              <h2 className="text-xl font-semibold mb-6">Supported Tokens</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Tokens to Accept</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {availableTokens.map((token) => (
                      <div
                        key={token.symbol}
                        onClick={() => handleTokenToggle(token.symbol)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          customization.supportedTokens.includes(token.symbol)
                            ? 'border-primary bg-primary bg-opacity-10'
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center mr-2">
                            {token.symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{token.symbol}</div>
                            <div className="text-xs text-gray-400">{token.network}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Default Token</label>
                  <select
                    value={customization.defaultToken}
                    onChange={(e) => handleDefaultTokenChange(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {availableTokens
                      .filter(token => customization.supportedTokens.includes(token.symbol))
                      .map((token) => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.name} ({token.symbol})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </Card>
            
            <Card className="p-6" glassmorphism>
              <h2 className="text-xl font-semibold mb-6">Redirect URLs</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Success Redirect URL</label>
                  <Input
                    value={customization.successRedirectUrl}
                    onChange={(e) => handleInputChange('successRedirectUrl', e.target.value)}
                    placeholder="https://example.com/payment-success"
                    glassmorphism
                    fullWidth
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Where to redirect customers after successful payment (optional)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Cancel Redirect URL</label>
                  <Input
                    value={customization.cancelRedirectUrl}
                    onChange={(e) => handleInputChange('cancelRedirectUrl', e.target.value)}
                    placeholder="https://example.com/payment-cancelled"
                    glassmorphism
                    fullWidth
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Where to redirect customers if they cancel payment (optional)
                  </p>
                </div>
              </div>
            </Card>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="px-8"
                glassmorphism
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
          
          {/* Widget Preview */}
          <div>
            <div className="sticky top-8">
              <WidgetPreview
                merchantId={merchantId}
                customization={{
                  primaryColor: customization.primaryColor,
                  logoUrl: customization.logoUrl,
                  buttonStyle: customization.buttonStyle as any,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
