import { merchantResolvers } from './merchant';
import { paymentResolvers } from './payment';
import { invoiceResolvers } from './invoice';
import { tokenPriceResolvers } from './tokenPrice';

export const resolvers = {
  Query: {
    ...merchantResolvers.Query,
    ...paymentResolvers.Query,
    ...invoiceResolvers.Query,
    ...tokenPriceResolvers.Query,
  },
  Mutation: {
    ...merchantResolvers.Mutation,
    ...paymentResolvers.Mutation,
    ...invoiceResolvers.Mutation,
  },
  Merchant: merchantResolvers.Merchant,
  Payment: paymentResolvers.Payment,
  Invoice: invoiceResolvers.Invoice,
};
