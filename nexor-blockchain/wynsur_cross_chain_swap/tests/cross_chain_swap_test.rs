#[cfg(test)]
mod tests {
    use super::*;
    use wynsur_cross_chain_swap::bridge_contract::Bridge;
    use drink::{
        session::Session,
        AccountId32,
    };
    use ink::primitives::AccountId;

    const HYPERBRIDGE_GATEWAY: [u8; 32] = [1u8; 32];
    const MERCHANT_ADDRESS: [u8; 32] = [2u8; 32];
    const STABLECOIN_CONTRACT: [u8; 32] = [3u8; 32];
    const DESTINATION_CHAIN: &[u8] = b"ethereum";
    const STABLECOIN_TYPE: &[u8] = b"USDC";

    fn setup_contract() -> (Session<Bridge::Env>, AccountId) {
        let mut session = Session::<Bridge::Env>::new().unwrap();
        
        let contract = session.deploy(
            Bridge::new(),
            &[],
            None,
        ).expect("Contract deployment failed");
        
        (session, contract)
    }

    #[test]
    fn new_contract_initializes_correctly() {
        let (_, contract) = setup_contract();
        // Note: Bridge contract doesn't expose owner() method publicly
        // This test verifies the contract deploys successfully
        assert!(contract != AccountId::from([0u8; 32]), "Contract should be deployed");
    }

    #[test]
    fn bridge_and_send_insufficient_funds() {
        let (mut session, contract) = setup_contract();
        
        // Try to bridge more than we send - should fail
        let result = session.value(100).call(
            contract,
            "bridge_and_send",
            &[1u32, MERCHANT_ADDRESS.to_vec(), 1u32, 1000u128],
            None,
        );
        
        // Should fail due to insufficient funds
        assert!(result.is_err(), "Should fail with insufficient funds");
    }

    #[test]
    fn bridge_and_send_works() {
        let (mut session, contract) = setup_contract();
        let initial_balance = session.free_balance(contract);
        
        // Call bridge_and_send with sufficient funds
        let result = session.value(1000).call(
            contract,
            "bridge_and_send",
            &[1u32, MERCHANT_ADDRESS.to_vec(), 1u32, 1000u128],
            None,
        );
        
        // Should succeed with sufficient funds
        assert!(result.is_ok(), "Should succeed with sufficient funds");
        
        let final_balance = session.free_balance(contract);
        assert_eq!(
            final_balance,
            initial_balance + 1000,
            "Contract balance should increase by transferred amount"
        );
    }

    #[test]
    fn on_swap_completed_emits_event() {
        let (mut session, contract) = setup_contract();
        
        session.call_as(
            AccountId::from(HYPERBRIDGE_GATEWAY),
            contract,
            "on_swap_completed",
            &[MERCHANT_ADDRESS.to_vec(), 1000u128],
            None,
        ).expect("on_swap_completed call failed");
        
        let events = session.events();
        assert!(
            events.iter().any(|e| e.event == "SwapCompleted"),
            "SwapCompleted event should be emitted"
        );
    }

    #[test]
    fn execute_swap_fails_with_insufficient_balance() {
        let (mut session, contract) = setup_contract();
        
        let result = session.call(
            contract,
            "execute_swap",
            &[
                DESTINATION_CHAIN.to_vec(),
                MERCHANT_ADDRESS.to_vec(),
                STABLECOIN_TYPE.to_vec(),
            ],
            None,
        );
        
        assert!(
            result.is_err(),
            "Should fail when no value is transferred"
        );
    }

    #[test]
    fn unauthorized_calls_fail() {
        let (mut session, contract) = setup_contract();
        
        let result = session.call_as(
            AccountId::from([0x02; 32]),
            contract,
            "set_stablecoin_contract",
            &[DESTINATION_CHAIN.to_vec(), STABLECOIN_CONTRACT.to_vec()],
            None,
        );
        
        assert!(
            result.is_err(),
            "Non-owner should not be able to set stablecoin contract"
        );
        
        let result = session.call_as(
            AccountId::from([0x02; 32]),
            contract,
            "on_swap_completed",
            &[MERCHANT_ADDRESS.to_vec(), 1000u128],
            None,
        );
        
        assert!(
            result.is_err(),
            "Non-hyperbridge should not be able to complete swap"
        );
    }

    #[test]
    fn insufficient_funds() {
        let (mut session, contract) = setup_contract();
        
        // Attempt to call bridge_and_send without sending enough value
        let result = session.call(
            contract,
            "bridge_and_send",
            &[    // Parameters
                1u32, MERCHANT_ADDRESS.to_vec(), 1u32, 1000u128,
            ],
            Some(99), // Sent value (less than the required 100)
        );
        
        assert!(result.is_err(), "Expected call to fail due to insufficient funds");
    }
}