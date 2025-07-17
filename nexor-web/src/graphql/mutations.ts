import { gql } from '@apollo/client';

// Payment Mutations
export const CREATE_PAYMENT = gql`
  mutation CreatePayment(
    $merchantId: ID!
    $amount: String!
    $tokenSymbol: String!
    $sourceAddress: String
    $invoiceId: ID
  ) {
    createPayment(
      merchantId: $merchantId
      amount: $amount
      tokenSymbol: $tokenSymbol
      sourceAddress: $sourceAddress
      invoiceId: $invoiceId
    ) {
      id
      merchantId
      amount
      amountUsd
      tokenSymbol
      sourceAddress
      destinationAddress
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

export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus(
    $id: ID!
    $status: PaymentStatus!
    $txHash: String
  ) {
    updatePaymentStatus(
      id: $id
      status: $status
      txHash: $txHash
    ) {
      id
      status
      txHash
      updatedAt
    }
  }
`;

// Invoice Mutations
export const CREATE_INVOICE = gql`
  mutation CreateInvoice(
    $merchantId: ID!
    $amount: String!
    $currency: String!
    $description: String
    $metadata: JSON
    $expiresAt: DateTime
  ) {
    createInvoice(
      merchantId: $merchantId
      amount: $amount
      currency: $currency
      description: $description
      metadata: $metadata
      expiresAt: $expiresAt
    ) {
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
    }
  }
`;

export const UPDATE_INVOICE_STATUS = gql`
  mutation UpdateInvoiceStatus(
    $id: ID!
    $status: InvoiceStatus!
  ) {
    updateInvoiceStatus(
      id: $id
      status: $status
    ) {
      id
      status
      updatedAt
    }
  }
`;

// Merchant Mutations
export const CREATE_MERCHANT = gql`
  mutation CreateMerchant(
    $name: String!
    $email: String!
    $webhookUrl: String
    $customization: MerchantCustomizationInput
  ) {
    createMerchant(
      name: $name
      email: $email
      webhookUrl: $webhookUrl
      customization: $customization
    ) {
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

export const UPDATE_MERCHANT = gql`
  mutation UpdateMerchant(
    $id: ID!
    $name: String
    $email: String
    $webhookUrl: String
    $customization: MerchantCustomizationInput
  ) {
    updateMerchant(
      id: $id
      name: $name
      email: $email
      webhookUrl: $webhookUrl
      customization: $customization
    ) {
      id
      name
      email
      webhookUrl
      updatedAt
      customization {
        primaryColor
        logoUrl
        buttonStyle
      }
    }
  }
`;

export const REGENERATE_API_KEY = gql`
  mutation RegenerateApiKey($id: ID!) {
    regenerateApiKey(id: $id) {
      id
      apiKey
      updatedAt
    }
  }
`;
