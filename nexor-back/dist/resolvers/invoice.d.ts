import { InvoiceStatus } from '@prisma/client';
import { Context, InvoiceInput } from '../types';
export declare const invoiceResolvers: {
    Query: {
        invoice: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            currency: string;
            description: string | null;
            dueDate: Date | null;
        } | null>;
        invoicesByMerchant: (_: any, { merchantId }: {
            merchantId: string;
        }, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            currency: string;
            description: string | null;
            dueDate: Date | null;
        }[]>;
        invoices: (_: any, __: any, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            currency: string;
            description: string | null;
            dueDate: Date | null;
        }[]>;
    };
    Mutation: {
        createInvoice: (_: any, { input }: {
            input: InvoiceInput;
        }, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            currency: string;
            description: string | null;
            dueDate: Date | null;
        }>;
        updateInvoiceStatus: (_: any, { id, status }: {
            id: string;
            status: InvoiceStatus;
        }, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            status: import(".prisma/client").$Enums.InvoiceStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            currency: string;
            description: string | null;
            dueDate: Date | null;
        }>;
        deleteInvoice: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<boolean>;
    };
    Invoice: {
        merchant: (parent: any, _: any, { prisma }: Context) => Promise<{
            id: string;
            apiKey: string;
            name: string;
            email: string;
            walletAddress: string;
            webhookUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            customizations: import("@prisma/client/runtime/library").JsonValue | null;
        } | null>;
        payments: (parent: any, _: any, { prisma }: Context) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            amount: number;
            amountUsd: number;
            sourceToken: string;
            destinationToken: string;
            sourceChain: string;
            destinationChain: string;
            sourceAddress: string;
            destinationAddress: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            txHash: string | null;
            invoiceId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[]>;
    };
};
//# sourceMappingURL=invoice.d.ts.map