import { gql } from '@apollo/client';

// Merchant Queries
export const GET_MERCHANT = gql`
  query GetMerchant($id: ID!) {
    merchant(id: $id) {
      id
      name
      email
      apiKey
      webhookUrl
      createdAt
      updatedAt
      customization {
        primaryColor
        logoUrl
        buttonStyle
      }
    }
  }
`;

// Payment Queries
export const GET_PAYMENT = gql`
  query GetPayment($id: ID!) {
    payment(id: $id) {
      id
      merchantId
      amount
      amountUsd
      tokenSymbol
      sourceAddress
      destinationAddress
      txHash
      status
      createdAt
      updatedAt
      expiresAt
      invoice {
        id
        status
      }
    }
  }
`;

export const GET_MERCHANT_PAYMENTS = gql`
  query GetMerchantPayments($merchantId: ID!, $limit: Int, $offset: Int) {
    payments(merchantId: $merchantId, limit: $limit, offset: $offset) {
      id
      amount
      amountUsd
      tokenSymbol
      sourceAddress
      destinationAddress
      txHash
      status
      createdAt
      updatedAt
    }
  }
`;

// Invoice Queries
export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      merchantId
      amount
      amountUsd
      currency
      status
      description
      metadata
      createdAt
      updatedAt
      expiresAt
      payments {
        id
        amount
        tokenSymbol
        status
        txHash
        createdAt
      }
    }
  }
`;

export const GET_MERCHANT_INVOICES = gql`
  query GetMerchantInvoices($merchantId: ID!, $limit: Int, $offset: Int) {
    invoices(merchantId: $merchantId, limit: $limit, offset: $offset) {
      id
      amount
      amountUsd
      currency
      status
      description
      createdAt
      updatedAt
      expiresAt
    }
  }
`;

// Token Price Queries
export const GET_TOKEN_PRICES = gql`
  query GetTokenPrices($symbols: [String!]!) {
    tokenPrices(symbols: $symbols) {
      symbol
      name
      priceUsd
      percentChange24h
      lastUpdated
    }
  }
`;

export const GET_TOKEN_PRICE = gql`
  query GetTokenPrice($symbol: String!) {
    tokenPrice(symbol: $symbol) {
      symbol
      name
      priceUsd
      percentChange24h
      lastUpdated
    }
  }
`;

// Alias exports for hooks compatibility
export const MERCHANT_BY_ID = GET_MERCHANT;
export const PAYMENTS_BY_MERCHANT = GET_MERCHANT_PAYMENTS;
export const PAYMENT_BY_ID = GET_PAYMENT;
export const INVOICES_BY_MERCHANT = GET_MERCHANT_INVOICES;
export const PAYMENTS_BY_INVOICE_ID = gql`
  query GetPaymentsByInvoiceId($invoiceId: ID!) {
    payments(invoiceId: $invoiceId) {
      id
      amount
      amountUsd
      tokenSymbol
      sourceAddress
      destinationAddress
      txHash
      status
      createdAt
      updatedAt
    }
  }
`;
