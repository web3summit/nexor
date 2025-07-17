"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenPriceResolvers = void 0;
const logger_1 = require("../utils/logger");
const priceService_1 = require("../services/priceService");
exports.tokenPriceResolvers = {
    Query: {
        tokenPrice: async (_, { symbol }, { prisma }) => {
            try {
                const cachedPrice = await prisma.tokenPrice.findUnique({
                    where: { symbol },
                });
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                if (cachedPrice && cachedPrice.updatedAt > fiveMinutesAgo) {
                    return cachedPrice;
                }
                const latestPrice = await (0, priceService_1.fetchTokenPrice)(symbol);
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
            }
            catch (error) {
                logger_1.logger.error(`Error fetching token price for ${symbol}:`, error);
                throw new Error(`Failed to fetch token price for ${symbol}`);
            }
        },
        tokenPrices: async (_, __, { prisma }) => {
            try {
                return await prisma.tokenPrice.findMany();
            }
            catch (error) {
                logger_1.logger.error('Error fetching token prices:', error);
                throw new Error('Failed to fetch token prices');
            }
        },
    },
};
//# sourceMappingURL=tokenPrice.js.map