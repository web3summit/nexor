import { PaymentStatus } from '@prisma/client';
import { Context, PaymentInput } from '../types';
export declare const paymentResolvers: {
    Query: {
        payment: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<{
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
        } | null>;
        paymentsByMerchant: (_: any, { merchantId }: {
            merchantId: string;
        }, { prisma }: Context) => Promise<{
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
        payments: (_: any, __: any, { prisma }: Context) => Promise<{
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
    Mutation: {
        createPayment: (_: any, { input }: {
            input: PaymentInput;
        }, { prisma }: Context) => Promise<{
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
        }>;
        updatePaymentStatus: (_: any, { id, status, txHash }: {
            id: string;
            status: PaymentStatus;
            txHash?: string;
        }, { prisma }: Context) => Promise<{
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
        }>;
    };
    Payment: {
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
        invoice: (parent: any, _: any, { prisma }: Context) => Promise<{
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
    };
};
//# sourceMappingURL=payment.d.ts.map