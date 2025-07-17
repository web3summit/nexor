#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod streaming_payments {
    use ink_storage::{
        collections::HashMap,
        traits::{PackedLayout, SpreadLayout},
    };
    use scale::{Decode, Encode};

    #[derive(Debug, PartialEq, Eq, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum StreamStatus {
        Active,
        Completed,
        Canceled,
    }

    #[derive(Debug, Encode, Decode, SpreadLayout, PackedLayout)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct StreamInfo {
        sender: AccountId,
        recipient: AccountId,
        total_amount: Balance,
        token: String,
        start_time: Timestamp,
        end_time: Timestamp,
        last_withdrawal_time: Timestamp,
        withdrawn_amount: Balance,
        status: StreamStatus,
    }

    #[ink(storage)]
    pub struct StreamingPayments {
        streams: HashMap<u32, StreamInfo>,
        stream_count: u32,
        user_streams_as_sender: HashMap<AccountId, Vec<u32>>,
        user_streams_as_recipient: HashMap<AccountId, Vec<u32>>,
    }

    #[ink(event)]
    pub struct StreamCreated {
        #[ink(topic)]
        stream_id: u32,
        #[ink(topic)]
        sender: AccountId,
        #[ink(topic)]
        recipient: AccountId,
        amount: Balance,
        token: String,
        duration: u64,
    }

    #[ink(event)]
    pub struct StreamWithdrawal {
        #[ink(topic)]
        stream_id: u32,
        #[ink(topic)]
        recipient: AccountId,
        amount: Balance,
    }

    #[ink(event)]
    pub struct StreamCanceled {
        #[ink(topic)]
        stream_id: u32,
        #[ink(topic)]
        canceled_by: AccountId,
        refunded_amount: Balance,
    }

    #[ink(event)]
    pub struct StreamCompleted {
        #[ink(topic)]
        stream_id: u32,
        #[ink(topic)]
        recipient: AccountId,
    }

    impl StreamingPayments {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                streams: HashMap::new(),
                stream_count: 0,
                user_streams_as_sender: HashMap::new(),
                user_streams_as_recipient: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn create_stream(
            &mut self,
            recipient: AccountId,
            amount: Balance,
            token: String,
            duration: u64,
        ) -> u32 {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Validate inputs
            assert!(amount > 0, "Amount must be greater than 0");
            assert!(duration > 0, "Duration must be greater than 0");
            assert!(caller != recipient, "Cannot stream to yourself");
            
            let stream_id = self.stream_count;
            self.stream_count += 1;
            
            // Create new stream
            let stream_info = StreamInfo {
                sender: caller,
                recipient,
                total_amount: amount,
                token,
                start_time: current_time,
                end_time: current_time + duration,
                last_withdrawal_time: current_time,
                withdrawn_amount: 0,
                status: StreamStatus::Active,
            };
            
            // Store stream
            self.streams.insert(stream_id, stream_info);
            
            // Update user mappings
            self.add_user_stream_as_sender(caller, stream_id);
            self.add_user_stream_as_recipient(recipient, stream_id);
            
            // Emit event
            self.env().emit_event(StreamCreated {
                stream_id,
                sender: caller,
                recipient,
                amount,
                token: self.streams.get(&stream_id).unwrap().token.clone(),
                duration,
            });
            
            stream_id
        }

        #[ink(message)]
        pub fn withdraw(&mut self, stream_id: u32) -> Balance {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Check stream exists
            assert!(self.streams.contains_key(&stream_id), "Stream does not exist");
            
            let stream = self.streams.get(&stream_id).unwrap();
            
            // Check stream is active
            assert!(stream.status == StreamStatus::Active, "Stream is not active");
            
            // Check caller is recipient
            assert!(caller == stream.recipient, "Only recipient can withdraw");
            
            // Calculate available amount
            let available_amount = self.calculate_available_amount(stream_id);
            assert!(available_amount > 0, "No funds available to withdraw");
            
            // Update stream
            let mut stream = self.streams.get_mut(&stream_id).unwrap();
            stream.withdrawn_amount += available_amount;
            stream.last_withdrawal_time = current_time;
            
            // Check if stream is completed
            if stream.withdrawn_amount >= stream.total_amount || current_time >= stream.end_time {
                stream.status = StreamStatus::Completed;
                stream.withdrawn_amount = stream.total_amount;
                
                // Emit completion event
                self.env().emit_event(StreamCompleted {
                    stream_id,
                    recipient: caller,
                });
            }
            
            // Emit withdrawal event
            self.env().emit_event(StreamWithdrawal {
                stream_id,
                recipient: caller,
                amount: available_amount,
            });
            
            // In a real implementation, we would transfer tokens to the recipient here
            // For now, we just return the amount
            available_amount
        }

        #[ink(message)]
        pub fn cancel_stream(&mut self, stream_id: u32) -> (Balance, Balance) {
            let caller = self.env().caller();
            let current_time = self.env().block_timestamp();
            
            // Check stream exists
            assert!(self.streams.contains_key(&stream_id), "Stream does not exist");
            
            let stream = self.streams.get(&stream_id).unwrap();
            
            // Check stream is active
            assert!(stream.status == StreamStatus::Active, "Stream is not active");
            
            // Check caller is sender or recipient
            assert!(
                caller == stream.sender || caller == stream.recipient,
                "Only sender or recipient can cancel"
            );
            
            // Calculate amounts
            let available_amount = self.calculate_available_amount(stream_id);
            let refund_amount = stream.total_amount - stream.withdrawn_amount - available_amount;
            
            // Update stream
            let mut stream = self.streams.get_mut(&stream_id).unwrap();
            stream.status = StreamStatus::Canceled;
            stream.withdrawn_amount += available_amount;
            
            // Emit event
            self.env().emit_event(StreamCanceled {
                stream_id,
                canceled_by: caller,
                refunded_amount: refund_amount,
            });
            
            // In a real implementation, we would transfer tokens here
            // For now, we just return the amounts
            (available_amount, refund_amount)
        }

        #[ink(message)]
        pub fn get_stream(&self, stream_id: u32) -> Option<(
            AccountId,
            AccountId,
            Balance,
            String,
            Timestamp,
            Timestamp,
            Timestamp,
            Balance,
            StreamStatus
        )> {
            if let Some(stream) = self.streams.get(&stream_id) {
                Some((
                    stream.sender,
                    stream.recipient,
                    stream.total_amount,
                    stream.token.clone(),
                    stream.start_time,
                    stream.end_time,
                    stream.last_withdrawal_time,
                    stream.withdrawn_amount,
                    stream.status.clone(),
                ))
            } else {
                None
            }
        }

        #[ink(message)]
        pub fn get_available_amount(&self, stream_id: u32) -> Balance {
            self.calculate_available_amount(stream_id)
        }

        #[ink(message)]
        pub fn get_user_streams_as_sender(&self, user: AccountId) -> Vec<u32> {
            self.user_streams_as_sender.get(&user).unwrap_or(&Vec::new()).clone()
        }

        #[ink(message)]
        pub fn get_user_streams_as_recipient(&self, user: AccountId) -> Vec<u32> {
            self.user_streams_as_recipient.get(&user).unwrap_or(&Vec::new()).clone()
        }

        // Helper function to calculate available amount
        fn calculate_available_amount(&self, stream_id: u32) -> Balance {
            let stream = self.streams.get(&stream_id).unwrap();
            let current_time = self.env().block_timestamp();
            
            if stream.status != StreamStatus::Active {
                return 0;
            }
            
            if current_time <= stream.last_withdrawal_time {
                return 0;
            }
            
            let end_time = if current_time > stream.end_time {
                stream.end_time
            } else {
                current_time
            };
            
            let time_passed = end_time - stream.last_withdrawal_time;
            let total_duration = stream.end_time - stream.start_time;
            
            if total_duration == 0 {
                return 0;
            }
            
            let available = stream.total_amount * time_passed / total_duration;
            
            if available + stream.withdrawn_amount > stream.total_amount {
                return stream.total_amount - stream.withdrawn_amount;
            }
            
            available
        }

        // Helper function to add stream to sender's list
        fn add_user_stream_as_sender(&mut self, user: AccountId, stream_id: u32) {
            let mut user_streams = self.user_streams_as_sender.get(&user).unwrap_or(&Vec::new()).clone();
            user_streams.push(stream_id);
            self.user_streams_as_sender.insert(user, user_streams);
        }

        // Helper function to add stream to recipient's list
        fn add_user_stream_as_recipient(&mut self, user: AccountId, stream_id: u32) {
            let mut user_streams = self.user_streams_as_recipient.get(&user).unwrap_or(&Vec::new()).clone();
            user_streams.push(stream_id);
            self.user_streams_as_recipient.insert(user, user_streams);
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn create_stream_works() {
            let mut streaming = StreamingPayments::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let stream_id = streaming.create_stream(
                accounts.bob,
                1000,
                "DOT".to_string(),
                3600000, // 1 hour in milliseconds
            );
            
            assert_eq!(stream_id, 0);
            
            let stream_info = streaming.get_stream(stream_id).unwrap();
            assert_eq!(stream_info.0, accounts.alice); // sender
            assert_eq!(stream_info.1, accounts.bob); // recipient
            assert_eq!(stream_info.2, 1000); // total_amount
            assert_eq!(stream_info.3, "DOT"); // token
            assert_eq!(stream_info.8, StreamStatus::Active); // status
        }

        #[ink::test]
        fn withdraw_works() {
            let mut streaming = StreamingPayments::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice (sender)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let stream_id = streaming.create_stream(
                accounts.bob,
                1000,
                "DOT".to_string(),
                3600000, // 1 hour in milliseconds
            );
            
            // Advance time by 30 minutes (half the duration)
            ink_env::test::advance_block::<ink_env::DefaultEnvironment>();
            let current_time = ink_env::test::block_timestamp::<ink_env::DefaultEnvironment>();
            ink_env::test::set_block_timestamp::<ink_env::DefaultEnvironment>(current_time + 1800000);
            
            // Set caller to Bob (recipient)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.bob);
            
            let withdrawn = streaming.withdraw(stream_id);
            assert_eq!(withdrawn, 500); // Half the amount should be available
            
            let stream_info = streaming.get_stream(stream_id).unwrap();
            assert_eq!(stream_info.7, 500); // withdrawn_amount
            assert_eq!(stream_info.8, StreamStatus::Active); // status
        }

        #[ink::test]
        fn cancel_stream_works() {
            let mut streaming = StreamingPayments::new();
            let accounts = ink_env::test::default_accounts::<ink_env::DefaultEnvironment>();
            
            // Set caller to Alice (sender)
            ink_env::test::set_caller::<ink_env::DefaultEnvironment>(accounts.alice);
            
            let stream_id = streaming.create_stream(
                accounts.bob,
                1000,
                "DOT".to_string(),
                3600000, // 1 hour in milliseconds
            );
            
            // Advance time by 30 minutes (half the duration)
            ink_env::test::advance_block::<ink_env::DefaultEnvironment>();
            let current_time = ink_env::test::block_timestamp::<ink_env::DefaultEnvironment>();
            ink_env::test::set_block_timestamp::<ink_env::DefaultEnvironment>(current_time + 1800000);
            
            // Cancel the stream
            let (available, refunded) = streaming.cancel_stream(stream_id);
            assert_eq!(available, 500); // Half the amount should be available
            assert_eq!(refunded, 500); // Half the amount should be refunded
            
            let stream_info = streaming.get_stream(stream_id).unwrap();
            assert_eq!(stream_info.8, StreamStatus::Canceled); // status
        }
    }
}
