#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod key_registry {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, PartialEq, Eq, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum KeyStatus {
        Active,
        Revoked,
        Expired,
    }

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct KeyInfo {
        owner: AccountId,
        public_key: Vec<u8>,
        metadata: HashMap<String, String>,
        created_at: Timestamp,
        expires_at: Option<Timestamp>,
        status: KeyStatus,
    }

    #[ink(storage)]
    pub struct KeyRegistry {
        keys: HashMap<Vec<u8>, KeyInfo>,
        user_keys: HashMap<AccountId, Vec<Vec<u8>>>,
    }

    #[ink(event)]
    pub struct KeyRegistered {
        #[ink(topic)]
        owner: AccountId,
        key_id: Vec<u8>,
    }

    #[ink(event)]
    pub struct KeyRevoked {
        #[ink(topic)]
        owner: AccountId,
        key_id: Vec<u8>,
    }

    #[ink(event)]
    pub struct KeyMetadataUpdated {
        #[ink(topic)]
        owner: AccountId,
        key_id: Vec<u8>,
    }

    impl KeyRegistry {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                keys: HashMap::new(),
                user_keys: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn register_key(
            &mut self,
            key_id: Vec<u8>,
            public_key: Vec<u8>,
            metadata: HashMap<String, String>,
            expires_at: Option<Timestamp>,
        ) -> bool {
            let caller = self.env().caller();
            
            // Validate inputs
            assert!(!key_id.is_empty(), "Key ID cannot be empty");
            assert!(!public_key.is_empty(), "Public key cannot be empty");
            assert!(!self.keys.contains_key(&key_id), "Key ID already exists");
            
            // Create new key info
            let key_info = KeyInfo {
                owner: caller,
                public_key,
                metadata,
                created_at: self.env().block_timestamp(),
                expires_at,
                status: KeyStatus::Active,
            };
            
            // Store key
            self.keys.insert(key_id.clone(), key_info);
            
            // Update user mapping
            let mut user_keys = self.user_keys.get(&caller).unwrap_or(&Vec::new()).clone();
            user_keys.push(key_id.clone());
            self.user_keys.insert(caller, user_keys);
            
            // Emit event
            self.env().emit_event(KeyRegistered {
                owner: caller,
                key_id: key_id.clone(),
            });
            
            true
        }

        #[ink(message)]
        pub fn revoke_key(&mut self, key_id: Vec<u8>) -> bool {
            let caller = self.env().caller();
            
            // Check key exists
            assert!(self.keys.contains_key(&key_id), "Key does not exist");
            
            let key = self.keys.get(&key_id).unwrap();
            
            // Check caller is owner
            assert!(caller == key.owner, "Only owner can revoke key");
            
            // Update key status
            let mut key = self.keys.get_mut(&key_id).unwrap();
            key.status = KeyStatus::Revoked;
            
            // Emit event
            self.env().emit_event(KeyRevoked {
                owner: caller,
                key_id: key_id.clone(),
            });
            
            true
        }

        #[ink(message)]
        pub fn update_metadata(
            &mut self,
            key_id: Vec<u8>,
            metadata: HashMap<String, String>,
        ) -> bool {
            let caller = self.env().caller();
            
            // Check key exists
            assert!(self.keys.contains_key(&key_id), "Key does not exist");
            
            let key = self.keys.get(&key_id).unwrap();
            
            // Check caller is owner
            assert!(caller == key.owner, "Only owner can update metadata");
            
            // Check key is active
            assert!(key.status == KeyStatus::Active, "Key is not active");
            
            // Update metadata
            let mut key = self.keys.get_mut(&key_id).unwrap();
            key.metadata = metadata;
            
            // Emit event
            self.env().emit_event(KeyMetadataUpdated {
                owner: caller,
                key_id: key_id.clone(),
            });
            
            true
        }

        #[ink(message)]
        pub fn get_key(&self, key_id: Vec<u8>) -> Option<(
            AccountId,
            Vec<u8>,
            HashMap<String, String>,
            Timestamp,
            Option<Timestamp>,
            KeyStatus
        )> {
            if let Some(key) = self.keys.get(&key_id) {
                // Check if key is expired
                if let Some(expires_at) = key.expires_at {
                    if self.env().block_timestamp() > expires_at && key.status == KeyStatus::Active {
                        // Key is expired but still marked as active
                        return Some((
                            key.owner,
                            key.public_key.clone(),
                            key.metadata.clone(),
                            key.created_at,
                            key.expires_at,
                            KeyStatus::Expired,
                        ));
                    }
                }
                
                Some((
                    key.owner,
                    key.public_key.clone(),
                    key.metadata.clone(),
                    key.created_at,
                    key.expires_at,
                    key.status.clone(),
                ))
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn get_user_keys(&self, user: AccountId) -> Vec<Vec<u8>> {
            self.user_keys.get(&user).unwrap_or(&Vec::new()).clone()
        }

        #[ink(message)]
        pub fn verify_key(&self, key_id: Vec<u8>, public_key: Vec<u8>) -> bool {
            if let Some(key) = self.keys.get(&key_id) {
                // Check if key is active
                if key.status != KeyStatus::Active {
                    return false;
                }
                
                // Check if key is expired
                if let Some(expires_at) = key.expires_at {
                    if self.env().block_timestamp() > expires_at {
                        return false;
                    }
                }
                
                // Verify public key
                key.public_key == public_key
            } else {
                false
            }
        }

        #[ink(message)]
        pub fn lookup_by_metadata(
            &self,
            key: String,
            value: String,
        ) -> Vec<Vec<u8>> {
            let mut matching_keys = Vec::new();
            
            for (key_id, key_info) in &self.keys {
                // Skip inactive keys
                if key_info.status != KeyStatus::Active {
                    continue;
                }
                
                // Skip expired keys
                if let Some(expires_at) = key_info.expires_at {
                    if self.env().block_timestamp() > expires_at {
                        continue;
                    }
                }
                
                // Check if metadata matches
                if let Some(meta_value) = key_info.metadata.get(&key) {
                    if meta_value == &value {
                        matching_keys.push(key_id.clone());
                    }
                }
            }
            
            matching_keys
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn register_key_works() {
            let mut registry = KeyRegistry::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let key_id = vec![1, 2, 3, 4];
            let public_key = vec![5, 6, 7, 8];
            
            let mut metadata = HashMap::new();
            metadata.insert("name".to_string(), "Alice's Key".to_string());
            metadata.insert("purpose".to_string(), "Authentication".to_string());
            
            let result = registry.register_key(
                key_id.clone(),
                public_key.clone(),
                metadata,
                None,
            );
            
            assert!(result);
            
            let key_info = registry.get_key(key_id).unwrap();
            assert_eq!(key_info.0, accounts.alice); // owner
            assert_eq!(key_info.1, public_key); // public_key
            assert_eq!(key_info.5, KeyStatus::Active); // status
        }

        #[ink::test]
        fn revoke_key_works() {
            let mut registry = KeyRegistry::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let key_id = vec![1, 2, 3, 4];
            let public_key = vec![5, 6, 7, 8];
            
            let mut metadata = HashMap::new();
            metadata.insert("name".to_string(), "Alice's Key".to_string());
            
            registry.register_key(
                key_id.clone(),
                public_key.clone(),
                metadata,
                None,
            );
            
            let result = registry.revoke_key(key_id.clone());
            assert!(result);
            
            let key_info = registry.get_key(key_id).unwrap();
            assert_eq!(key_info.5, KeyStatus::Revoked); // status
        }

        #[ink::test]
        fn lookup_by_metadata_works() {
            let mut registry = KeyRegistry::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let key_id1 = vec![1, 2, 3, 4];
            let public_key1 = vec![5, 6, 7, 8];
            
            let mut metadata1 = HashMap::new();
            metadata1.insert("name".to_string(), "Alice's Key".to_string());
            metadata1.insert("purpose".to_string(), "Authentication".to_string());
            
            registry.register_key(
                key_id1.clone(),
                public_key1.clone(),
                metadata1,
                None,
            );
            
            // Register another key with different metadata
            let key_id2 = vec![9, 10, 11, 12];
            let public_key2 = vec![13, 14, 15, 16];
            
            let mut metadata2 = HashMap::new();
            metadata2.insert("name".to_string(), "Bob's Key".to_string());
            metadata2.insert("purpose".to_string(), "Authentication".to_string());
            
            // Set caller to Bob
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            registry.register_key(
                key_id2.clone(),
                public_key2.clone(),
                metadata2,
                None,
            );
            
            // Look up keys by purpose
            let keys = registry.lookup_by_metadata(
                "purpose".to_string(),
                "Authentication".to_string(),
            );
            
            assert_eq!(keys.len(), 2);
            assert!(keys.contains(&key_id1));
            assert!(keys.contains(&key_id2));
            
            // Look up keys by name
            let keys = registry.lookup_by_metadata(
                "name".to_string(),
                "Alice's Key".to_string(),
            );
            
            assert_eq!(keys.len(), 1);
            assert_eq!(keys[0], key_id1);
        }
    }
}
