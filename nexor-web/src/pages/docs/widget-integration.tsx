import React, { useState } from 'react';
import { Card } from '../../components/atoms/Card';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';

export default function WidgetIntegrationPage() {
  const [primaryColor, setPrimaryColor] = useState('#673AB7');
  const [buttonStyle, setButtonStyle] = useState('rounded');
  const [buttonText, setButtonText] = useState('Pay with Crypto');
  const [modalMode, setModalMode] = useState(true);
  
  // Generate code snippets based on selected options
  const generateScriptTag = () => {
    return `<script src="https://cdn.nexor.io/widget.js" async></script>`;
  };
  
  const generateButtonCode = () => {
    return `<button 
  data-nexor-button 
  data-primary-color="${primaryColor}"
  data-button-style="${buttonStyle}"
  data-modal="${modalMode ? 'true' : 'false'}"
>
  ${buttonText}
</button>`;
  };
  
  const generateInitCode = () => {
    return `<div id="nexor-container"></div>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    NexorWidget.init({
      apiKey: 'YOUR_API_KEY',
      container: document.getElementById('nexor-container'),
      primaryColor: '${primaryColor}',
      buttonStyle: '${buttonStyle}',
      modal: ${modalMode},
      onPaymentSuccess: function(paymentId, txHash) {
        console.log('Payment successful!', paymentId, txHash);
      },
      onPaymentFailure: function(error) {
        console.error('Payment failed:', error);
      }
    });
  });
</script>`;
  };
  
  const generateProgrammaticCode = () => {
    return `// Open the payment widget programmatically
NexorWidget.openPayment({
  amount: '100',
  currency: 'USD',
  description: 'Premium Subscription',
  merchantId: 'YOUR_MERCHANT_ID',
  onSuccess: function(paymentId, txHash) {
    console.log('Payment successful!', paymentId, txHash);
  },
  onFailure: function(error) {
    console.error('Payment failed:', error);
  }
});`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Widget Integration Guide</h1>
          <p className="text-gray-300">Learn how to integrate the Nexor payment widget into your website</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4" glassmorphism>
              <nav className="space-y-2">
                <a href="#getting-started" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Getting Started
                </a>
                <a href="#installation" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Installation
                </a>
                <a href="#configuration" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Configuration
                </a>
                <a href="#payment-button" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Payment Button
                </a>
                <a href="#inline-widget" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Inline Widget
                </a>
                <a href="#programmatic" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Programmatic Usage
                </a>
                <a href="#events" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Event Handling
                </a>
                <a href="#customization" className="block px-4 py-2 rounded-lg hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                  Customization
                </a>
              </nav>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Getting Started */}
            <Card className="p-6 mb-8" glassmorphism id="getting-started">
              <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
              <p className="mb-4">
                The Nexor Payment Widget allows you to accept cryptocurrency payments on your website
                with just a few lines of code. It supports multiple tokens across different blockchains,
                including Polkadot, Kusama, and Solana ecosystems.
              </p>
              <p>
                Before you begin, make sure you have:
              </p>
              <ul className="list-disc list-inside space-y-2 my-4 ml-4">
                <li>Created a merchant account on the Nexor dashboard</li>
                <li>Generated an API key from your merchant settings</li>
                <li>Basic understanding of HTML and JavaScript</li>
              </ul>
            </Card>
            
            {/* Installation */}
            <Card className="p-6 mb-8" glassmorphism id="installation">
              <h2 className="text-2xl font-semibold mb-4">Installation</h2>
              <p className="mb-4">
                To install the Nexor Payment Widget, add the following script tag to your HTML page:
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                {generateScriptTag()}
              </div>
              
              <p>
                This will load the widget script from our CDN. The script is lightweight and won't
                affect your page load performance.
              </p>
            </Card>
            
            {/* Configuration */}
            <Card className="p-6 mb-8" glassmorphism id="configuration">
              <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
              <p className="mb-4">
                The widget can be configured with various options to customize its behavior and appearance.
              </p>
              
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium">Configuration Options</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-4">Option</th>
                      <th className="text-left py-2 px-4">Type</th>
                      <th className="text-left py-2 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">apiKey</td>
                      <td className="py-2 px-4">string</td>
                      <td className="py-2 px-4">Your Nexor merchant API key</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">container</td>
                      <td className="py-2 px-4">HTMLElement</td>
                      <td className="py-2 px-4">DOM element to render the widget in (for inline mode)</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">primaryColor</td>
                      <td className="py-2 px-4">string</td>
                      <td className="py-2 px-4">Primary color for the widget (hex code)</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">buttonStyle</td>
                      <td className="py-2 px-4">string</td>
                      <td className="py-2 px-4">Button style: 'rounded', 'pill', or 'square'</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">modal</td>
                      <td className="py-2 px-4">boolean</td>
                      <td className="py-2 px-4">Whether to display as a modal or inline</td>
                    </tr>
                    <tr className="border-b border-gray-700">
                      <td className="py-2 px-4">onPaymentSuccess</td>
                      <td className="py-2 px-4">function</td>
                      <td className="py-2 px-4">Callback when payment is successful</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4">onPaymentFailure</td>
                      <td className="py-2 px-4">function</td>
                      <td className="py-2 px-4">Callback when payment fails</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
            
            {/* Payment Button */}
            <Card className="p-6 mb-8" glassmorphism id="payment-button">
              <h2 className="text-2xl font-semibold mb-4">Payment Button</h2>
              <p className="mb-4">
                The simplest way to integrate Nexor is by adding a payment button to your page.
                When clicked, it will open the payment modal.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Button Text</label>
                    <Input
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      glassmorphism
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        glassmorphism
                        fullWidth
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Button Style</label>
                  <select
                    value={buttonStyle}
                    onChange={(e) => setButtonStyle(e.target.value)}
                    className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill</option>
                    <option value="square">Square</option>
                  </select>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-6">
                {generateButtonCode()}
              </div>
              
              <p className="mb-4">
                The button will automatically inherit your website's styles, but you can also customize it
                using the data attributes shown above.
              </p>
              
              <div className="flex justify-center">
                <Button
                  style={{ backgroundColor: primaryColor }}
                  className={`
                    ${buttonStyle === 'pill' ? 'rounded-full' : 
                      buttonStyle === 'square' ? 'rounded-none' : 'rounded-lg'}
                  `}
                >
                  {buttonText}
                </Button>
              </div>
            </Card>
            
            {/* Inline Widget */}
            <Card className="p-6 mb-8" glassmorphism id="inline-widget">
              <h2 className="text-2xl font-semibold mb-4">Inline Widget</h2>
              <p className="mb-4">
                You can also embed the widget directly into your page as an inline element.
                This is useful for dedicated payment pages.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="modal-mode"
                    checked={!modalMode}
                    onChange={() => setModalMode(!modalMode)}
                    className="rounded bg-white/10 border-white/20"
                  />
                  <label htmlFor="modal-mode">Use inline mode instead of modal</label>
                </div>
              </div>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                {generateInitCode()}
              </div>
            </Card>
            
            {/* Programmatic Usage */}
            <Card className="p-6 mb-8" glassmorphism id="programmatic">
              <h2 className="text-2xl font-semibold mb-4">Programmatic Usage</h2>
              <p className="mb-4">
                You can also open the payment widget programmatically from your JavaScript code:
              </p>
              
              <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                {generateProgrammaticCode()}
              </div>
              
              <p>
                This is useful when you need to trigger the payment process after some user action,
                like clicking a custom button or completing a form.
              </p>
            </Card>
            
            {/* Event Handling */}
            <Card className="p-6 mb-8" glassmorphism id="events">
              <h2 className="text-2xl font-semibold mb-4">Event Handling</h2>
              <p className="mb-4">
                The widget emits various events that you can listen to:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`// Listen for payment events
document.addEventListener('nexor:payment-success', function(e) {
  console.log('Payment successful!', e.detail.paymentId, e.detail.txHash);
  // Update your UI or redirect the user
});

document.addEventListener('nexor:payment-failure', function(e) {
  console.error('Payment failed:', e.detail.error);
  // Show error message to the user
});

document.addEventListener('nexor:widget-open', function() {
  console.log('Widget opened');
});

document.addEventListener('nexor:widget-close', function() {
  console.log('Widget closed');
});`}
                </div>
                
                <p>
                  These events provide a flexible way to integrate the payment flow with your application logic.
                </p>
              </div>
            </Card>
            
            {/* Customization */}
            <Card className="p-6 mb-8" glassmorphism id="customization">
              <h2 className="text-2xl font-semibold mb-4">Customization</h2>
              <p className="mb-4">
                You can customize the appearance of the widget to match your website's design:
              </p>
              
              <div className="space-y-4">
                <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`// Custom CSS overrides
NexorWidget.init({
  apiKey: 'YOUR_API_KEY',
  primaryColor: '#673AB7', // Your brand color
  customStyles: {
    fontFamily: '"Roboto", sans-serif',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    // Add any other CSS properties you want to customize
  }
});`}
                </div>
                
                <p>
                  For more advanced customization options, please refer to our 
                  <a href="/docs/advanced-customization" className="text-purple-400 hover:underline"> advanced customization guide</a>.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
