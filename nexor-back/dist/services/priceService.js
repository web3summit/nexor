"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchTokenPrice = fetchTokenPrice;
exports.getTokenPrice = getTokenPrice;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const priceCache = {};
const CACHE_TTL = 5 * 60 * 1000;
async function fetchTokenPrice(symbol) {
    try {
        if (['USDC', 'USDT'].includes(symbol.toUpperCase())) {
            return 1.0;
        }
        const coinGeckoIdMap = {
            'DOT': 'polkadot',
            'KSM': 'kusama',
            'GLMR': 'moonbeam',
            'ASTR': 'astar',
            'ACA': 'acala',
        };
        const coinId = coinGeckoIdMap[symbol.toUpperCase()];
        if (!coinId) {
            logger_1.logger.warn(`No CoinGecko ID mapping for symbol: ${symbol}`);
            return 0;
        }
        const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (response.data && response.data[coinId] && response.data[coinId].usd) {
            return response.data[coinId].usd;
        }
        else {
            logger_1.logger.error(`Failed to get price for ${symbol}: Invalid response format`);
            return 0;
        }
    }
    catch (error) {
        logger_1.logger.error(`Error fetching price for ${symbol}:`, error);
        return 0;
    }
}
async function getTokenPrice(symbol) {
    const normalizedSymbol = symbol.toUpperCase();
    const cachedData = priceCache[normalizedSymbol];
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return cachedData.price;
    }
    try {
        const dbPrice = await prisma.tokenPrice.findUnique({
            where: { symbol: normalizedSymbol },
        });
        const fiveMinutesAgo = new Date(Date.now() - CACHE_TTL);
        if (dbPrice && dbPrice.updatedAt > fiveMinutesAgo) {
            priceCache[normalizedSymbol] = {
                price: dbPrice.usdPrice,
                timestamp: Date.now(),
            };
            return dbPrice.usdPrice;
        }
        const price = await fetchTokenPrice(normalizedSymbol);
        priceCache[normalizedSymbol] = {
            price,
            timestamp: Date.now(),
        };
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
    }
    catch (error) {
        logger_1.logger.error(`Error in getTokenPrice for ${symbol}:`, error);
        if (cachedData) {
            return cachedData.price;
        }
        if (['USDC', 'USDT'].includes(normalizedSymbol)) {
            return 1.0;
        }
        return 0;
    }
}
//# sourceMappingURL=priceService.js.map