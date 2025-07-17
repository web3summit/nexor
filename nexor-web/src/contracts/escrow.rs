#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod escrow {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, PartialEq, Eq, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowStatus {
        Active,
        Released,
        Refunded,
        Disputed,
    }

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct EscrowInfo {
        seller: AccountId,
        buyer: AccountId,
        amount: Balance,
        token: String,
        status: EscrowStatus,
        release_time: Option<Timestamp>,
        dispute_reason: Option<String>,
        created_at: Timestamp,
    }

    #[ink(storage)]
    pub struct Escrow {
        escrows: HashMap<u32, EscrowInfo>,
        escrow_count: u32,
        user_escrows: HashMap<AccountId, Vec<u32>>,
    }

    #[ink(event)]
    pub struct EscrowCreated {
        #[ink(topic)]
        escrow_id: u32,
        #[ink(topic)]
        seller: AccountId,
        #[ink(topic)]
        buyer: AccountId,
        amount: Balance,
        token: String,
    }

    #[ink(event)]
    pub struct EscrowReleased {
        #[ink(topic)]
        escrow_id: u32,
        #[ink(topic)]
        released_by: AccountId,
    }

    #[ink(event)]
    pub struct EscrowRefunded {
        #[ink(topic)]
        escrow_id: u32,
        #[ink(topic)]
        refunded_by: AccountId,
    }

    #[ink(event)]
    pub struct EscrowDisputed {
        #[ink(topic)]
        escrow_id: u32,
        #[ink(topic)]
        disputed_by: AccountId,
        reason: String,
    }

    impl Escrow {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                escrows: HashMap::new(),
                escrow_count: 0,
                user_escrows: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn create_escrow(
            &mut self,
            seller: AccountId,
            buyer: AccountId,
            amount: Balance,
            token: String,
            release_time: Option<Timestamp>,
        ) -> u32 {
            let caller = self.env().caller();
            
            // Validate inputs
            assert!(amount > 0, "Amount must be greater than 0");
            assert!(caller == seller || caller == buyer, "Only seller or buyer can create escrow");
            
            let escrow_id = self.escrow_count;
            self.escrow_count += 1;
            
            // Create new escrow
            let escrow_info = EscrowInfo {
                seller,
                buyer,
                amount,
                token,
                status: EscrowStatus::Active,
                release_time,
                dispute_reason: None,
                created_at: self.env().block_timestamp(),
            };
            
            // Store escrow
            self.escrows.insert(escrow_id, escrow_info);
            
            // Update user mappings
            self.add_user_escrow(seller, escrow_id);
            self.add_user_escrow(buyer, escrow_id);
            
            // Emit event
            self.env().emit_event(EscrowCreated {
                escrow_id,
                seller,
                buyer,
                amount,
                token: self.escrows.get(&escrow_id).unwrap().token.clone(),
            });
            
            escrow_id
        }

        #[ink(message)]
        pub fn release(&mut self, escrow_id: u32) -> bool {
            let caller = self.env().caller();
            
            // Check escrow exists
            assert!(self.escrows.contains_key(&escrow_id), "Escrow does not exist");
            
            let escrow = self.escrows.get(&escrow_id).unwrap();
            
            // Check escrow is active
            assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
            
            // Check caller is buyer or time has passed
            let is_buyer = caller == escrow.buyer;
            let time_passed = if let Some(release_time) = escrow.release_time {
                self.env().block_timestamp() >= release_time
            } else {
                false
            };
            
            assert!(is_buyer || time_passed, "Not authorized to release funds");
            
            // Update escrow status
            let mut escrow = self.escrows.get_mut(&escrow_id).unwrap();
            escrow.status = EscrowStatus::Released;
            
            // Emit event
            self.env().emit_event(EscrowReleased {
                escrow_id,
                released_by: caller,
            });
            
            // In a real implementation, we would transfer tokens to the seller here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn refund(&mut self, escrow_id: u32) -> bool {
            let caller = self.env().caller();
            
            // Check escrow exists
            assert!(self.escrows.contains_key(&escrow_id), "Escrow does not exist");
            
            let escrow = self.escrows.get(&escrow_id).unwrap();
            
            // Check escrow is active
            assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
            
            // Check caller is seller
            assert!(caller == escrow.seller, "Only seller can refund");
            
            // Update escrow status
            let mut escrow = self.escrows.get_mut(&escrow_id).unwrap();
            escrow.status = EscrowStatus::Refunded;
            
            // Emit event
            self.env().emit_event(EscrowRefunded {
                escrow_id,
                refunded_by: caller,
            });
            
            // In a real implementation, we would transfer tokens back to the buyer here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn dispute(&mut self, escrow_id: u32, reason: String) -> bool {
            let caller = self.env().caller();
            
            // Check escrow exists
            assert!(self.escrows.contains_key(&escrow_id), "Escrow does not exist");
            
            let escrow = self.escrows.get(&escrow_id).unwrap();
            
            // Check escrow is active
            assert!(escrow.status == EscrowStatus::Active, "Escrow is not active");
            
            // Check caller is buyer or seller
            assert!(
                caller == escrow.buyer || caller == escrow.seller,
                "Only buyer or seller can dispute"
            );
            
            // Update escrow status
            let mut escrow = self.escrows.get_mut(&escrow_id).unwrap();
            escrow.status = EscrowStatus::Disputed;
            escrow.dispute_reason = Some(reason.clone());
            
            // Emit event
            self.env().emit_event(EscrowDisputed {
                escrow_id,
                disputed_by: caller,
                reason,
            });
            
            true
        }

        #[ink(message)]
        pub fn get_escrow(&self, escrow_id: u32) -> Option<(
            AccountId,
            AccountId,
            Balance,
            String,
            EscrowStatus,
            Option<Timestamp>,
            Option<String>,
            Timestamp
        )> {
            if let Some(escrow) = self.escrows.get(&escrow_id) {
                Some((
                    escrow.seller,
                    escrow.buyer,
                    escrow.amount,
                    escrow.token.clone(),
                    escrow.status.clone(),
                    escrow.release_time,
                    escrow.dispute_reason.clone(),
                    escrow.created_at,
                ))
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn get_user_escrows(&self, user: AccountId) -> Vec<u32> {
            self.user_escrows.get(&user).unwrap_or(&Vec::new()).clone()
        }

        // Helper function to add escrow to user's list
        fn add_user_escrow(&mut self, user: AccountId, escrow_id: u32) {
            let mut user_escrows = self.user_escrows.get(&user).unwrap_or(&Vec::new()).clone();
            user_escrows.push(escrow_id);
            self.user_escrows.insert(user, user_escrows);
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn create_escrow_works() {
            let mut escrow = Escrow::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to buyer
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            let escrow_id = escrow.create_escrow(
                accounts.alice,
                accounts.bob,
                100,
                "DOT".to_string(),
                None,
            );
            
            assert_eq!(escrow_id, 0);
            
            let escrow_info = escrow.get_escrow(escrow_id).unwrap();
            assert_eq!(escrow_info.0, accounts.alice); // seller
            assert_eq!(escrow_info.1, accounts.bob); // buyer
            assert_eq!(escrow_info.2, 100); // amount
            assert_eq!(escrow_info.3, "DOT"); // token
            assert_eq!(escrow_info.4, EscrowStatus::Active); // status
        }

        #[ink::test]
        fn release_works() {
            let mut escrow = Escrow::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to buyer
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            let escrow_id = escrow.create_escrow(
                accounts.alice,
                accounts.bob,
                100,
                "DOT".to_string(),
                None,
            );
            
            // Release the escrow
            let result = escrow.release(escrow_id);
            assert!(result);
            
            let escrow_info = escrow.get_escrow(escrow_id).unwrap();
            assert_eq!(escrow_info.4, EscrowStatus::Released); // status
        }

        #[ink::test]
        fn refund_works() {
            let mut escrow = Escrow::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to buyer
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            let escrow_id = escrow.create_escrow(
                accounts.alice,
                accounts.bob,
                100,
                "DOT".to_string(),
                None,
            );
            
            // Set caller to seller for refund
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let result = escrow.refund(escrow_id);
            assert!(result);
            
            let escrow_info = escrow.get_escrow(escrow_id).unwrap();
            assert_eq!(escrow_info.4, EscrowStatus::Refunded); // status
        }
    }
}
