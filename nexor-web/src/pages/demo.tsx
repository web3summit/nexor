import React, { useState } from 'react';
import { NexorWidget } from '../widget';
import { Button } from '../components/atoms/Button';
import { Card } from '../components/atoms/Card';
import { Input } from '../components/atoms/Input';
import { Select } from '../components/atoms/Select';

export default function DemoPage() {
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('DOT');
  const [merchantId, setMerchantId] = useState('demo123');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Nexor Payment Widget Demo</h1>
          <p className="text-xl opacity-80">
            Experience seamless crypto payments with our embeddable widget
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Configuration Panel */}
          <Card className="p-6" glassmorphism>
            <h2 className="text-2xl font-semibold mb-6">Widget Configuration</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium mb-1">Merchant ID</label>
                <Input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="Your merchant ID"
                  fullWidth
                  glassmorphism
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Payment amount"
                  fullWidth
                  glassmorphism
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: 'DOT', label: 'DOT - Polkadot' },
                    { value: 'KSM', label: 'KSM - Kusama' },
                    { value: 'USDC', label: 'USDC - USD Coin' },
                    { value: 'USDT', label: 'USDT - Tether' },
                  ]}
                  fullWidth
                  glassmorphism
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Integration Options</h3>
              
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Modal Widget</h4>
                <pre className="text-xs overflow-x-auto p-3 bg-black bg-opacity-50 rounded">
                  {`<button 
  data-nexor-pay 
  data-merchant-id="${merchantId}"
  data-amount="${amount}"
  data-currency="${currency}"
>
  Pay with Crypto
</button>`}
                </pre>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => setShowModal(true)}
                >
                  Open Modal Widget
                </Button>
              </div>
              
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Embedded Widget</h4>
                <pre className="text-xs overflow-x-auto p-3 bg-black bg-opacity-50 rounded">
                  {`<div 
  data-nexor-widget 
  data-merchant-id="${merchantId}"
  data-amount="${amount}"
  data-currency="${currency}"
></div>`}
                </pre>
              </div>
              
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Script Tag</h4>
                <pre className="text-xs overflow-x-auto p-3 bg-black bg-opacity-50 rounded">
                  {`<script 
  src="https://nexor.io/widget/nexor-widget.js" 
  id="nexor-widget" 
  data-merchant-id="${merchantId}"
></script>`}
                </pre>
              </div>
            </div>
          </Card>
          
          {/* Embedded Widget Preview */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Embedded Widget Preview</h2>
            <NexorWidget
              merchantId={merchantId}
              amount={amount}
              currency={currency}
              onPaymentComplete={(txHash) => {
                console.log('Payment complete:', txHash);
                alert(`Payment complete! Transaction hash: ${txHash}`);
              }}
              onPaymentFailed={(error) => {
                console.error('Payment failed:', error);
                alert(`Payment failed: ${error.message}`);
              }}
            />
          </div>
        </div>
        
        {/* Documentation Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Integration Documentation</h2>
          
          <Card className="p-6" glassmorphism>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">Getting Started</h3>
                <p>
                  To integrate the Nexor payment widget into your website, you'll need a merchant account.
                  Sign up at <a href="#" className="text-blue-400 hover:underline">nexor.io/register</a> to get your merchant ID.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Installation</h3>
                <p className="mb-2">
                  Add the Nexor widget script to your website by adding the following code to your HTML:
                </p>
                <pre className="text-xs overflow-x-auto p-3 bg-black bg-opacity-50 rounded">
                  {`<script src="https://nexor.io/widget/nexor-widget.js" id="nexor-widget" data-merchant-id="YOUR_MERCHANT_ID"></script>`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Event Handling</h3>
                <p className="mb-2">
                  You can listen for payment events by adding event listeners:
                </p>
                <pre className="text-xs overflow-x-auto p-3 bg-black bg-opacity-50 rounded">
                  {`document.addEventListener('nexor:payment-complete', function(event) {
  console.log('Payment complete:', event.detail.txHash);
});

document.addEventListener('nexor:payment-failed', function(event) {
  console.log('Payment failed:', event.detail.error);
});`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">Customization</h3>
                <p>
                  You can customize the appearance of the widget by adding CSS variables to your website.
                  See the <a href="#" className="text-blue-400 hover:underline">documentation</a> for more details.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Modal Widget */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 hover:bg-opacity-20 transition-colors z-10"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <NexorWidget
              merchantId={merchantId}
              amount={amount}
              currency={currency}
              onClose={() => setShowModal(false)}
              onPaymentComplete={(txHash) => {
                console.log('Payment complete:', txHash);
                alert(`Payment complete! Transaction hash: ${txHash}`);
                setShowModal(false);
              }}
              onPaymentFailed={(error) => {
                console.error('Payment failed:', error);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
