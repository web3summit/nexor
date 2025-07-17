"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = void 0;
exports.typeDefs = `#graphql
  # Scalar types
  scalar JSON
  scalar DateTime

  # Enums
  enum PaymentStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
  }

  enum InvoiceStatus {
    UNPAID
    PARTIALLY_PAID
    PAID
    OVERDUE
    CANCELLED
  }

  # Types
  type Merchant {
    id: ID!
    name: String!
    email: String!
    walletAddress: String!
    apiKey: String!
    webhookUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    payments: [Payment!]
    invoices: [Invoice!]
    customizations: JSON
  }

  type Payment {
    id: ID!
    merchantId: ID!
    merchant: Merchant!
    amount: Float!
    amountUsd: Float!
    sourceToken: String!
    destinationToken: String!
    sourceChain: String!
    destinationChain: String!
    sourceAddress: String!
    destinationAddress: String!
    status: PaymentStatus!
    txHash: String
    invoiceId: ID
    invoice: Invoice
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Invoice {
    id: ID!
    merchantId: ID!
    merchant: Merchant!
    amount: Float!
    currency: String!
    description: String
    status: InvoiceStatus!
    dueDate: DateTime
    payments: [Payment!]
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type TokenPrice {
    id: ID!
    symbol: String!
    usdPrice: Float!
    updatedAt: DateTime!
  }

  # Input types
  input CreateMerchantInput {
    name: String!
    email: String!
    walletAddress: String!
    webhookUrl: String
    customizations: JSON
  }

  input UpdateMerchantInput {
    name: String
    email: String
    walletAddress: String
    webhookUrl: String
    customizations: JSON
  }

  input CreatePaymentInput {
    merchantId: ID!
    amount: Float!
    sourceToken: String!
    destinationToken: String!
    sourceChain: String!
    destinationChain: String!
    sourceAddress: String!
    invoiceId: ID
    metadata: JSON
  }

  input CreateInvoiceInput {
    merchantId: ID!
    amount: Float!
    currency: String!
    description: String
    dueDate: DateTime
    metadata: JSON
  }

  # Queries
  type Query {
    # Merchant queries
    merchant(id: ID!): Merchant
    merchantByApiKey(apiKey: String!): Merchant
    merchants: [Merchant!]!

    # Payment queries
    payment(id: ID!): Payment
    paymentsByMerchant(merchantId: ID!): [Payment!]!
    payments: [Payment!]!

    # Invoice queries
    invoice(id: ID!): Invoice
    invoicesByMerchant(merchantId: ID!): [Invoice!]!
    invoices: [Invoice!]!

    # Token price queries
    tokenPrice(symbol: String!): TokenPrice
    tokenPrices: [TokenPrice!]!
  }

  # Mutations
  type Mutation {
    # Merchant mutations
    createMerchant(input: CreateMerchantInput!): Merchant!
    updateMerchant(id: ID!, input: UpdateMerchantInput!): Merchant!
    deleteMerchant(id: ID!): Boolean!
    regenerateApiKey(id: ID!): String!

    # Payment mutations
    createPayment(input: CreatePaymentInput!): Payment!
    updatePaymentStatus(id: ID!, status: PaymentStatus!, txHash: String): Payment!

    # Invoice mutations
    createInvoice(input: CreateInvoiceInput!): Invoice!
    updateInvoiceStatus(id: ID!, status: InvoiceStatus!): Invoice!
    deleteInvoice(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=schema.js.map