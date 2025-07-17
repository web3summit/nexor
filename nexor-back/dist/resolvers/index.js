"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const merchant_1 = require("./merchant");
const payment_1 = require("./payment");
const invoice_1 = require("./invoice");
const tokenPrice_1 = require("./tokenPrice");
exports.resolvers = {
    Query: {
        ...merchant_1.merchantResolvers.Query,
        ...payment_1.paymentResolvers.Query,
        ...invoice_1.invoiceResolvers.Query,
        ...tokenPrice_1.tokenPriceResolvers.Query,
    },
    Mutation: {
        ...merchant_1.merchantResolvers.Mutation,
        ...payment_1.paymentResolvers.Mutation,
        ...invoice_1.invoiceResolvers.Mutation,
    },
    Merchant: merchant_1.merchantResolvers.Merchant,
    Payment: payment_1.paymentResolvers.Payment,
    Invoice: invoice_1.invoiceResolvers.Invoice,
};
//# sourceMappingURL=index.js.map