#[ink::chain_extension]
pub enum MinimalExtension {
    #[ink(extension = 1)]
    AddOne(u32) -> u32,
}

#[ink::contract]
mod minimal {
    use super::MinimalExtension;
    
    #[ink(storage)]
    pub struct Adder {}
    
    impl Adder {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {}
        }
        
        #[ink(message)]
        pub fn add(&self, value: u32) -> u32 {
            self.env().extension().add_one(value).unwrap()
        }
    }
}
