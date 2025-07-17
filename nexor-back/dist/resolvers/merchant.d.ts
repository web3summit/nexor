import { Context, MerchantInput } from '../types';
export declare const merchantResolvers: {
    Query: {
        merchant: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<{
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
        merchantByApiKey: (_: any, { apiKey }: {
            apiKey: string;
        }, { prisma }: Context) => Promise<{
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
        merchants: (_: any, __: any, { prisma }: Context) => Promise<{
            id: string;
            apiKey: string;
            name: string;
            email: string;
            walletAddress: string;
            webhookUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            customizations: import("@prisma/client/runtime/library").JsonValue | null;
        }[]>;
    };
    Mutation: {
        createMerchant: (_: any, { input }: {
            input: MerchantInput;
        }, { prisma }: Context) => Promise<{
            id: string;
            apiKey: string;
            name: string;
            email: string;
            walletAddress: string;
            webhookUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            customizations: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        updateMerchant: (_: any, { id, input }: {
            id: string;
            input: Partial<MerchantInput>;
        }, { prisma }: Context) => Promise<{
            id: string;
            apiKey: string;
            name: string;
            email: string;
            walletAddress: string;
            webhookUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            customizations: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        deleteMerchant: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<boolean>;
        regenerateApiKey: (_: any, { id }: {
            id: string;
        }, { prisma }: Context) => Promise<string>;
    };
    Merchant: {
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
        invoices: (parent: any, _: any, { prisma }: Context) => Promise<{
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
};
//# sourceMappingURL=merchant.d.ts.map