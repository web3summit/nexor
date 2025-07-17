#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod vault {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct VaultInfo {
        name: String,
        beneficiaries: Vec<AccountId>,
        threshold: u32,
        tokens: HashMap<String, Balance>,
        creator: AccountId,
    }

    #[ink(storage)]
    pub struct Vault {
        vaults: HashMap<u32, VaultInfo>,
        vault_count: u32,
        owner_vaults: HashMap<AccountId, Vec<u32>>,
    }

    #[ink(event)]
    pub struct VaultCreated {
        #[ink(topic)]
        vault_id: u32,
        #[ink(topic)]
        creator: AccountId,
        name: String,
    }

    #[ink(event)]
    pub struct Deposit {
        #[ink(topic)]
        vault_id: u32,
        #[ink(topic)]
        from: AccountId,
        token: String,
        amount: Balance,
    }

    #[ink(event)]
    pub struct Withdrawal {
        #[ink(topic)]
        vault_id: u32,
        #[ink(topic)]
        to: AccountId,
        token: String,
        amount: Balance,
    }

    impl Vault {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                vaults: HashMap::new(),
                vault_count: 0,
                owner_vaults: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn create_vault(&mut self, name: String, beneficiaries: Vec<AccountId>, threshold: u32) -> u32 {
            let caller = self.env().caller();
            
            // Validate inputs
            assert!(!beneficiaries.is_empty(), "Beneficiaries cannot be empty");
            assert!(threshold > 0 && threshold <= beneficiaries.len() as u32, "Invalid threshold");
            
            let vault_id = self.vault_count;
            self.vault_count += 1;
            
            // Create new vault
            let vault_info = VaultInfo {
                name,
                beneficiaries,
                threshold,
                tokens: HashMap::new(),
                creator: caller,
            };
            
            // Store vault
            self.vaults.insert(vault_id, vault_info);
            
            // Update owner mapping
            let mut owner_vaults = self.owner_vaults.get(&caller).unwrap_or(&Vec::new()).clone();
            owner_vaults.push(vault_id);
            self.owner_vaults.insert(caller, owner_vaults);
            
            // Emit event
            self.env().emit_event(VaultCreated {
                vault_id,
                creator: caller,
                name: self.vaults.get(&vault_id).unwrap().name.clone(),
            });
            
            vault_id
        }

        #[ink(message)]
        pub fn deposit(&mut self, vault_id: u32, token: String, amount: Balance) {
            let caller = self.env().caller();
            
            // Check vault exists
            assert!(self.vaults.contains_key(&vault_id), "Vault does not exist");
            
            // Update vault balance
            let mut vault = self.vaults.get_mut(&vault_id).unwrap();
            let current_balance = vault.tokens.get(&token).unwrap_or(&0).clone();
            vault.tokens.insert(token.clone(), current_balance + amount);
            
            // Emit event
            self.env().emit_event(Deposit {
                vault_id,
                from: caller,
                token: token.clone(),
                amount,
            });
        }

        #[ink(message)]
        pub fn withdraw(&mut self, vault_id: u32, token: String, amount: Balance, destination: AccountId) -> bool {
            let caller = self.env().caller();
            
            // Check vault exists
            assert!(self.vaults.contains_key(&vault_id), "Vault does not exist");
            
            let vault = self.vaults.get(&vault_id).unwrap();
            
            // Check caller is beneficiary
            assert!(vault.beneficiaries.contains(&caller), "Not authorized");
            
            // Check sufficient balance
            let current_balance = vault.tokens.get(&token).unwrap_or(&0).clone();
            assert!(current_balance >= amount, "Insufficient balance");
            
            // Update vault balance
            let mut vault = self.vaults.get_mut(&vault_id).unwrap();
            vault.tokens.insert(token.clone(), current_balance - amount);
            
            // Emit event
            self.env().emit_event(Withdrawal {
                vault_id,
                to: destination,
                token: token.clone(),
                amount,
            });
            
            // In a real implementation, we would transfer tokens here
            // For now, we just return success
            true
        }

        #[ink(message)]
        pub fn get_vault(&self, vault_id: u32) -> Option<(String, Vec<AccountId>, u32, AccountId)> {
            if let Some(vault) = self.vaults.get(&vault_id) {
                Some((
                    vault.name.clone(),
                    vault.beneficiaries.clone(),
                    vault.threshold,
                    vault.creator,
                ))
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn get_vault_balance(&self, vault_id: u32, token: String) -> Balance {
            if let Some(vault) = self.vaults.get(&vault_id) {
                *vault.tokens.get(&token).unwrap_or(&0)
            } else {
                0
            }
        }

        #[ink(message)]
        pub fn get_user_vaults(&self, user: AccountId) -> Vec<u32> {
            self.owner_vaults.get(&user).unwrap_or(&Vec::new()).clone()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn create_vault_works() {
            let mut vault = Vault::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            let vault_id = vault.create_vault(
                "Test Vault".to_string(),
                vec![accounts.alice, accounts.bob],
                1,
            );
            
            assert_eq!(vault_id, 0);
            
            let vault_info = vault.get_vault(vault_id).unwrap();
            assert_eq!(vault_info.0, "Test Vault");
            assert_eq!(vault_info.1, vec![accounts.alice, accounts.bob]);
            assert_eq!(vault_info.2, 1);
        }

        #[ink::test]
        fn deposit_and_withdraw_works() {
            let mut vault = Vault::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            let vault_id = vault.create_vault(
                "Test Vault".to_string(),
                vec![accounts.alice],
                1,
            );
            
            vault.deposit(vault_id, "DOT".to_string(), 100);
            assert_eq!(vault.get_vault_balance(vault_id, "DOT".to_string()), 100);
            
            // Set caller to Alice for withdrawal
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let result = vault.withdraw(vault_id, "DOT".to_string(), 50, accounts.bob);
            assert!(result);
            assert_eq!(vault.get_vault_balance(vault_id, "DOT".to_string()), 50);
        }
    }
}
