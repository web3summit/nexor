import { PrismaClient, PaymentStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { getTokenPrice } from '../services/priceService';
import { Context, PaymentInput } from '../types';

export const paymentResolvers = {
  Query: {
    payment: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        return await prisma.payment.findUnique({
          where: { id },
        });
      } catch (error) {
        logger.error('Error fetching payment:', error);
        throw new Error('Failed to fetch payment');
      }
    },
    
    paymentsByMerchant: async (_: any, { merchantId }: { merchantId: string }, { prisma }: Context) => {
      try {
        return await prisma.payment.findMany({
          where: { merchantId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        logger.error('Error fetching payments by merchant:', error);
        throw new Error('Failed to fetch payments');
      }
    },
    
    payments: async (_: any, __: any, { prisma }: Context) => {
      try {
        return await prisma.payment.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        logger.error('Error fetching payments:', error);
        throw new Error('Failed to fetch payments');
      }
    },
  },
  
  Mutation: {
    createPayment: async (_: any, { input }: { input: PaymentInput }, { prisma }: Context) => {
      try {
        // Get USD price for the source token
        const tokenPrice = await getTokenPrice(input.sourceToken);
        const amountUsd = input.amount * tokenPrice;
        
        // Get merchant's wallet address if not provided
        let destinationAddress = input.destinationAddress;
        if (!destinationAddress) {
          const merchant = await prisma.merchant.findUnique({
            where: { id: input.merchantId },
            select: { walletAddress: true },
          });
          destinationAddress = merchant?.walletAddress || '';
        }
        
        return await prisma.payment.create({
          data: {
            merchantId: input.merchantId,
            amount: input.amount,
            amountUsd,
            sourceToken: input.sourceToken,
            destinationToken: input.destinationToken,
            sourceChain: input.sourceChain,
            destinationChain: input.destinationChain,
            sourceAddress: input.sourceAddress,
            destinationAddress,
            status: PaymentStatus.PENDING,
            invoiceId: input.invoiceId,
            metadata: input.metadata,
          },
        });
      } catch (error) {
        logger.error('Error creating payment:', error);
        throw new Error('Failed to create payment');
      }
    },
    
    updatePaymentStatus: async (
      _: any,
      { id, status, txHash }: { id: string; status: PaymentStatus; txHash?: string },
      { prisma }: Context
    ) => {
      try {
        // Update payment status
        const payment = await prisma.payment.update({
          where: { id },
          data: { 
            status,
            txHash,
            updatedAt: new Date(),
          },
        });
        
        // If payment is completed and linked to an invoice, update invoice status
        if (status === PaymentStatus.COMPLETED && payment.invoiceId) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: payment.invoiceId },
            include: { payments: true },
          });
          
          if (invoice) {
            // Calculate total paid amount
            const totalPaid = invoice.payments
              .filter(p => p.status === PaymentStatus.COMPLETED)
              .reduce((sum, p) => sum + p.amountUsd, 0);
            
            // Update invoice status based on paid amount
            if (totalPaid >= invoice.amount) {
              await prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: { status: 'PAID' },
              });
            } else if (totalPaid > 0) {
              await prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: { status: 'PARTIALLY_PAID' },
              });
            }
          }
        }
        
        return payment;
      } catch (error) {
        logger.error('Error updating payment status:', error);
        throw new Error('Failed to update payment status');
      }
    },
  },
  
  Payment: {
    merchant: async (parent: any, _: any, { prisma }: Context) => {
      try {
        return await prisma.merchant.findUnique({
          where: { id: parent.merchantId },
        });
      } catch (error) {
        logger.error('Error fetching payment merchant:', error);
        throw new Error('Failed to fetch payment merchant');
      }
    },
    
    invoice: async (parent: any, _: any, { prisma }: Context) => {
      if (!parent.invoiceId) return null;
      
      try {
        return await prisma.invoice.findUnique({
          where: { id: parent.invoiceId },
        });
      } catch (error) {
        logger.error('Error fetching payment invoice:', error);
        throw new Error('Failed to fetch payment invoice');
      }
    },
  },
};
