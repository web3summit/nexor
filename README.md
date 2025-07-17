# Nexor - Embeddable Multi-Token Payment Widget

A plug-and-play, non-custodial crypto payment widget for merchants to accept DOT, KSM, parachain tokens, USDC/USDT, and bridged Solana USDC — with integrations for ink! smart contracts, Hyperbridge cross-chain storage queries, and Hydration DEX swaps.

## Project Structure

```
root/
 ├─ nexor-blockchain/   # ink! smart contracts, on-chain logic
 ├─ nexor-back/         # Backend API (GraphQL resolvers, DB, Hyperbridge, Hydration)
 └─ nexor-web/          # Frontend (NextJS app, widget, merchant dashboard)
```

## Features

### Merchant

- One-line embeddable JS widget
- Accept payments in DOT, KSM, parachain tokens, USDC/USDT, Solana USDC
- Non-custodial: direct wallet-to-wallet
- Auto-token conversion via Hydration
- Cross-chain price feeds via Hyperbridge
- Merchant dashboard: payment history, invoices, webhook setup, customizations

### Customer

- Pay by scanning QR or connecting wallet (Polkadot.js, Talisman, SubWallet, Phantom for Solana)
- Automatic bridging if paying USDC on Solana
- Real-time USD conversion
- Trustless confirmation status

### Smart Contracts (ink!)

- Escrow, vaults, streaming payments, claim portals, etc.
- Use Assets precompile & XCM for cross-chain flows

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v17.5)
- Substrate node (for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nexor.git
cd nexor

# Install dependencies for frontend
cd nexor-web
npm install

# Install dependencies for backend
cd ../nexor-back
npm install
```

### Development

```bash
# Start the frontend development server
cd nexor-web
npm run dev

# Start the backend development server
cd ../nexor-back
npm run dev
```

### Widget Integration

To integrate the payment widget into your website, add the following script tag to your HTML:

```html
<script src="https://nexor.io/widget.js" id="nexor-widget" data-merchant-id="YOUR_MERCHANT_ID"></script>
```

Then add a payment button with the following attributes:

```html
<button data-nexor-pay data-amount="100" data-currency="DOT">Pay with Crypto</button>
```

## Architecture

The project follows Clean Architecture principles with a clear separation of concerns:

- **Presentation Layer**: UI components following Atomic Design
- **Domain Layer**: Business logic and entities
- **Data Layer**: API clients, repositories, and data sources

## License

MIT