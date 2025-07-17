import { Context } from '../types';
export declare const tokenPriceResolvers: {
    Query: {
        tokenPrice: (_: any, { symbol }: {
            symbol: string;
        }, { prisma }: Context) => Promise<{
            symbol: string;
            id: string;
            updatedAt: Date;
            usdPrice: number;
        }>;
        tokenPrices: (_: any, __: any, { prisma }: Context) => Promise<{
            symbol: string;
            id: string;
            updatedAt: Date;
            usdPrice: number;
        }[]>;
    };
};
//# sourceMappingURL=tokenPrice.d.ts.map