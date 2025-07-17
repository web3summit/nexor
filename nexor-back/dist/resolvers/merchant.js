"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merchantResolvers = void 0;
const crypto_1 = require("crypto");
const logger_1 = require("../utils/logger");
exports.merchantResolvers = {
    Query: {
        merchant: async (_, { id }, { prisma }) => {
            try {
                return await prisma.merchant.findUnique({
                    where: { id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching merchant:', error);
                throw new Error('Failed to fetch merchant');
            }
        },
        merchantByApiKey: async (_, { apiKey }, { prisma }) => {
            try {
                return await prisma.merchant.findUnique({
                    where: { apiKey },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching merchant by API key:', error);
                throw new Error('Failed to fetch merchant');
            }
        },
        merchants: async (_, __, { prisma }) => {
            try {
                return await prisma.merchant.findMany();
            }
            catch (error) {
                logger_1.logger.error('Error fetching merchants:', error);
                throw new Error('Failed to fetch merchants');
            }
        },
    },
    Mutation: {
        createMerchant: async (_, { input }, { prisma }) => {
            try {
                const apiKey = generateApiKey();
                return await prisma.merchant.create({
                    data: {
                        ...input,
                        apiKey,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating merchant:', error);
                throw new Error('Failed to create merchant');
            }
        },
        updateMerchant: async (_, { id, input }, { prisma }) => {
            try {
                return await prisma.merchant.update({
                    where: { id },
                    data: input,
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating merchant:', error);
                throw new Error('Failed to update merchant');
            }
        },
        deleteMerchant: async (_, { id }, { prisma }) => {
            try {
                await prisma.merchant.delete({
                    where: { id },
                });
                return true;
            }
            catch (error) {
                logger_1.logger.error('Error deleting merchant:', error);
                throw new Error('Failed to delete merchant');
            }
        },
        regenerateApiKey: async (_, { id }, { prisma }) => {
            try {
                const apiKey = generateApiKey();
                await prisma.merchant.update({
                    where: { id },
                    data: { apiKey },
                });
                return apiKey;
            }
            catch (error) {
                logger_1.logger.error('Error regenerating API key:', error);
                throw new Error('Failed to regenerate API key');
            }
        },
    },
    Merchant: {
        payments: async (parent, _, { prisma }) => {
            try {
                return await prisma.payment.findMany({
                    where: { merchantId: parent.id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching merchant payments:', error);
                throw new Error('Failed to fetch merchant payments');
            }
        },
        invoices: async (parent, _, { prisma }) => {
            try {
                return await prisma.invoice.findMany({
                    where: { merchantId: parent.id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching merchant invoices:', error);
                throw new Error('Failed to fetch merchant invoices');
            }
        },
    },
};
function generateApiKey() {
    return `nexor_${(0, crypto_1.randomUUID)().replace(/-/g, '')}`;
}
//# sourceMappingURL=merchant.js.map