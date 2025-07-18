//! Full ink! smart contract with Hyperbridge integration via chain extension
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;
use alloc::vec::Vec;
use ink::prelude::*;
use scale::{Decode, Encode};

/// Parameters passed to the Hyperbridge teleport call
#[derive(Debug, Encode, Decode, Clone)]
pub struct TeleportParams {
    pub asset_id: u32,
    pub destination: u8, // StateMachine ID
    pub recipient: [u8; 32],
    pub amount: u128,
    pub timeout: u64,
    pub token_gateway: Vec<u8>,
    pub relayer_fee: u128,
    pub call_data: Option<Vec<u8>>,
    pub redeem: bool,
}

/// Custom error type for chain extension
#[derive(Debug, Copy, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct ChainExtensionError {
    pub code: u32,
}

impl ink::env::chain_extension::FromStatusCode for ChainExtensionError {
    fn from_status_code(status_code: u32) -> Result<(), Self> {
        match status_code {
            0 => Ok(()),
            _ => Err(ChainExtensionError { code: status_code }),
        }
    }
}

impl From<scale::Error> for ChainExtensionError {
    fn from(_: scale::Error) -> Self {
        ChainExtensionError { code: 1 }
    }
}

/// Chain extension definition to wrap `pallet_token_gateway::teleport`
#[ink::chain_extension(extension = 1)]
pub trait TokenGatewayExt {
    type ErrorCode = ChainExtensionError;

    #[ink(function = 0)]
    fn teleport(params: TeleportParams) -> Result<(), ChainExtensionError>;
}

/// Custom environment that includes our chain extension
#[derive(Debug, Clone, PartialEq, Eq)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum CustomEnvironment {}

impl ink::env::Environment for CustomEnvironment {
    const MAX_EVENT_TOPICS: usize = <ink::env::DefaultEnvironment as ink::env::Environment>::MAX_EVENT_TOPICS;

    type AccountId = <ink::env::DefaultEnvironment as ink::env::Environment>::AccountId;
    type Balance = <ink::env::DefaultEnvironment as ink::env::Environment>::Balance;
    type Hash = <ink::env::DefaultEnvironment as ink::env::Environment>::Hash;
    type BlockNumber = <ink::env::DefaultEnvironment as ink::env::Environment>::BlockNumber;
    type Timestamp = <ink::env::DefaultEnvironment as ink::env::Environment>::Timestamp;
    type ChainExtension = TokenGatewayExt;
}

#[ink::contract(env = crate::CustomEnvironment)]
pub mod bridge_contract {
    use super::*;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum ContractError {
        InsufficientFunds,
        ExtensionFailed(u32),
    }

    #[ink(storage)]
    pub struct Bridge {
        pub owner: AccountId,
    }

    impl Bridge {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
            }
        }

        /// Payable message to bridge DOT to USDC or other stablecoin on target chain
        #[ink(message, payable)]
        pub fn bridge_and_send(
            &mut self,
            destination: u8,              // e.g. StateMachine::Ethereum = 1
            recipient: [u8; 32],         // must be 32-byte padded
            asset_id: u32,               // USDC asset ID on this chain
            amount: Balance,
            timeout: u64,                // UNIX timestamp or block height
            token_gateway: Vec<u8>,      // gateway address on destination chain
            relayer_fee: Balance,        // fee for relayers
            redeem: bool                 // true if redeeming existing tokens
        ) -> Result<(), ContractError> {
            let sent = Self::env().transferred_value();
            if sent < amount {
                return Err(ContractError::InsufficientFunds);
            }

            let params = TeleportParams {
                asset_id,
                destination,
                recipient,
                amount,
                timeout,
                token_gateway,
                relayer_fee,
                call_data: None,
                redeem,
            };

            Self::env()
                .extension()
                .teleport(params)
                .map_err(|e| ContractError::ExtensionFailed(e.code))
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test;

        #[ink::test]
        fn test_insufficient_funds() {
            let mut contract = Bridge::new();
            test::set_value_transferred::<ink::env::DefaultEnvironment>(500);
            let result = contract.bridge_and_send(
                1,
                [0u8; 32],
                1,
                1000,
                0,
                vec![],
                0,
                false
            );
            assert_eq!(result, Err(ContractError::InsufficientFunds));
        }

        #[ink::test]
        fn test_constructor_sets_owner() {
            let accounts = test::default_accounts::<ink::env::DefaultEnvironment>();
            test::set_caller::<ink::env::DefaultEnvironment>(accounts.alice);
            let contract = Bridge::new();
            assert_eq!(contract.owner, accounts.alice);
        }
    }
}