/**
 * Utility for generating and managing payment receipts
 */

export interface PaymentReceiptData {
  paymentId: string;
  merchantId: string;
  merchantName: string;
  customerEmail?: string;
  amount: string;
  amountUsd: string;
  tokenSymbol: string;
  tokenAmount: string;
  txHash?: string;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  invoiceId?: string;
  receiptNumber?: string;
}

export interface ReceiptOptions {
  includeQrCode?: boolean;
  includeMerchantLogo?: boolean;
  includeBlockExplorerLink?: boolean;
  sendEmail?: boolean;
}

/**
 * Generate a unique receipt number
 */
export function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `NEXOR-${timestamp}-${random}`.toUpperCase();
}

/**
 * Format a payment receipt as HTML
 */
export function formatReceiptHtml(data: PaymentReceiptData, options: ReceiptOptions = {}): string {
  const {
    paymentId,
    merchantName,
    customerEmail,
    amount,
    amountUsd,
    tokenSymbol,
    tokenAmount,
    txHash,
    date,
    status,
    description,
    invoiceId,
    receiptNumber = generateReceiptNumber(),
  } = data;
  
  const statusColor = status === 'completed' ? '#4CAF50' : status === 'pending' ? '#FF9800' : '#F44336';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  
  const explorerLink = txHash ? getExplorerLink(txHash, tokenSymbol) : '';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt #${receiptNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .receipt {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-height: 60px;
          margin-bottom: 15px;
        }
        h1 {
          color: #333;
          margin: 0;
          font-size: 24px;
        }
        .receipt-number {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .status {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          color: white;
          background-color: ${statusColor};
          margin-top: 10px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #555;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .detail-label {
          font-weight: 500;
          color: #666;
        }
        .detail-value {
          text-align: right;
        }
        .amount {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .qr-code {
          text-align: center;
          margin: 20px 0;
        }
        .qr-code img {
          max-width: 150px;
        }
        a {
          color: #673AB7;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        @media print {
          body {
            padding: 0;
          }
          .receipt {
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          ${options.includeMerchantLogo ? '<img src="MERCHANT_LOGO_URL" alt="Merchant Logo" class="logo">' : ''}
          <h1>Payment Receipt</h1>
          <div class="receipt-number">#${receiptNumber}</div>
          <div class="status">${statusText}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">${date}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Payment ID</span>
            <span class="detail-value">${paymentId}</span>
          </div>
          ${invoiceId ? `
          <div class="detail-row">
            <span class="detail-label">Invoice ID</span>
            <span class="detail-value">${invoiceId}</span>
          </div>
          ` : ''}
          ${description ? `
          <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">${description}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">Amount</div>
          <div class="detail-row">
            <span class="detail-label">Amount (USD)</span>
            <span class="detail-value amount">$${amountUsd}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Paid Amount</span>
            <span class="detail-value">${tokenAmount} ${tokenSymbol}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Exchange Rate</span>
            <span class="detail-value">1 ${tokenSymbol} = $${(parseFloat(amountUsd) / parseFloat(tokenAmount)).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Merchant</div>
          <div class="detail-row">
            <span class="detail-label">Name</span>
            <span class="detail-value">${merchantName}</span>
          </div>
        </div>
        
        ${txHash ? `
        <div class="section">
          <div class="section-title">Transaction</div>
          <div class="detail-row">
            <span class="detail-label">Transaction Hash</span>
            <span class="detail-value" style="word-break: break-all;">${txHash}</span>
          </div>
          ${options.includeBlockExplorerLink && explorerLink ? `
          <div class="detail-row">
            <span class="detail-label">Block Explorer</span>
            <span class="detail-value"><a href="${explorerLink}" target="_blank">View on Block Explorer</a></span>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        ${options.includeQrCode && txHash ? `
        <div class="qr-code">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(txHash)}" alt="Transaction QR Code">
          <div style="margin-top: 5px; font-size: 12px; color: #666;">Scan to view transaction</div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>This receipt was generated by Nexor Payment Widget.</p>
          <p>For any questions, please contact the merchant.</p>
          <p class="no-print"><a href="javascript:window.print()">Print Receipt</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Get block explorer link based on token symbol
 */
function getExplorerLink(txHash: string, tokenSymbol: string): string {
  // Determine the chain based on token symbol
  const chain = getChainFromToken(tokenSymbol);
  
  switch (chain) {
    case 'polkadot':
      return `https://polkadot.subscan.io/extrinsic/${txHash}`;
    case 'kusama':
      return `https://kusama.subscan.io/extrinsic/${txHash}`;
    case 'solana':
      return `https://explorer.solana.com/tx/${txHash}`;
    default:
      return '';
  }
}

/**
 * Determine blockchain from token symbol
 */
function getChainFromToken(tokenSymbol: string): string {
  const symbol = tokenSymbol.toUpperCase();
  
  if (['DOT', 'PDOT'].includes(symbol)) {
    return 'polkadot';
  } else if (['KSM', 'KSMA'].includes(symbol)) {
    return 'kusama';
  } else if (['SOL', 'WSOL', 'USDC-SOL'].includes(symbol)) {
    return 'solana';
  } else {
    // Default to polkadot for unknown tokens
    return 'polkadot';
  }
}

/**
 * Send receipt via email
 */
export async function sendReceiptEmail(
  data: PaymentReceiptData,
  email: string,
  options: ReceiptOptions = {}
): Promise<boolean> {
  if (!email) {
    console.error('Email is required to send receipt');
    return false;
  }
  
  try {
    // In a real implementation, we would call an email API service
    // For now, we'll just simulate the process
    
    console.log(`[Receipt] Sending receipt for payment ${data.paymentId} to ${email}`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    return false;
  }
}

/**
 * Download receipt as PDF
 */
export function downloadReceiptPdf(data: PaymentReceiptData, options: ReceiptOptions = {}): void {
  // In a real implementation, we would generate a PDF
  // For now, we'll just open the HTML in a new window for printing
  
  const html = formatReceiptHtml(data, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const receiptWindow = window.open(url, '_blank');
  if (receiptWindow) {
    receiptWindow.onload = () => {
      // Auto-trigger print dialog after a short delay
      setTimeout(() => {
        receiptWindow.print();
      }, 500);
    };
  }
}
