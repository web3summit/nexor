export declare const resolvers: {
    Query: {
        tokenPrice: (_: any, { symbol }: {
            symbol: string;
        }, { prisma }: import("../types").Context) => Promise<{
            symbol: string;
            id: string;
            updatedAt: Date;
            usdPrice: number;
        }>;
        tokenPrices: (_: any, __: any, { prisma }: import("../types").Context) => Promise<{
            symbol: string;
            id: string;
            updatedAt: Date;
            usdPrice: number;
        }[]>;
        invoice: (_: any, { id }: {
            id: string;
        }, { prisma }: import("../types").Context) => Promise<{
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
        }, { prisma }: import("../types").Context) => Promise<{
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
        invoices: (_: any, __: any, { prisma }: import("../types").Context) => Promise<{
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
        payment: (_: any, { id }: {
            id: string;
        }, { prisma }: import("../types").Context) => Promise<{
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
        }, { prisma }: import("../types").Context) => Promise<{
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
        payments: (_: any, __: any, { prisma }: import("../types").Context) => Promise<{
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
        merchant: (_: any, { id }: {
            id: string;
        }, { prisma }: import("../types").Context) => Promise<{
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
        }, { prisma }: import("../types").Context) => Promise<{
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
        merchants: (_: any, __: any, { prisma }: import("../types").Context) => Promise<{
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
        createInvoice: (_: any, { input }: {
            input: import("../types").InvoiceInput;
        }, { prisma }: import("../types").Context) => Promise<{
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
            status: import(".prisma/client").InvoiceStatus;
        }, { prisma }: import("../types").Context) => Promise<{
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
        }, { prisma }: import("../types").Context) => Promise<boolean>;
        createPayment: (_: any, { input }: {
            input: import("../types").PaymentInput;
        }, { prisma }: import("../types").Context) => Promise<{
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
            status: import(".prisma/client").PaymentStatus;
            txHash?: string;
        }, { prisma }: import("../types").Context) => Promise<{
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
        createMerchant: (_: any, { input }: {
            input: import("../types").MerchantInput;
        }, { prisma }: import("../types").Context) => Promise<{
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
            input: Partial<import("../types").MerchantInput>;
        }, { prisma }: import("../types").Context) => Promise<{
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
        }, { prisma }: import("../types").Context) => Promise<boolean>;
        regenerateApiKey: (_: any, { id }: {
            id: string;
        }, { prisma }: import("../types").Context) => Promise<string>;
    };
    Merchant: {
        payments: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
        invoices: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
    Payment: {
        merchant: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
        invoice: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
    Invoice: {
        merchant: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
        payments: (parent: any, _: any, { prisma }: import("../types").Context) => Promise<{
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
//# sourceMappingURL=index.d.ts.map