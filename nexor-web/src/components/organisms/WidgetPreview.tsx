import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { PaymentFlow } from './PaymentFlow';

interface WidgetPreviewProps {
  merchantId: string;
  customization?: {
    primaryColor?: string;
    logoUrl?: string;
    buttonStyle?: 'rounded' | 'pill' | 'square';
  };
  className?: string;
}

export const WidgetPreview: React.FC<WidgetPreviewProps> = ({
  merchantId,
  customization = {},
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'modal' | 'inline'>('modal');
  const [amount, setAmount] = useState('100');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('Premium Subscription');
  
  const { primaryColor = '#673AB7', logoUrl, buttonStyle = 'rounded' } = customization;
  
  // Handle button click
  const handleButtonClick = () => {
    if (previewMode === 'modal') {
      setShowModal(true);
    }
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Get button style class
  const getButtonStyleClass = () => {
    switch (buttonStyle) {
      case 'pill':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      default:
        return 'rounded-lg';
    }
  };
  
  return (
    <Card className={`p-6 ${className}`} glassmorphism>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Widget Preview</h2>
        <p className="text-gray-400">
          Preview how your payment widget will appear to your customers with your current customization settings.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preview Mode</label>
            <div className="flex space-x-3">
              <Button
                variant={previewMode === 'modal' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('modal')}
                glassmorphism
              >
                Modal
              </Button>
              <Button
                variant={previewMode === 'inline' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('inline')}
                glassmorphism
              >
                Inline
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              glassmorphism
              fullWidth
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-lg px-4 py-2.5 backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              glassmorphism
              fullWidth
            />
          </div>
          
          {previewMode === 'modal' && (
            <div className="pt-4">
              <Button
                onClick={handleButtonClick}
                style={{ backgroundColor: primaryColor }}
                className={getButtonStyleClass()}
                fullWidth
              >
                Pay with Crypto
              </Button>
            </div>
          )}
        </div>
        
        <div>
          {previewMode === 'inline' ? (
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              <PaymentFlow
                merchantId={merchantId}
                amount={amount}
                currency={currency}
                description={description}
                customization={customization}
                onComplete={() => {}}
                onCancel={() => {}}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center space-y-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-gray-400">Click the button to open the payment modal</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Payment Flow */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <Card className="relative" glassmorphism>
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <PaymentFlow
                merchantId={merchantId}
                amount={amount}
                currency={currency}
                description={description}
                customization={customization}
                onComplete={handleCloseModal}
                onCancel={handleCloseModal}
              />
            </Card>
          </motion.div>
        </motion.div>
      )}
      
      <div className="mt-6 border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-3">Integration Code</h3>
        <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
{`<button 
  data-nexor-button 
  data-primary-color="${primaryColor}"
  data-button-style="${buttonStyle}"
  data-modal="${previewMode === 'modal' ? 'true' : 'false'}"
  data-amount="${amount}"
  data-currency="${currency}"
  data-description="${description}"
  data-merchant-id="${merchantId}"
>
  Pay with Crypto
</button>

<script src="https://cdn.nexor.io/widget.js" async></script>`}
        </div>
      </div>
    </Card>
  );
};
