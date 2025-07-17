import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { logger } from '../utils/logger';
import { Context, InvoiceInput } from '../types';

export const invoiceResolvers = {
  Query: {
    invoice: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        return await prisma.invoice.findUnique({
          where: { id },
        });
      } catch (error) {
        logger.error('Error fetching invoice:', error);
        throw new Error('Failed to fetch invoice');
      }
    },
    
    invoicesByMerchant: async (_: any, { merchantId }: { merchantId: string }, { prisma }: Context) => {
      try {
        return await prisma.invoice.findMany({
          where: { merchantId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        logger.error('Error fetching invoices by merchant:', error);
        throw new Error('Failed to fetch invoices');
      }
    },
    
    invoices: async (_: any, __: any, { prisma }: Context) => {
      try {
        return await prisma.invoice.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        logger.error('Error fetching invoices:', error);
        throw new Error('Failed to fetch invoices');
      }
    },
  },
  
  Mutation: {
    createInvoice: async (_: any, { input }: { input: InvoiceInput }, { prisma }: Context) => {
      try {
        return await prisma.invoice.create({
          data: {
            ...input,
            status: InvoiceStatus.UNPAID,
          },
        });
      } catch (error) {
        logger.error('Error creating invoice:', error);
        throw new Error('Failed to create invoice');
      }
    },
    
    updateInvoiceStatus: async (
      _: any,
      { id, status }: { id: string; status: InvoiceStatus },
      { prisma }: Context
    ) => {
      try {
        return await prisma.invoice.update({
          where: { id },
          data: { 
            status,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        logger.error('Error updating invoice status:', error);
        throw new Error('Failed to update invoice status');
      }
    },
    
    deleteInvoice: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        await prisma.invoice.delete({
          where: { id },
        });
        return true;
      } catch (error) {
        logger.error('Error deleting invoice:', error);
        throw new Error('Failed to delete invoice');
      }
    },
  },
  
  Invoice: {
    merchant: async (parent: any, _: any, { prisma }: Context) => {
      try {
        return await prisma.merchant.findUnique({
          where: { id: parent.merchantId },
        });
      } catch (error) {
        logger.error('Error fetching invoice merchant:', error);
        throw new Error('Failed to fetch invoice merchant');
      }
    },
    
    payments: async (parent: any, _: any, { prisma }: Context) => {
      try {
        return await prisma.payment.findMany({
          where: { invoiceId: parent.id },
        });
      } catch (error) {
        logger.error('Error fetching invoice payments:', error);
        throw new Error('Failed to fetch invoice payments');
      }
    },
  },
};
