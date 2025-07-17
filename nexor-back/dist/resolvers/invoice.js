"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceResolvers = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
exports.invoiceResolvers = {
    Query: {
        invoice: async (_, { id }, { prisma }) => {
            try {
                return await prisma.invoice.findUnique({
                    where: { id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoice:', error);
                throw new Error('Failed to fetch invoice');
            }
        },
        invoicesByMerchant: async (_, { merchantId }, { prisma }) => {
            try {
                return await prisma.invoice.findMany({
                    where: { merchantId },
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoices by merchant:', error);
                throw new Error('Failed to fetch invoices');
            }
        },
        invoices: async (_, __, { prisma }) => {
            try {
                return await prisma.invoice.findMany({
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoices:', error);
                throw new Error('Failed to fetch invoices');
            }
        },
    },
    Mutation: {
        createInvoice: async (_, { input }, { prisma }) => {
            try {
                return await prisma.invoice.create({
                    data: {
                        ...input,
                        status: client_1.InvoiceStatus.UNPAID,
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Error creating invoice:', error);
                throw new Error('Failed to create invoice');
            }
        },
        updateInvoiceStatus: async (_, { id, status }, { prisma }) => {
            try {
                return await prisma.invoice.update({
                    where: { id },
                    data: {
                        status,
                        updatedAt: new Date(),
                    },
                });
            }
            catch (error) {
                logger_1.logger.error('Error updating invoice status:', error);
                throw new Error('Failed to update invoice status');
            }
        },
        deleteInvoice: async (_, { id }, { prisma }) => {
            try {
                await prisma.invoice.delete({
                    where: { id },
                });
                return true;
            }
            catch (error) {
                logger_1.logger.error('Error deleting invoice:', error);
                throw new Error('Failed to delete invoice');
            }
        },
    },
    Invoice: {
        merchant: async (parent, _, { prisma }) => {
            try {
                return await prisma.merchant.findUnique({
                    where: { id: parent.merchantId },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoice merchant:', error);
                throw new Error('Failed to fetch invoice merchant');
            }
        },
        payments: async (parent, _, { prisma }) => {
            try {
                return await prisma.payment.findMany({
                    where: { invoiceId: parent.id },
                });
            }
            catch (error) {
                logger_1.logger.error('Error fetching invoice payments:', error);
                throw new Error('Failed to fetch invoice payments');
            }
        },
    },
};
//# sourceMappingURL=invoice.js.map