import { gql } from '@apollo/client';

export const typeDefs = gql`
  # Merchant types
  type Merchant {
    id: ID!
    name: String!
    email: String!
    apiKey: String!
    createdAt: String!
    updatedAt: String!
    widgetSettings: WidgetSettings
    webhookUrl: String
    webhookSecret: String
    supportEmail: String
    supportUrl: String
    termsUrl: String
    privacyUrl: String
  }

  type WidgetSettings {
    primaryColor: String
    logoUrl: String
    buttonStyle: String
    supportedTokens: [String!]
    defaultToken: String
    modalTitle: String
    successRedirectUrl: String
    cancelRedirectUrl: String
  }

  # Payment types
  type Payment {
    id: ID!
    merchantId: String!
    amount: String!
    amountUsd: String!
    tokenSymbol: String!
    status: PaymentStatus!
    txHash: String
    createdAt: String!
    updatedAt: String!
    invoiceId: String
    customerEmail: String
    description: String
    metadata: JSONObject
  }

  enum PaymentStatus {
    pending
    processing
    completed
    failed
  }

  # Invoice types
  type Invoice {
    id: ID!
    merchantId: String!
    amount: String!
    amountUsd: String!
    currency: String!
    status: InvoiceStatus!
    createdAt: String!
    updatedAt: String!
    expiresAt: String
    paymentId: String
    customerEmail: String
    customerName: String
    description: String
    metadata: JSONObject
    paymentUrl: String
  }

  enum InvoiceStatus {
    PENDING
    PAID
    EXPIRED
    CANCELLED
  }

  # Token types
  type Token {
    symbol: String!
    name: String!
    network: String!
    decimals: Int!
    logoUrl: String
    usdPrice: Float!
  }

  # Transaction types
  type Transaction {
    hash: String!
    network: String!
    from: String!
    to: String!
    amount: String!
    tokenSymbol: String!
    blockNumber: Int
    timestamp: String
    status: TransactionStatus!
    confirmations: Int!
    explorerUrl: String!
  }

  enum TransactionStatus {
    pending
    processing
    confirmed
    failed
  }

  # Analytics types
  type PaymentAnalytics {
    totalPayments: Int!
    totalVolumeUsd: Float!
    successRate: Float!
    averagePaymentAmount: Float!
    paymentsByToken: [TokenVolume!]!
    paymentsByStatus: [StatusCount!]!
    paymentsByDay: [DailyPayments!]!
  }

  type TokenVolume {
    token: String!
    count: Int!
    volumeUsd: Float!
  }

  type StatusCount {
    status: PaymentStatus!
    count: Int!
  }

  type DailyPayments {
    date: String!
    count: Int!
    volumeUsd: Float!
  }

  # Pagination types
  type PaginatedPayments {
    payments: [Payment!]!
    totalCount: Int!
  }

  type PaginatedInvoices {
    invoices: [Invoice!]!
    totalCount: Int!
  }

  # Custom scalar for JSON objects
  scalar JSONObject

  # Queries
  type Query {
    # Merchant queries
    merchant(id: ID!): Merchant
    
    # Payment queries
    payment(id: ID!): Payment
    paymentsByMerchant(
      merchantId: ID!
      status: PaymentStatus
      startDate: String
      endDate: String
      search: String
      tokenSymbol: String
      limit: Int
      offset: Int
    ): PaginatedPayments
    
    # Invoice queries
    invoice(id: ID!): Invoice
    invoicesByMerchant(
      merchantId: ID!
      status: InvoiceStatus
      startDate: String
      endDate: String
      search: String
      limit: Int
      offset: Int
    ): PaginatedInvoices
    
    # Token queries
    supportedTokens: [Token!]!
    tokenPrice(symbol: String!): Float
    
    # Transaction queries
    transaction(hash: String!, network: String!): Transaction
    
    # Analytics queries
    paymentAnalytics(
      merchantId: ID!
      startDate: String
      endDate: String
    ): PaymentAnalytics
  }

  # Mutations
  type Mutation {
    # Merchant mutations
    updateMerchant(
      id: ID!
      name: String
      email: String
      webhookUrl: String
      webhookSecret: String
      supportEmail: String
      supportUrl: String
      termsUrl: String
      privacyUrl: String
      widgetSettings: WidgetSettingsInput
    ): Merchant
    
    regenerateApiKey(id: ID!): String
    
    # Invoice mutations
    createInvoice(
      merchantId: ID!
      amount: String!
      currency: String!
      description: String
      customerEmail: String
      customerName: String
      metadata: JSONObject
      expiresIn: Int
    ): Invoice
    
    cancelInvoice(id: ID!): Invoice
    
    # Payment mutations
    initiatePayment(
      merchantId: ID!
      amount: String!
      tokenSymbol: String!
      description: String
      customerEmail: String
      metadata: JSONObject
      invoiceId: String
    ): Payment
    
    updatePaymentStatus(
      id: ID!
      status: PaymentStatus!
      txHash: String
    ): Payment
  }

  # Input types
  input WidgetSettingsInput {
    primaryColor: String
    logoUrl: String
    buttonStyle: String
    supportedTokens: [String!]
    defaultToken: String
    modalTitle: String
    successRedirectUrl: String
    cancelRedirectUrl: String
  }

  # Subscriptions
  type Subscription {
    paymentStatusChanged(merchantId: ID!): Payment
    newPayment(merchantId: ID!): Payment
  }
`;

export default typeDefs;
