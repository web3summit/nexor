import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { fetchTokenPrice } from '../services/priceService';
import { Context } from '../types';

export const tokenPriceResolvers = {
  Query: {
    tokenPrice: async (_: any, { symbol }: { symbol: string }, { prisma }: Context) => {
      try {
        // Check if we have a recent price in the database (less than 5 minutes old)
        const cachedPrice = await prisma.tokenPrice.findUnique({
          where: { symbol },
        });
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (cachedPrice && cachedPrice.updatedAt > fiveMinutesAgo) {
          return cachedPrice;
        }
        
        // If not, fetch the latest price
        const latestPrice = await fetchTokenPrice(symbol);
        
        // Update or create the price record
        return await prisma.tokenPrice.upsert({
          where: { symbol },
          update: {
            usdPrice: latestPrice,
            updatedAt: new Date(),
          },
          create: {
            symbol,
            usdPrice: latestPrice,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        logger.error(`Error fetching token price for ${symbol}:`, error);
        throw new Error(`Failed to fetch token price for ${symbol}`);
      }
    },
    
    tokenPrices: async (_: any, __: any, { prisma }: Context) => {
      try {
        return await prisma.tokenPrice.findMany();
      } catch (error) {
        logger.error('Error fetching token prices:', error);
        throw new Error('Failed to fetch token prices');
      }
    },
  },
};
