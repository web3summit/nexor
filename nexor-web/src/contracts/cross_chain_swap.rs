#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod cross_chain_swap {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, PartialEq, Eq, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum SwapStatus {
        Initiated,
        Locked,
        Completed,
        Refunded,
        Expired,
    }

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct SwapInfo {
        initiator: AccountId,
        recipient: AccountId,
        source_token: String,
        source_amount: Balance,
        target_token: String,
        target_amount: Balance,
        target_chain: String,
        hash_lock: [u8; 32],
        timeout: Timestamp,
        status: SwapStatus,
        secret: Option<[u8; 32]>,
    }

    #[ink(storage)]
    pub struct CrossChainSwap {
        swaps: HashMap<u32, SwapInfo>,
        swap_count: u32,
        user_swaps: HashMap<AccountId, Vec<u32>>,
    }

    #[ink(event)]
    pub struct SwapInitiated {
        #[ink(topic)]
        swap_id: u32,
        #[ink(topic)]
        initiator: AccountId,
        #[ink(topic)]
        recipient: AccountId,
        source_token: String,
        source_amount: Balance,
        target_token: String,
        target_amount: Balance,
        target_chain: String,
        hash_lock: [u8; 32],
        timeout: Timestamp,
    }

    #[ink(event)]
    pub struct SwapLocked {
        #[ink(topic)]
        swap_id: u32,
        #[ink(topic)]
        locker: AccountId,
    }

    #[ink(event)]
    pub struct SwapCompleted {
        #[ink(topic)]
        swap_id: u32,
        #[ink(topic)]
        claimer: AccountId,
        secret: [u8; 32],
    }

    #[ink(event)]
    pub struct SwapRefunded {
        #[ink(topic)]
        swap_id: u32,
        #[ink(topic)]
        refunder: AccountId,
    }

    impl CrossChainSwap {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                swaps: HashMap::new(),
                swap_count: 0,
                user_swaps: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn initiate_swap(
            &mut self,
            recipient: AccountId,
            source_token: String,
            source_amount: Balance,
            target_token: String,
            target_amount: Balance,
            target_chain: String,
            hash_lock: [u8; 32],
            timeout_duration: u64,
        ) -> u32 {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Validate inputs
            assert!(source_amount > 0, "Source amount must be greater than 0");
            assert!(target_amount > 0, "Target amount must be greater than 0");
            assert!(!target_chain.is_empty(), "Target chain cannot be empty");
            assert!(timeout_duration > 0, "Timeout must be greater than 0");
            
            let swap_id = self.swap_count;
            self.swap_count += 1;
            
            // Create new swap
            let swap_info = SwapInfo {
                initiator: caller,
                recipient,
                source_token,
                source_amount,
                target_token,
                target_amount,
                target_chain,
                hash_lock,
                timeout: current_time + timeout_duration,
                status: SwapStatus::Initiated,
                secret: None,
            };
            
            // Store swap
            self.swaps.insert(swap_id, swap_info);
            
            // Update user mapping
            self.add_user_swap(caller, swap_id);
            self.add_user_swap(recipient, swap_id);
            
            // Emit event
            self.env().emit_event(SwapInitiated {
                swap_id,
                initiator: caller,
                recipient,
                source_token: self.swaps.get(&swap_id).unwrap().source_token.clone(),
                source_amount,
                target_token: self.swaps.get(&swap_id).unwrap().target_token.clone(),
                target_amount,
                target_chain: self.swaps.get(&swap_id).unwrap().target_chain.clone(),
                hash_lock,
                timeout: current_time + timeout_duration,
            });
            
            swap_id
        }

        #[ink(message)]
        pub fn lock_swap(&mut self, swap_id: u32) -> bool {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Check swap exists
            assert!(self.swaps.contains_key(&swap_id), "Swap does not exist");
            
            let swap = self.swaps.get(&swap_id).unwrap();
            
            // Check swap is in initiated state
            assert!(swap.status == SwapStatus::Initiated, "Swap is not in initiated state");
            
            // Check swap is not expired
            assert!(current_time < swap.timeout, "Swap is expired");
            
            // Update swap status
            let mut swap = self.swaps.get_mut(&swap_id).unwrap();
            swap.status = SwapStatus::Locked;
            
            // Emit event
            self.env().emit_event(SwapLocked {
                swap_id,
                locker: caller,
            });
            
            // In a real implementation, we would lock the tokens here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn complete_swap(&mut self, swap_id: u32, secret: [u8; 32]) -> bool {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Check swap exists
            assert!(self.swaps.contains_key(&swap_id), "Swap does not exist");
            
            let swap = self.swaps.get(&swap_id).unwrap();
            
            // Check swap is in locked state
            assert!(swap.status == SwapStatus::Locked, "Swap is not in locked state");
            
            // Check swap is not expired
            assert!(current_time < swap.timeout, "Swap is expired");
            
            // Verify hash lock with secret
            let hash = self.hash_secret(&secret);
            assert!(hash == swap.hash_lock, "Invalid secret");
            
            // Update swap status and store secret
            let mut swap = self.swaps.get_mut(&swap_id).unwrap();
            swap.status = SwapStatus::Completed;
            swap.secret = Some(secret);
            
            // Emit event
            self.env().emit_event(SwapCompleted {
                swap_id,
                claimer: caller,
                secret,
            });
            
            // In a real implementation, we would transfer tokens to the recipient here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn refund_swap(&mut self, swap_id: u32) -> bool {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Check swap exists
            assert!(self.swaps.contains_key(&swap_id), "Swap does not exist");
            
            let swap = self.swaps.get(&swap_id).unwrap();
            
            // Check swap is in initiated or locked state
            assert!(
                swap.status == SwapStatus::Initiated || swap.status == SwapStatus::Locked,
                "Swap cannot be refunded"
            );
            
            // Check swap is expired
            assert!(current_time >= swap.timeout, "Swap is not expired yet");
            
            // Check caller is initiator
            assert!(caller == swap.initiator, "Only initiator can refund");
            
            // Update swap status
            let mut swap = self.swaps.get_mut(&swap_id).unwrap();
            swap.status = SwapStatus::Refunded;
            
            // Emit event
            self.env().emit_event(SwapRefunded {
                swap_id,
                refunder: caller,
            });
            
            // In a real implementation, we would refund tokens to the initiator here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn get_swap(&self, swap_id: u32) -> Option<(
            AccountId,
            AccountId,
            String,
            Balance,
            String,
            Balance,
            String,
            [u8; 32],
            Timestamp,
            SwapStatus,
            Option<[u8; 32]>
        )> {
            if let Some(swap) = self.swaps.get(&swap_id) {
                // Check if swap is expired but not marked as such
                let current_time = self.env().block_timestamp();
                if current_time >= swap.timeout && 
                   (swap.status == SwapStatus::Initiated || swap.status == SwapStatus::Locked) {
                    return Some((
                        swap.initiator,
                        swap.recipient,
                        swap.source_token.clone(),
                        swap.source_amount,
                        swap.target_token.clone(),
                        swap.target_amount,
                        swap.target_chain.clone(),
                        swap.hash_lock,
                        swap.timeout,
                        SwapStatus::Expired,
                        swap.secret,
                    ));
                }
                
                Some((
                    swap.initiator,
                    swap.recipient,
                    swap.source_token.clone(),
                    swap.source_amount,
                    swap.target_token.clone(),
                    swap.target_amount,
                    swap.target_chain.clone(),
                    swap.hash_lock,
                    swap.timeout,
                    swap.status.clone(),
                    swap.secret,
                ))
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn get_user_swaps(&self, user: AccountId) -> Vec<u32> {
            self.user_swaps.get(&user).unwrap_or(&Vec::new()).clone()
        }

        #[ink(message)]
        pub fn verify_secret(&self, hash_lock: [u8; 32], secret: [u8; 32]) -> bool {
            self.hash_secret(&secret) == hash_lock
        }

        // Helper function to hash a secret
        fn hash_secret(&self, secret: &[u8; 32]) -> [u8; 32] {
            // In a real implementation, we would use a proper hashing function
            // For now, we'll just return the secret as the hash for simplicity
            *secret
        }

        // Helper function to add swap to user's list
        fn add_user_swap(&mut self, user: AccountId, swap_id: u32) {
            let mut user_swaps = self.user_swaps.get(&user).unwrap_or(&Vec::new()).clone();
            user_swaps.push(swap_id);
            self.user_swaps.insert(user, user_swaps);
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn swap_flow_works() {
            let mut swap = CrossChainSwap::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice (initiator)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            // Create a hash lock and secret
            let secret = [1u8; 32];
            let hash_lock = secret; // In our simplified implementation, hash = secret
            
            let swap_id = swap.initiate_swap(
                accounts.bob, // recipient
                "DOT".to_string(),
                100,
                "KSM".to_string(),
                200,
                "kusama".to_string(),
                hash_lock,
                3600000, // 1 hour timeout
            );
            
            assert_eq!(swap_id, 0);
            
            // Lock the swap
            let result = swap.lock_swap(swap_id);
            assert!(result);
            
            // Set caller to Bob (recipient)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            // Complete the swap with the secret
            let result = swap.complete_swap(swap_id, secret);
            assert!(result);
            
            let swap_info = swap.get_swap(swap_id).unwrap();
            assert_eq!(swap_info.9, SwapStatus::Completed); // status
            assert_eq!(swap_info.10, Some(secret)); // revealed secret
        }

        #[ink::test]
        fn refund_expired_swap_works() {
            let mut swap = CrossChainSwap::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice (initiator)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            // Create a hash lock and secret
            let secret = [1u8; 32];
            let hash_lock = secret; // In our simplified implementation, hash = secret
            
            let swap_id = swap.initiate_swap(
                accounts.bob, // recipient
                "DOT".to_string(),
                100,
                "KSM".to_string(),
                200,
                "kusama".to_string(),
                hash_lock,
                3600000, // 1 hour timeout
            );
            
            // Lock the swap
            swap.lock_swap(swap_id);
            
            // Advance time beyond timeout
            ink_env::test::advance_block::<ink_env::DefaultEnvironment>();
            let current_time = ink_env::test::block_timestamp::<ink_env::DefaultEnvironment>();
            ink_env::test::set_block_timestamp::<ink_env::DefaultEnvironment>(current_time + 3600001);
            
            // Refund the swap
            let result = swap.refund_swap(swap_id);
            assert!(result);
            
            let swap_info = swap.get_swap(swap_id).unwrap();
            assert_eq!(swap_info.9, SwapStatus::Refunded); // status
        }
    }
}
