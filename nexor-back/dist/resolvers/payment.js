"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const priceService_1 = require("../services/priceService");
exports.paymentResolvers = {
    Query: {
        payment: async (_, { id }, { prisma }) => {
            try {
                return await prisma.payment.findUnique({
                    where: { id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching payment:', error);
                throw new Error('Failed to fetch payment');
            }
        },
        paymentsByMerchant: async (_, { merchantId }, { prisma }) => {
            try {
                return await prisma.payment.findMany({
                    where: { merchantId },
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching payments by merchant:', error);
                throw new Error('Failed to fetch payments');
            }
        },
        payments: async (_, __, { prisma }) => {
            try {
                return await prisma.payment.findMany({
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching payments:', error);
                throw new Error('Failed to fetch payments');
            }
        },
    },
    Mutation: {
        createPayment: async (_, { input }, { prisma }) => {
            try {
                const tokenPrice = await (0, priceService_1.getTokenPrice)(input.sourceToken);
                const amountUsd = input.amount * tokenPrice;
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
                        status: client_1.PaymentStatus.PENDING,
                        invoiceId: input.invoiceId,
                        metadata: input.metadata,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating payment:', error);
                throw new Error('Failed to create payment');
            }
        },
        updatePaymentStatus: async (_, { id, status, txHash }, { prisma }) => {
            try {
                const payment = await prisma.payment.update({
                    where: { id },
                    data: {
                        status,
                        txHash,
                        updatedAt: new Date(),
                    },
                });
                if (status === client_1.PaymentStatus.COMPLETED && payment.invoiceId) {
                    const invoice = await prisma.invoice.findUnique({
                        where: { id: payment.invoiceId },
                        include: { payments: true },
                    });
                    if (invoice) {
                        const totalPaid = invoice.payments
                            .filter(p => p.status === client_1.PaymentStatus.COMPLETED)
                            .reduce((sum, p) => sum + p.amountUsd, 0);
                        if (totalPaid >= invoice.amount) {
                            await prisma.invoice.update({
                                where: { id: payment.invoiceId },
                                data: { status: 'PAID' },
                            });
                        }
                        else if (totalPaid > 0) {
                            await prisma.invoice.update({
                                where: { id: payment.invoiceId },
                                data: { status: 'PARTIALLY_PAID' },
                            });
                        }
                    }
                }
                return payment;
            }
            catch (error) {
                logger_1.logger.error('Error updating payment status:', error);
                throw new Error('Failed to update payment status');
            }
        },
    },
    Payment: {
        merchant: async (parent, _, { prisma }) => {
            try {
                return await prisma.merchant.findUnique({
                    where: { id: parent.merchantId },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching payment merchant:', error);
                throw new Error('Failed to fetch payment merchant');
            }
        },
        invoice: async (parent, _, { prisma }) => {
            if (!parent.invoiceId)
                return null;
            try {
                return await prisma.invoice.findUnique({
                    where: { id: parent.invoiceId },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching payment invoice:', error);
                throw new Error('Failed to fetch payment invoice');
            }
        },
    },
};
//# sourceMappingURL=payment.js.map