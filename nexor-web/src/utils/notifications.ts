/**
 * Utility functions for handling payment notifications and webhooks
 */

export interface WebhookPayload {
  event: 'payment.created' | 'payment.processing' | 'payment.completed' | 'payment.failed';
  data: {
    id: string;
    merchantId: string;
    amount: string;
    amountUsd: string;
    tokenSymbol: string;
    sourceAddress?: string;
    destinationAddress: string;
    txHash?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  timestamp: number;
  signature: string;
}

export interface NotificationOptions {
  apiUrl?: string;
  retries?: number;
  timeout?: number;
}

/**
 * Send webhook notification to merchant endpoint
 */
export async function sendWebhookNotification(
  merchantId: string,
  webhookUrl: string,
  event: WebhookPayload['event'],
  data: WebhookPayload['data'],
  options: NotificationOptions = {}
): Promise<boolean> {
  const { apiUrl = 'https://api.nexor.io', retries = 3, timeout = 10000 } = options;
  
  // In a real implementation, we would call our API to send the webhook
  // For now, we'll simulate the process
  console.log(`[Webhook] Sending ${event} notification to ${webhookUrl} for merchant ${merchantId}`);
  
  try {
    // Create webhook payload
    const payload: WebhookPayload = {
      event,
      data,
      timestamp: Date.now(),
      signature: generateSignature(merchantId, event, data),
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[Webhook] Successfully sent ${event} notification`);
    return true;
  } catch (error) {
    console.error(`[Webhook] Failed to send ${event} notification:`, error);
    
    // Retry logic
    if (retries > 0) {
      console.log(`[Webhook] Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendWebhookNotification(merchantId, webhookUrl, event, data, {
        ...options,
        retries: retries - 1,
      });
    }
    
    return false;
  }
}

/**
 * Generate webhook signature for verification
 */
function generateSignature(merchantId: string, event: string, data: any): string {
  // In a real implementation, we would use a proper signing algorithm
  // For now, we'll return a mock signature
  return `sig_${Buffer.from(JSON.stringify({ merchantId, event, data })).toString('base64')}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: WebhookPayload,
  secret: string
): boolean {
  // In a real implementation, we would verify the signature using the secret
  // For now, we'll return true
  return true;
}

/**
 * Send email notification to merchant
 */
export async function sendEmailNotification(
  merchantId: string,
  email: string,
  subject: string,
  message: string,
  options: NotificationOptions = {}
): Promise<boolean> {
  const { apiUrl = 'https://api.nexor.io', retries = 3 } = options;
  
  // In a real implementation, we would call our API to send the email
  // For now, we'll simulate the process
  console.log(`[Email] Sending email to ${email} for merchant ${merchantId}`);
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[Email] Successfully sent email to ${email}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send email to ${email}:`, error);
    
    // Retry logic
    if (retries > 0) {
      console.log(`[Email] Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return sendEmailNotification(merchantId, email, subject, message, {
        ...options,
        retries: retries - 1,
      });
    }
    
    return false;
  }
}

/**
 * Create payment notification content
 */
export function createPaymentNotificationContent(
  event: WebhookPayload['event'],
  data: WebhookPayload['data']
): { subject: string; message: string } {
  const { id, amount, tokenSymbol, txHash, status } = data;
  
  let subject = '';
  let message = '';
  
  switch (event) {
    case 'payment.created':
      subject = `New payment received: ${amount} ${tokenSymbol}`;
      message = `A new payment (ID: ${id}) has been created for ${amount} ${tokenSymbol}. Status: ${status}`;
      break;
    case 'payment.processing':
      subject = `Payment processing: ${amount} ${tokenSymbol}`;
      message = `Payment (ID: ${id}) for ${amount} ${tokenSymbol} is now processing. Transaction hash: ${txHash}. Status: ${status}`;
      break;
    case 'payment.completed':
      subject = `Payment completed: ${amount} ${tokenSymbol}`;
      message = `Payment (ID: ${id}) for ${amount} ${tokenSymbol} has been completed. Transaction hash: ${txHash}. Status: ${status}`;
      break;
    case 'payment.failed':
      subject = `Payment failed: ${amount} ${tokenSymbol}`;
      message = `Payment (ID: ${id}) for ${amount} ${tokenSymbol} has failed. Status: ${status}`;
      break;
    default:
      subject = `Payment update: ${amount} ${tokenSymbol}`;
      message = `Payment (ID: ${id}) for ${amount} ${tokenSymbol} has been updated. Status: ${status}`;
  }
  
  return { subject, message };
}
