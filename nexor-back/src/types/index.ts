import { PrismaClient } from '@prisma/client';

export interface Context {
  prisma: PrismaClient;
}

export interface MerchantInput {
  name: string;
  email: string;
  walletAddress: string;
  webhookUrl?: string;
  customizations?: any;
}

export interface PaymentInput {
  merchantId: string;
  amount: number;
  sourceToken: string;
  destinationToken: string;
  sourceChain: string;
  destinationChain: string;
  sourceAddress: string;
  destinationAddress: string;
  invoiceId?: string;
  metadata?: any;
}

export interface InvoiceInput {
  merchantId: string;
  amount: number;
  currency: string;
  description?: string;
  dueDate?: Date;
  recipientEmail?: string;
}
