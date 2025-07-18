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

# Bounties

Nexor participates in multiple hackathon bounties, integrating cutting-edge Web3 technologies to create a comprehensive cross-chain payment solution.

## 🎯 Main Track: Embeddable Multi-Token Payment Widget

**Problem**: Merchants want to accept crypto payments but face complex integration challenges. Existing solutions are Ethereum-focused, require custody of funds, or don't support Polkadot ecosystem tokens. Small businesses can't afford custom development to accept DOT, KSM, or parachain tokens alongside USDC/USDT.

**Solution**: Plug-and-play payment widget that merchants embed with one line of code, enabling non-custodial crypto payments across Polkadot ecosystem tokens.

### Implementation

- **Frontend Widget** (`nexor-web/`): React-based embeddable JavaScript widget (<50KB)
- **Backend API** (`nexor-back/`): GraphQL API with PostgreSQL database for merchant management
- **Smart Contracts** (`nexor-blockchain/`): ink! contracts for payment processing and escrow

### Key Features

1. **For Merchants**:
   - Copy-paste embed code into any website
   - Accept DOT, KSM, USDC, USDT, parachain tokens
   - Receive payments directly to wallet (non-custodial)
   - View payment history in dashboard

2. **For Customers**:
   - Scan QR or connect wallet (Polkadot.js, Talisman, SubWallet)
   - Pay with any supported token
   - Auto-conversion via Hydration if needed
   - Instant payment confirmation

3. **Widget Features**:
   - Customizable appearance to match brand
   - Real-time price conversion to USD
   - Invoice generation with unique payment links
   - Webhook notifications for payment events

## 🌉 Hyperbridge: Cross-Chain Storage Queries

**Bounty Challenge**: Innovate with Hyperbridge SDK's ability to perform cross-chain storage queries. Create trustless price feed oracles or multi-chain identity aggregators.

**Our Integration**: Trustless cross-chain payment verification and price feed oracle using ISMP protocol.

### Implementation

```rust
// Real ISMP imports in cross_chain_swap contract
use ismp::{
    router::{PostRequest, PostResponse},
    host::StateMachine,
    messaging::{Message, Proof},
};
use pallet_ismp::dispatcher;
```

### Key Features

1. **Cross-Chain Price Oracle**:
   - Query token prices across multiple chains using ISMP storage queries
   - Trustless price aggregation from DEXs on different parachains
   - Real-time USD conversion for payment processing

2. **Cross-Chain Payment Verification**:
   - Verify payment completion across different chains
   - Query account balances and transaction status via ISMP
   - Enable merchants to accept payments from any supported parachain

3. **Multi-Chain State Queries**:
   - Query merchant preferences stored on different chains
   - Cross-chain identity verification for KYC compliance
   - Aggregate payment history across multiple parachains

### Technical Implementation

- **ISMP Dependencies**: `ismp v1.2.0`, `pallet-ismp v2503.1.0`
- **Cross-Chain Messaging**: PostRequest/PostResponse pattern
- **Storage Queries**: Direct parachain state queries via Hyperbridge
- **Price Feed Oracle**: Aggregates prices from Uniswap (Ethereum) and Hydration (Polkadot)

## 🦑 ink!: One-Click Stablecoin Swap

**Bounty Challenge**: Swap USDT (AssetHub) ↔ DOT (Acala) ↔ USDC (Hydration) in a single XCM bundle—user pays once, receives the best path.

**Our Integration**: Multi-hop cross-chain swap functionality integrated into the payment processor.

### Implementation

```rust
/// Initiate a multi-hop cross-chain swap
#[ink(message)]
pub fn initiate_multi_hop_swap(
    &mut self,
    source_token: String,
    target_token: String,
    source_chain: String,
    target_chain: String,
    input_amount: u128,
    expected_output: u128,
    route_steps: u32,
    timeout_hours: u32,
) -> Option<u32>
```

### Key Features

1. **Multi-Hop Routing**:
   - Optimal path finding: USDT → DOT → USDC
   - Single transaction execution across multiple chains
   - Automatic slippage protection and timeout handling

2. **Payment Processor Integration**:
   - Merchants specify preferred stablecoin (USDC/USDT)
   - Customers pay with any token (DOT, KSM, etc.)
   - Automatic conversion to merchant's preferred stablecoin

3. **XCM Bundle Execution**:
   - Single user signature for entire swap sequence
   - Atomic execution - either all steps succeed or all fail
   - Gas optimization across multiple parachain hops

### Supported Routes

- **USDT (AssetHub) → DOT (Relay Chain) → USDC (Hydration)**
- **KSM (Kusama) → DOT (Polkadot) → USDC (Hydration)**
- **ASTR (Astar) → DOT (Relay Chain) → USDT (AssetHub)**
- **Custom routes via Hydration DEX integration**

### Technical Architecture

- **Route Validation**: Smart contract validates supported token pairs and chains
- **Step Execution**: Each hop tracked with events and state updates
- **Failure Handling**: Automatic refunds if any step in the sequence fails
- **Integration**: Seamlessly integrated into payment widget for merchant use

## 🚀 Marketing: Launch Strategy & Growth

**Bounty Challenge**: Create a 30-90 day launch strategy to transform Nexor from "cool prototype" to "people actually being excited about this thing."

**Our Strategy**: Multi-phase go-to-market approach targeting e-commerce merchants, crypto-native businesses, and Web3 developers.

### Launch Timeline

**Phase 1: Foundation (Days 1-30)**
- **Week 1-2**: Beta launch with 10 pilot merchants (Shopify stores, crypto services)
- **Week 3-4**: Community building via Twitter, Discord, and developer forums
- **Target**: 50 widget installations, $10K+ in processed payments

**Phase 2: Growth (Days 31-60)**
- **Week 5-6**: Content marketing (tutorials, case studies, integration guides)
- **Week 7-8**: Partnership outreach (Shopify app store, WooCommerce plugins)
- **Target**: 200 active merchants, $50K+ monthly payment volume

**Phase 3: Scale (Days 61-90)**
- **Week 9-10**: Influencer partnerships with crypto YouTubers and business podcasts
- **Week 11-12**: Conference presence (Web3 events, e-commerce summits)
- **Target**: 500+ merchants, $200K+ monthly volume

### Key Marketing Assets

1. **Landing Page**: nexor.xyz with interactive widget demo
2. **Explainer Video**: "Accept Crypto Payments in 60 Seconds"
3. **Case Studies**: Real merchants sharing revenue impact
4. **Developer Docs**: Integration guides for popular platforms

### Target Audiences

- **Primary**: Small-medium e-commerce businesses (Shopify, WooCommerce)
- **Secondary**: Crypto-native services (DeFi protocols, NFT marketplaces)
- **Tertiary**: Web3 developers building payment solutions

### Competitive Advantage

- **vs. Coinbase Commerce**: Supports Polkadot ecosystem tokens
- **vs. BitPay**: Non-custodial, direct wallet-to-wallet payments
- **vs. Stripe Crypto**: Lower fees, no KYC requirements

## 🎨 UX: Polkadot UX Excellence

**Bounty Challenge**: Integrate UX best practices to create exceptional user experience for both merchants and customers.

**Our Approach**: User-centered design focusing on simplicity, trust, and seamless cross-chain interactions.

### UX Design Principles

1. **Simplicity First**:
   - One-click widget installation for merchants
   - Scan-to-pay QR codes for customers
   - Auto-detection of wallet types and supported tokens

2. **Trust & Transparency**:
   - Real-time payment status updates
   - Clear fee breakdown before transaction
   - Non-custodial messaging to build confidence

3. **Cross-Chain Clarity**:
   - Visual representation of multi-hop swaps
   - Clear token conversion rates and paths
   - Estimated completion times for cross-chain transactions

### Key UX Improvements

**Merchant Dashboard**:
- Clean, minimal interface inspired by Stripe's design
- Real-time payment notifications with sound alerts
- One-click CSV export for accounting integration
- Customizable widget appearance with live preview

**Payment Widget**:
- Progressive disclosure: show complexity only when needed
- Smart defaults: auto-select best payment method
- Error handling: clear messages with suggested solutions
- Mobile-first responsive design

**Customer Payment Flow**:
1. **Token Selection**: Visual token picker with balance display
2. **Conversion Preview**: "You pay X DOT, merchant receives Y USDC"
3. **Wallet Connection**: One-click connection with popular wallets
4. **Transaction Confirmation**: Clear summary before signing
5. **Success State**: Confirmation with transaction hash and receipt

### UX Research & Testing

- **User Interviews**: 20+ merchants and customers
- **Usability Testing**: A/B testing on payment completion rates
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Performance**: <3 second load times, <50KB widget size

### Post-Hackathon UX Roadmap

**Milestone 1**: Complete user research and wireframe validation
**Milestone 2**: Implement mentorship feedback and best practices
**Integration Goals**: Achieve >90% payment completion rate and <5% user drop-off

## 🏆 Bounty Integration Summary

| Bounty | Focus | Integration | Impact |
|--------|-------|-------------|--------|
| **Main Track** | Payment Widget | Embeddable JS widget with full-stack architecture | Enables any merchant to accept crypto payments |
| **Hyperbridge** | Cross-Chain Queries | Price oracle + payment verification | Trustless cross-chain operations |
| **ink!** | Multi-Hop Swaps | One-click stablecoin conversion | Seamless UX for customers paying in any token |
| **Marketing** | Launch Strategy | 30-90 day go-to-market plan | Transforms prototype into user-adopted product |
| **UX** | User Experience | User-centered design with Polkadot UX best practices | Exceptional experience for merchants and customers |

Nexor demonstrates the power of combining cutting-edge Web3 technologies with strategic marketing and exceptional UX design to create a production-ready payment solution that bridges the gap between traditional e-commerce and the multi-chain Web3 ecosystem.

## License

MIT