# Nexor Contract Tester

A minimal Next.js frontend for testing deployed ink! contracts using the Polkadot API ink-sdk.

## Features

- Connect to local ink! node (ws://127.0.0.1:9944)
- Test cross_chain_swap contract functionality
- Merchant registration and payment processing
- Real-time activity logging
- Mock wallet integration for testing

## Getting Started

### Prerequisites

1. Make sure you have a local ink! node running on port 9944
2. Deploy your cross_chain_swap contract to the local node
3. Note the contract address for testing

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the contract tester.

## Contract Integration

This frontend is designed to test the following contract functions:

### Cross Chain Swap Contract
- `register_merchant(stablecoin, settlement_chain)` - Register merchant preferences
- `process_payment(merchant, token, chain, amount)` - Process customer payment
- `get_payment_status(payment_id)` - Get payment details
- `get_merchant_preferences()` - Get merchant settings
- `is_registered_merchant()` - Check registration status
- `get_payment_count()` - Get total payments

### Key Registry Contract
- `register_tag(tag)` - Register user tag
- `lookup_address(tag)` - Get address by tag
- `get_tag()` - Get current user's tag

## Usage

1. **Connect to Node**: Click "Connect to Local Node" to establish connection
2. **Contract Address**: Enter your deployed contract address
3. **Connect to Contract**: Load contract metadata and establish connection
4. **Test Functions**: Use the UI to test various contract functions
5. **Monitor Logs**: Check the activity log for transaction results

## Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Blockchain**: Polkadot API with ink-sdk for contract interaction
- **Backend**: GraphQL integration ready (connects to nexor-back)
- **Testing**: DRink testing framework integration (hackathon requirement)

## Next Steps

1. Set up proper type generation using papi CLI
2. Implement real wallet integration
3. Add GraphQL backend connection
4. Implement DRink testing suite
5. Deploy to production environment

## Development Notes

This is a minimal testing interface created for hackathon development. The current implementation uses simulated connections and mock data for rapid prototyping. For production use, you'll need to:

- Generate proper type definitions using `papi add` and `papi ink add`
- Set up real WebSocket providers
- Implement proper wallet integration
- Add error handling and validation
- Connect to the GraphQL backend service
