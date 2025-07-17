#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod key_registry {
    use ink::prelude::string::String;
    use ink::storage::Mapping;
    use ink::H160;

    /// Defines the storage of your contract.
    /// Maps userTag to H160 address for easy address lookup
    #[ink(storage)]
    pub struct KeyRegistry {
        /// Maps userTag to H160 address
        tag_to_address: Mapping<String, H160>,
    }

    impl KeyRegistry {
        /// Constructor that initializes an empty registry
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                tag_to_address: Mapping::default(),
            }
        }

        /// Default constructor
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }

        /// Register a userTag for the caller's address
        #[ink(message)]
        pub fn register_tag(&mut self, user_tag: String) -> bool {
            let caller = self.env().caller();
            
            // Check if tag is already taken
            if self.tag_to_address.get(&user_tag).is_some() {
                return false; // Tag already exists
            }
            
            // Register the tag
            self.tag_to_address.insert(&user_tag, &caller);
            true
        }

        /// Lookup H160 address by userTag
        #[ink(message)]
        pub fn lookup_address(&self, user_tag: String) -> Option<H160> {
            self.tag_to_address.get(&user_tag)
        }
    }
}
