import axios from 'axios';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache for token prices to minimize API calls
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the current USD price for a given token symbol
 * @param symbol Token symbol (e.g., DOT, KSM, USDC)
 * @returns Current USD price
 */
export async function fetchTokenPrice(symbol: string): Promise<number> {
  try {
    // For stablecoins, return 1 USD
    if (['USDC', 'USDT'].includes(symbol.toUpperCase())) {
      return 1.0;
    }

    // Map token symbols to CoinGecko IDs
    const coinGeckoIdMap: Record<string, string> = {
      'DOT': 'polkadot',
      'KSM': 'kusama',
      'GLMR': 'moonbeam',
      'ASTR': 'astar',
      'ACA': 'acala',
    };

    const coinId = coinGeckoIdMap[symbol.toUpperCase()];
    if (!coinId) {
      logger.warn(`No CoinGecko ID mapping for symbol: ${symbol}`);
      return 0;
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    );

    if (response.data && response.data[coinId] && response.data[coinId].usd) {
      return response.data[coinId].usd;
    } else {
      logger.error(`Failed to get price for ${symbol}: Invalid response format`);
      return 0;
    }
  } catch (error) {
    logger.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Get the current USD price for a token, using cache or database when possible
 * @param symbol Token symbol
 * @returns Current USD price
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  const normalizedSymbol = symbol.toUpperCase();

  // Check cache first
  const cachedData = priceCache[normalizedSymbol];
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return cachedData.price;
  }

  try {
    // Check database for recent price
    const dbPrice = await prisma.tokenPrice.findUnique({
      where: { symbol: normalizedSymbol },
    });

    const fiveMinutesAgo = new Date(Date.now() - CACHE_TTL);
    
    if (dbPrice && dbPrice.updatedAt > fiveMinutesAgo) {
      // Update cache and return price
      priceCache[normalizedSymbol] = {
        price: dbPrice.usdPrice,
        timestamp: Date.now(),
      };
      return dbPrice.usdPrice;
    }

    // Fetch fresh price
    const price = await fetchTokenPrice(normalizedSymbol);
    
    // Update cache
    priceCache[normalizedSymbol] = {
      price,
      timestamp: Date.now(),
    };

    // Update database
    await prisma.tokenPrice.upsert({
      where: { symbol: normalizedSymbol },
      update: {
        usdPrice: price,
        updatedAt: new Date(),
      },
      create: {
        symbol: normalizedSymbol,
        usdPrice: price,
        updatedAt: new Date(),
      },
    });

    return price;
  } catch (error) {
    logger.error(`Error in getTokenPrice for ${symbol}:`, error);
    
    // If we have a cached price, return it even if expired
    if (cachedData) {
      return cachedData.price;
    }
    
    // For stablecoins, return 1 USD even if there's an error
    if (['USDC', 'USDT'].includes(normalizedSymbol)) {
      return 1.0;
    }
    
    return 0;
  }
}
