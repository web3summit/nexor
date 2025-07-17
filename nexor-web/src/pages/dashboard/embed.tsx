import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { useMerchantManagement } from '../../hooks/useMerchantManagement';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function EmbedPage() {
  const merchantId = 'merch_123456'; // Mock merchant ID for development
  
  // Hooks
  const { merchant } = useMerchantManagement(merchantId);
  const { trackPageView, trackEvent } = useAnalytics(merchantId);
  
  // State
  const [selectedIntegration, setSelectedIntegration] = useState<'direct' | 'react' | 'vue' | 'angular' | 'shopify'>('direct');
  const [customAmount, setCustomAmount] = useState('');
  const [fixedAmount, setFixedAmount] = useState('99.99');
  const [amountType, setAmountType] = useState<'fixed' | 'custom'>('fixed');
  const [buttonText, setButtonText] = useState('Pay with Crypto');
  const [buttonStyle, setButtonStyle] = useState<'default' | 'outline' | 'minimal'>('default');
  const [showPreview, setShowPreview] = useState(true);
  
  // Track page view
  useEffect(() => {
    trackPageView('embed_page');
  }, [trackPageView]);
  
  // Generate embed code based on selected options
  const generateEmbedCode = () => {
    const apiKey = merchant?.apiKey || 'YOUR_API_KEY';
    const amount = amountType === 'fixed' ? fixedAmount : 'DYNAMIC_AMOUNT';
    
    switch (selectedIntegration) {
      case 'direct':
        return `<!-- Nexor Payment Widget -->
<script src="https://cdn.nexorpay.com/v1/widget.js"></script>

<button 
  id="nexor-payment-button"
  class="nexor-btn nexor-btn-${buttonStyle}"
>
  ${buttonText}
</button>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const nexorPay = new NexorPay('${apiKey}');
    
    document.getElementById('nexor-payment-button').addEventListener('click', function() {
      nexorPay.openPaymentModal({
        amount: ${amountType === 'fixed' ? fixedAmount : 'getAmountFromYourForm()'},
        currency: 'USD',
        onSuccess: function(payment) {
          console.log('Payment successful!', payment);
          // Handle successful payment
        },
        onCancel: function() {
          console.log('Payment cancelled');
          // Handle cancelled payment
        },
        onError: function(error) {
          console.error('Payment error:', error);
          // Handle payment error
        }
      });
    });
  });
</script>`;

      case 'react':
        return `// Install the package
// npm install @nexorpay/react

import { NexorPayButton } from '@nexorpay/react';

function CheckoutPage() {
  const handlePaymentSuccess = (payment) => {
    console.log('Payment successful!', payment);
    // Handle successful payment
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    // Handle cancelled payment
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Handle payment error
  };

  return (
    <NexorPayButton
      apiKey="${apiKey}"
      amount={${amount}}
      currency="USD"
      buttonText="${buttonText}"
      buttonStyle="${buttonStyle}"
      onSuccess={handlePaymentSuccess}
      onCancel={handlePaymentCancel}
      onError={handlePaymentError}
    />
  );
}`;

      case 'vue':
        return `<!-- Install the package -->
<!-- npm install @nexorpay/vue -->

<template>
  <NexorPayButton
    apiKey="${apiKey}"
    :amount="${amount}"
    currency="USD"
    buttonText="${buttonText}"
    buttonStyle="${buttonStyle}"
    @success="handlePaymentSuccess"
    @cancel="handlePaymentCancel"
    @error="handlePaymentError"
  />
</template>

<script>
import { NexorPayButton } from '@nexorpay/vue';

export default {
  components: {
    NexorPayButton
  },
  methods: {
    handlePaymentSuccess(payment) {
      console.log('Payment successful!', payment);
      // Handle successful payment
    },
    handlePaymentCancel() {
      console.log('Payment cancelled');
      // Handle cancelled payment
    },
    handlePaymentError(error) {
      console.error('Payment error:', error);
      // Handle payment error
    }
  }
};
</script>`;

      case 'angular':
        return `// Install the package
// npm install @nexorpay/angular

// In your module
import { NexorPayModule } from '@nexorpay/angular';

@NgModule({
  imports: [
    NexorPayModule.forRoot('${apiKey}')
  ]
})
export class AppModule { }

// In your component template
<nexor-pay-button
  [amount]="${amount}"
  currency="USD"
  buttonText="${buttonText}"
  buttonStyle="${buttonStyle}"
  (success)="handlePaymentSuccess($event)"
  (cancel)="handlePaymentCancel()"
  (error)="handlePaymentError($event)">
</nexor-pay-button>

// In your component class
handlePaymentSuccess(payment: any) {
  console.log('Payment successful!', payment);
  // Handle successful payment
}

handlePaymentCancel() {
  console.log('Payment cancelled');
  // Handle cancelled payment
}

handlePaymentError(error: any) {
  console.error('Payment error:', error);
  // Handle payment error
}`;

      case 'shopify':
        return `<!-- Add this to your theme's product-template.liquid file -->

{% if product.available %}
  <div id="nexor-payment-button" class="shopify-payment-button"></div>
  
  <script src="https://cdn.nexorpay.com/v1/shopify.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const nexorShopify = new NexorShopify({
        apiKey: '${apiKey}',
        buttonText: '${buttonText}',
        buttonStyle: '${buttonStyle}'
      });
      
      nexorShopify.init({
        productId: {{ product.id | json }},
        variantId: {{ product.selected_or_first_available_variant.id | json }},
        price: {{ product.selected_or_first_available_variant.price | money_without_currency | json }}
      });
    });
  </script>
{% endif %}`;

      default:
        return '';
    }
  };
  
  // Copy embed code to clipboard
  const handleCopyCode = () => {
    const code = generateEmbedCode();
    navigator.clipboard.writeText(code);
    
    // Track event
    trackEvent({
      eventType: 'embed_code_copied',
      metadata: {
        integration: selectedIntegration,
        amountType
      }
    });
    
    // Show toast or alert
    alert('Embed code copied to clipboard!');
  };
  
  // Handle preview toggle
  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Embed Payment Widget</h1>
          <p className="text-gray-300">Generate code to embed the payment widget in your website</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6" glassmorphism>
              <h2 className="text-xl font-semibold mb-6">Widget Configuration</h2>
              
              {/* Integration Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Integration Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <Button
                    variant={selectedIntegration === 'direct' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedIntegration('direct')}
                    glassmorphism={selectedIntegration === 'direct'}
                    fullWidth
                  >
                    HTML/JS
                  </Button>
                  <Button
                    variant={selectedIntegration === 'react' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedIntegration('react')}
                    glassmorphism={selectedIntegration === 'react'}
                    fullWidth
                  >
                    React
                  </Button>
                  <Button
                    variant={selectedIntegration === 'vue' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedIntegration('vue')}
                    glassmorphism={selectedIntegration === 'vue'}
                    fullWidth
                  >
                    Vue
                  </Button>
                  <Button
                    variant={selectedIntegration === 'angular' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedIntegration('angular')}
                    glassmorphism={selectedIntegration === 'angular'}
                    fullWidth
                  >
                    Angular
                  </Button>
                  <Button
                    variant={selectedIntegration === 'shopify' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedIntegration('shopify')}
                    glassmorphism={selectedIntegration === 'shopify'}
                    fullWidth
                  >
                    Shopify
                  </Button>
                </div>
              </div>
              
              {/* Amount Configuration */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Amount</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="fixed-amount"
                      name="amount-type"
                      checked={amountType === 'fixed'}
                      onChange={() => setAmountType('fixed')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                    />
                    <label htmlFor="fixed-amount" className="text-sm text-gray-300">Fixed Amount</label>
                    
                    {amountType === 'fixed' && (
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          value={fixedAmount}
                          onChange={(e) => setFixedAmount(e.target.value)}
                          className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full pl-7 pr-4 py-2 sm:text-sm border-gray-700 rounded-md"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="custom-amount"
                      name="amount-type"
                      checked={amountType === 'custom'}
                      onChange={() => setAmountType('custom')}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-600 bg-gray-700"
                    />
                    <label htmlFor="custom-amount" className="text-sm text-gray-300">Dynamic Amount</label>
                    
                    {amountType === 'custom' && (
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full px-4 py-2 sm:text-sm border-gray-700 rounded-md"
                          placeholder="e.g., getCartTotal()"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Button Customization */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Button Text</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  className="bg-gray-800 bg-opacity-50 focus:ring-primary focus:border-primary block w-full px-4 py-2 sm:text-sm border-gray-700 rounded-md"
                  placeholder="Pay with Crypto"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Button Style</label>
                <div className="grid grid-cols-3 gap-4">
                  <div
                    className={`border rounded-md p-4 cursor-pointer transition-all ${
                      buttonStyle === 'default'
                        ? 'border-primary bg-primary bg-opacity-20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setButtonStyle('default')}
                  >
                    <div className="h-10 bg-primary rounded-md flex items-center justify-center text-white text-sm">
                      Default
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-md p-4 cursor-pointer transition-all ${
                      buttonStyle === 'outline'
                        ? 'border-primary bg-primary bg-opacity-20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setButtonStyle('outline')}
                  >
                    <div className="h-10 bg-transparent border border-primary rounded-md flex items-center justify-center text-primary text-sm">
                      Outline
                    </div>
                  </div>
                  
                  <div
                    className={`border rounded-md p-4 cursor-pointer transition-all ${
                      buttonStyle === 'minimal'
                        ? 'border-primary bg-primary bg-opacity-20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setButtonStyle('minimal')}
                  >
                    <div className="h-10 bg-transparent flex items-center justify-center text-primary text-sm underline">
                      Minimal
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Generated Code */}
            <Card className="p-6" glassmorphism>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated Code</h2>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  glassmorphism
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  }
                >
                  Copy Code
                </Button>
              </div>
              
              <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                  {generateEmbedCode()}
                </pre>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                <p>
                  Need help with integration? Check out our{' '}
                  <a href="/docs/integration" className="text-primary hover:underline">
                    integration guide
                  </a>{' '}
                  or{' '}
                  <a href="/support" className="text-primary hover:underline">
                    contact support
                  </a>
                  .
                </p>
              </div>
            </Card>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8" glassmorphism>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Preview</h2>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePreview}
                >
                  {showPreview ? 'Hide' : 'Show'}
                </Button>
              </div>
              
              {showPreview && (
                <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-6 border border-white border-opacity-10">
                  <div className="mb-6">
                    <div className="w-full h-4 bg-gray-700 bg-opacity-50 rounded mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-700 bg-opacity-50 rounded"></div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="w-full h-20 bg-gray-700 bg-opacity-50 rounded"></div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="w-1/3 h-4 bg-gray-700 bg-opacity-50 rounded"></div>
                      <div className="w-1/4 h-4 bg-gray-700 bg-opacity-50 rounded"></div>
                    </div>
                    <div className="w-full h-4 bg-gray-700 bg-opacity-50 rounded"></div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-3 px-4 rounded-md flex items-center justify-center cursor-pointer
                      ${buttonStyle === 'default' ? 'bg-primary text-white' : 
                        buttonStyle === 'outline' ? 'bg-transparent border border-primary text-primary' :
                        'bg-transparent text-primary underline'}
                    `}
                  >
                    <span className="mr-2">{buttonText}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                  
                  <div className="mt-6">
                    <div className="w-full h-4 bg-gray-700 bg-opacity-50 rounded mb-2"></div>
                    <div className="w-2/3 h-4 bg-gray-700 bg-opacity-50 rounded"></div>
                  </div>
                </div>
              )}
              
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Integration Tips</h3>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      Place the button near your checkout or payment options.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      Test the integration in a development environment first.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      Implement proper success and error handling for the best user experience.
                    </p>
                  </div>
                  
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-300">
                      Set up webhooks to receive real-time payment notifications.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
