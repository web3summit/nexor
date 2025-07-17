import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';
import { Context, MerchantInput } from '../types';

export const merchantResolvers = {
  Query: {
    merchant: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        return await prisma.merchant.findUnique({
          where: { id },
        });
      } catch (error) {
        logger.error('Error fetching merchant:', error);
        throw new Error('Failed to fetch merchant');
      }
    },
    
    merchantByApiKey: async (_: any, { apiKey }: { apiKey: string }, { prisma }: Context) => {
      try {
        return await prisma.merchant.findUnique({
          where: { apiKey },
        });
      } catch (error) {
        logger.error('Error fetching merchant by API key:', error);
        throw new Error('Failed to fetch merchant');
      }
    },
    
    merchants: async (_: any, __: any, { prisma }: Context) => {
      try {
        return await prisma.merchant.findMany();
      } catch (error) {
        logger.error('Error fetching merchants:', error);
        throw new Error('Failed to fetch merchants');
      }
    },
  },
  
  Mutation: {
    createMerchant: async (_: any, { input }: { input: MerchantInput }, { prisma }: Context) => {
      try {
        const apiKey = generateApiKey();
        
        return await prisma.merchant.create({
          data: {
            ...input,
            apiKey,
          },
        });
      } catch (error) {
        logger.error('Error creating merchant:', error);
        throw new Error('Failed to create merchant');
      }
    },
    
    updateMerchant: async (_: any, { id, input }: { id: string; input: Partial<MerchantInput> }, { prisma }: Context) => {
      try {
        return await prisma.merchant.update({
          where: { id },
          data: input,
        });
      } catch (error) {
        logger.error('Error updating merchant:', error);
        throw new Error('Failed to update merchant');
      }
    },
    
    deleteMerchant: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        await prisma.merchant.delete({
          where: { id },
        });
        return true;
      } catch (error) {
        logger.error('Error deleting merchant:', error);
        throw new Error('Failed to delete merchant');
      }
    },
    
    regenerateApiKey: async (_: any, { id }: { id: string }, { prisma }: Context) => {
      try {
        const apiKey = generateApiKey();
        
        await prisma.merchant.update({
          where: { id },
          data: { apiKey },
        });
        
        return apiKey;
      } catch (error) {
        logger.error('Error regenerating API key:', error);
        throw new Error('Failed to regenerate API key');
      }
    },
  },
  
  Merchant: {
    payments: async (parent: any, _: any, { prisma }: Context) => {
      try {
        return await prisma.payment.findMany({
          where: { merchantId: parent.id },
        });
      } catch (error) {
        logger.error('Error fetching merchant payments:', error);
        throw new Error('Failed to fetch merchant payments');
      }
    },
    
    invoices: async (parent: any, _: any, { prisma }: Context) => {
      try {
        return await prisma.invoice.findMany({
          where: { merchantId: parent.id },
        });
      } catch (error) {
        logger.error('Error fetching merchant invoices:', error);
        throw new Error('Failed to fetch merchant invoices');
      }
    },
  },
};

// Helper function to generate a secure API key
function generateApiKey(): string {
  return `nexor_${randomUUID().replace(/-/g, '')}`;
}
