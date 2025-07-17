/**
 * Nexor Widget Embed Utilities
 * Provides functionality to embed Nexor payment widgets in web pages
 */

interface NexorEmbedOptions {
  merchantId: string;
  amount?: string;
  currency?: string;
  description?: string;
  onPaymentComplete?: (txHash: string) => void;
  onPaymentFailed?: (error: Error) => void;
}

/**
 * Initialize the Nexor widget by finding containers with data-nexor-widget attribute
 */
export function initWidgetContainers(): void {
  // Find all widget containers
  const containers = document.querySelectorAll('[data-nexor-widget]');
  
  containers.forEach(container => {
    // Get configuration from data attributes
    const merchantId = container.getAttribute('data-merchant-id');
    const amount = container.getAttribute('data-amount');
    const currency = container.getAttribute('data-currency') || 'USD';
    const description = container.getAttribute('data-description');
    
    if (!merchantId) {
      console.error('Nexor Widget Error: Missing merchant ID');
      return;
    }
    
    // Create widget iframe or redirect to payment page
    const widgetUrl = `/payment?merchantId=${encodeURIComponent(merchantId)}&amount=${encodeURIComponent(amount || '')}&currency=${encodeURIComponent(currency)}&description=${encodeURIComponent(description || '')}`;
    
    // Create iframe for embedded widget
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';
    
    container.appendChild(iframe);
  });
}

/**
 * Initialize payment buttons with data-nexor-pay attribute
 */
export function initPaymentButtons(): void {
  // Initialize payment buttons
  const buttons = document.querySelectorAll('[data-nexor-pay]');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const merchantId = button.getAttribute('data-merchant-id');
      const amount = button.getAttribute('data-amount');
      const currency = button.getAttribute('data-currency') || 'USD';
      const description = button.getAttribute('data-description');
      
      if (!merchantId) {
        console.error('Nexor Widget Error: Missing merchant ID');
        return;
      }
      
      // Open payment in modal
      openNexorWidget({
        merchantId,
        amount: amount || undefined,
        currency,
        description: description || undefined
      });
    });
  });
}

/**
 * Programmatically open the Nexor payment widget
 */
export function openNexorWidget(options: NexorEmbedOptions): () => void {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.className = 'nexor-widget-modal';
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    padding: 20px;
  `;
  
  document.body.appendChild(modalContainer);
  
  // Function to close the modal
  const closeModal = () => {
    if (modalContainer.parentNode) {
      document.body.removeChild(modalContainer);
    }
  };
  
  // Create payment URL
  const paymentUrl = `/payment?merchantId=${encodeURIComponent(options.merchantId)}&amount=${encodeURIComponent(options.amount || '')}&currency=${encodeURIComponent(options.currency || 'USD')}&description=${encodeURIComponent(options.description || '')}&modal=true`;
  
  // Create iframe for payment
  const iframe = document.createElement('iframe');
  iframe.src = paymentUrl;
  iframe.style.cssText = `
    width: 90%;
    max-width: 500px;
    height: 80%;
    max-height: 600px;
    border: none;
    border-radius: 12px;
    background: white;
  `;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 24px;
    cursor: pointer;
    z-index: 10000;
  `;
  closeButton.onclick = closeModal;
  
  modalContainer.appendChild(iframe);
  modalContainer.appendChild(closeButton);
  
  // Listen for payment completion messages
  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data.type === 'PAYMENT_COMPLETE' && options.onPaymentComplete) {
      options.onPaymentComplete(event.data.txHash);
      closeModal();
    } else if (event.data.type === 'PAYMENT_FAILED' && options.onPaymentFailed) {
      options.onPaymentFailed(new Error(event.data.error));
      closeModal();
    }
  };
  
  window.addEventListener('message', messageHandler);
  
  // Return function to close the modal
  return () => {
    window.removeEventListener('message', messageHandler);
    closeModal();
  };
}

/**
 * Initialize the Nexor widget script
 */
export function initNexorWidget(): void {
  // Initialize containers and buttons
  initWidgetContainers();
  initPaymentButtons();
  
  // Expose global API
  (window as Window & typeof globalThis).NexorWidget = {
    open: openNexorWidget,
  };
}

// Add types to window object
declare global {
  interface Window {
    NexorWidget: {
      open: (options: NexorEmbedOptions) => () => void;
    };
  }
}
