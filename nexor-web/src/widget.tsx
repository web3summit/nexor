import React, { useState, useEffect } from 'react';
import { PaymentWidget } from './components/organisms/PaymentWidget';

export interface NexorWidgetProps {
  merchantId: string;
  amount?: string;
  currency?: string;
  description?: string;
  onClose?: () => void;
  onPaymentComplete?: (txHash: string) => void;
  onPaymentFailed?: (error: Error) => void;
  className?: string;
}

export const NexorWidget: React.FC<NexorWidgetProps> = ({
  merchantId,
  amount,
  currency = 'USD',
  description,
  onClose,
  onPaymentComplete,
  onPaymentFailed,
  className = '',
}) => {
  const [merchantData, setMerchantData] = useState<{
    name: string;
    logo?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would fetch this data from the API
        // For now, we'll use mock data
        const response = await fetch(`https://api.nexor.io/merchants/${merchantId}`).catch(() => {
          // Mock response for development
          return {
            ok: true,
            json: () => Promise.resolve({
              id: merchantId,
              name: 'Demo Merchant',
              logo: 'https://via.placeholder.com/150',
            }),
          };
        });

        if (!response.ok) {
          throw new Error('Failed to fetch merchant data');
        }

        const data = await response.json();
        setMerchantData({
          name: data.name,
          logo: data.logo,
        });
      } catch (err) {
        console.error('Error fetching merchant data:', err);
        setError('Failed to load merchant data');
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantData();
  }, [merchantId]);

  const handlePaymentComplete = (txHash: string) => {
    // Dispatch custom event
    const event = new CustomEvent('nexor:payment-complete', {
      detail: { txHash, merchantId, amount, currency },
    });
    document.dispatchEvent(event);

    // Call callback if provided
    if (onPaymentComplete) {
      onPaymentComplete(txHash);
    }
  };

  const handlePaymentFailed = (error: Error) => {
    // Dispatch custom event
    const event = new CustomEvent('nexor:payment-failed', {
      detail: { error: error.message, merchantId, amount, currency },
    });
    document.dispatchEvent(event);

    // Call callback if provided
    if (onPaymentFailed) {
      onPaymentFailed(error);
    }
  };

  if (loading) {
    return (
      <div className={`nexor-widget-loading ${className}`}>
        <div className="animate-pulse flex flex-col items-center justify-center p-8">
          <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !merchantData) {
    return (
      <div className={`nexor-widget-error ${className}`}>
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4">
          <p>{error || 'Failed to load payment widget'}</p>
          <p className="mt-2 text-sm">
            Please check your merchant ID and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PaymentWidget
      merchantId={merchantId}
      merchantName={merchantData.name}
      merchantLogo={merchantData.logo}
      amount={amount}
      currency={currency}
      description={description}
      onClose={onClose}
      onPaymentComplete={handlePaymentComplete}
      onPaymentFailed={handlePaymentFailed}
      className={className}
    />
  );
};

// Export a global initialization function for use in the widget script
if (typeof window !== 'undefined') {
  (window as any).NexorWidget = {
    render: (container: HTMLElement, props: NexorWidgetProps) => {
      const root = document.createElement('div');
      container.appendChild(root);
      
      // In a real implementation, we would use ReactDOM.render or createRoot
      // For now, we'll just log the props
      console.log('NexorWidget.render called with props:', props);
    },
  };
}
