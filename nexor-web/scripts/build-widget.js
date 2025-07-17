const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const outputDir = path.join(__dirname, '../public/widget');
const widgetFileName = 'nexor-widget.js';
const widgetCssFileName = 'nexor-widget.css';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Build the widget bundle
console.log('Building widget bundle...');

try {
  // Create widget entry point
  const widgetEntryContent = `
import { createRoot } from 'react-dom/client';
import { NexorWidget } from '../src/widget';

// Widget initialization function
function initNexorWidget() {
  // Find all widget containers
  const containers = document.querySelectorAll('[data-nexor-widget]');
  
  containers.forEach(container => {
    // Get configuration from data attributes
    const merchantId = container.getAttribute('data-merchant-id');
    const amount = container.getAttribute('data-amount');
    const currency = container.getAttribute('data-currency') || 'USD';
    
    if (!merchantId) {
      console.error('Nexor Widget Error: Missing merchant ID');
      return;
    }
    
    // Create widget root
    const root = createRoot(container);
    
    // Render widget
    root.render(
      <NexorWidget 
        merchantId={merchantId}
        amount={amount}
        currency={currency}
      />
    );
  });
  
  // Initialize payment buttons
  const buttons = document.querySelectorAll('[data-nexor-pay]');
  
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const merchantId = button.getAttribute('data-merchant-id');
      const amount = button.getAttribute('data-amount');
      const currency = button.getAttribute('data-currency') || 'USD';
      
      if (!merchantId) {
        console.error('Nexor Widget Error: Missing merchant ID');
        return;
      }
      
      // Create modal container
      const modalContainer = document.createElement('div');
      modalContainer.className = 'nexor-widget-modal';
      document.body.appendChild(modalContainer);
      
      // Create widget root
      const root = createRoot(modalContainer);
      
      // Render widget in modal
      root.render(
        <NexorWidget 
          merchantId={merchantId}
          amount={amount}
          currency={currency}
          onClose={() => {
            document.body.removeChild(modalContainer);
          }}
        />
      );
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNexorWidget);
} else {
  initNexorWidget();
}
  `;

  const widgetEntryPath = path.join(__dirname, '../src/widget-entry.tsx');
  fs.writeFileSync(widgetEntryPath, widgetEntryContent);

  // Build the widget using webpack (simulated here)
  console.log('Bundling widget with webpack...');
  
  // In a real implementation, you would use webpack to bundle the widget
  // For now, we'll just create a placeholder file
  const widgetPlaceholder = `
// Nexor Widget v0.1.0
// This is a placeholder for the actual widget bundle
// In production, this would be a bundled and minified version of the widget

(function() {
  console.log('Nexor Widget loaded');
  
  // Initialize widget
  window.NexorWidget = {
    init: function(config) {
      console.log('Nexor Widget initialized with config:', config);
    }
  };
  
  // Add widget CSS
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = 'https://nexor.io/widget/nexor-widget.css';
  document.head.appendChild(style);
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Nexor Widget: DOM ready');
    });
  } else {
    console.log('Nexor Widget: DOM already ready');
  }
})();
  `;
  
  fs.writeFileSync(path.join(outputDir, widgetFileName), widgetPlaceholder);
  
  // Create widget CSS
  const widgetCss = `
.nexor-widget-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.nexor-widget-modal {
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
}

.nexor-glass {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  border-radius: 20px;
}

.nexor-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 9999px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nexor-button-primary {
  background-color: rgba(103, 58, 183, 1);
  color: white;
}

.nexor-button-primary:hover {
  background-color: rgba(103, 58, 183, 0.9);
}
  `;
  
  fs.writeFileSync(path.join(outputDir, widgetCssFileName), widgetCss);
  
  // Create installation instructions
  const installationInstructions = `
# Nexor Widget Installation

To integrate the Nexor payment widget into your website, follow these steps:

## 1. Add the Widget Script

Add the following script tag to your HTML, preferably right before the closing </body> tag:

\`\`\`html
<script src="https://nexor.io/widget/nexor-widget.js" id="nexor-widget" data-merchant-id="YOUR_MERCHANT_ID"></script>
\`\`\`

Replace \`YOUR_MERCHANT_ID\` with your actual merchant ID.

## 2. Add Payment Buttons

There are two ways to use the Nexor widget:

### Option 1: Embedded Widget

Add a container element with the \`data-nexor-widget\` attribute:

\`\`\`html
<div 
  data-nexor-widget 
  data-merchant-id="YOUR_MERCHANT_ID"
  data-amount="100"
  data-currency="DOT"
></div>
\`\`\`

### Option 2: Modal Widget

Add a button with the \`data-nexor-pay\` attribute:

\`\`\`html
<button 
  data-nexor-pay 
  data-merchant-id="YOUR_MERCHANT_ID"
  data-amount="100"
  data-currency="DOT"
>
  Pay with Crypto
</button>
\`\`\`

## 3. Customize the Widget

You can customize the widget by adding the following attributes:

- \`data-amount\`: The payment amount
- \`data-currency\`: The currency code (e.g., DOT, KSM, USDC)
- \`data-description\`: A description of the payment

## 4. Handle Payment Events

You can listen for payment events by adding event listeners:

\`\`\`javascript
document.addEventListener('nexor:payment-complete', function(event) {
  console.log('Payment complete:', event.detail.txHash);
});

document.addEventListener('nexor:payment-failed', function(event) {
  console.log('Payment failed:', event.detail.error);
});
\`\`\`

For more information, visit our documentation at https://docs.nexor.io
  `;
  
  fs.writeFileSync(path.join(outputDir, 'README.md'), installationInstructions);
  
  console.log('Widget build completed successfully!');
  console.log(`Widget file: ${path.join(outputDir, widgetFileName)}`);
  console.log(`CSS file: ${path.join(outputDir, widgetCssFileName)}`);
  
} catch (error) {
  console.error('Error building widget:', error);
  process.exit(1);
}
