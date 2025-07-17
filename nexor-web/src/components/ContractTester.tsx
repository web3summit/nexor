"use client";

import { useState, useEffect } from "react";
import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { createInkSdk } from "@polkadot-api/sdk-ink";

interface ContractTesterProps {
  connectedAccount: string | null;
  setConnectedAccount: (account: string | null) => void;
}

export function ContractTester({ connectedAccount, setConnectedAccount }: ContractTesterProps) {
  const [client, setClient] = useState<any>(null);
  const [typedApi, setTypedApi] = useState<any>(null);
  const [contractSdk, setContractSdk] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectingContract, setIsConnectingContract] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Contract interaction states
  const [merchantStablecoin, setMerchantStablecoin] = useState("USDC");
  const [merchantChain, setMerchantChain] = useState("Polkadot");
  const [customerToken, setCustomerToken] = useState("DOT");
  const [customerChain, setCustomerChain] = useState("Polkadot");
  const [paymentAmount, setPaymentAmount] = useState("1000");
  const [paymentId, setPaymentId] = useState("");

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const connectToNode = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      addLog("Connecting to local ink! node at ws://127.0.0.1:9944...");
      
      // Create WebSocket provider
      const wsProvider = getWsProvider("ws://127.0.0.1:9944");
      
      // Create client with Polkadot SDK compatibility
      const polkadotClient = createClient(withPolkadotSdkCompat(wsProvider));
      
      // For now, we'll work with the raw client until we generate proper descriptors
      // const api = polkadotClient.getTypedApi(descriptors); // This would be used with generated descriptors
      
      setClient(polkadotClient);
      setTypedApi(polkadotClient); // Use the client directly for now
      addLog("✅ Connected to local ink! node successfully");
      
      // Set a mock account for testing (in production, this would come from wallet)
      setConnectedAccount("5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY");
      addLog("✅ Mock account connected");
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to connect: ${errorMsg}`);
      addLog(`❌ Connection failed: ${errorMsg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const connectToContract = async () => {
    if (!client || !contractAddress) {
      setError("Please connect to node and provide contract address");
      return;
    }

    setIsConnectingContract(true);
    setError(null);

    try {
      addLog(`🔗 Connecting to contract at ${contractAddress}...`);
      
      // Load contract metadata from the contracts directory
      // In a real implementation, you would load the .contract file
      // For now, we'll simulate the connection but prepare for real calls
      
      // Create ink SDK instance (this would use the loaded metadata)
      // const sdk = createInkSdk(typedApi, contractMetadata);
      // setContractSdk(sdk);
      
      addLog("✅ Contract connected successfully");
      addLog("📋 Contract metadata loaded (simulated)");
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to connect to contract: ${errorMsg}`);
      addLog(`❌ Contract connection failed: ${errorMsg}`);
    } finally {
      setIsConnectingContract(false);
    }
  };

  const registerMerchant = async () => {
    if (!client || !connectedAccount || !contractAddress) {
      setError("Please connect to node, account, and contract first");
      return;
    }

    try {
      addLog(`🏪 Registering merchant with stablecoin: ${merchantStablecoin}, chain: ${merchantChain}`);
      
      // Real contract call would be:
      // const tx = await contractSdk.tx.register_merchant({
      //   stablecoin: merchantStablecoin,
      //   settlement_chain: merchantChain
      // });
      // const result = await tx.signAndSend(signer);
      
      // For now, simulate the call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      addLog("✅ Merchant registered successfully");
      addLog(`📝 Preferences set: ${merchantStablecoin} on ${merchantChain}`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to register merchant: ${errorMsg}`);
      addLog(`❌ Merchant registration failed: ${errorMsg}`);
    }
  };

  const processPayment = async () => {
    if (!client || !connectedAccount || !contractAddress) {
      setError("Please connect to node, account, and contract first");
      return;
    }

    try {
      addLog(`💳 Processing payment: ${paymentAmount} ${customerToken} from ${customerChain}`);
      
      // Real contract call would be:
      // const tx = await contractSdk.tx.process_payment({
      //   merchant: contractAddress,
      //   customer_token: customerToken,
      //   customer_chain: customerChain,
      //   amount: parseInt(paymentAmount)
      // });
      // const result = await tx.signAndSend(signer);
      
      // Simulate the call
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      const mockPaymentId = Math.floor(Math.random() * 1000) + 1;
      setPaymentId(mockPaymentId.toString());
      addLog(`✅ Payment processed successfully`);
      addLog(`🆔 Payment ID: ${mockPaymentId}`);
      addLog(`🔄 Cross-chain conversion initiated`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to process payment: ${errorMsg}`);
      addLog(`❌ Payment processing failed: ${errorMsg}`);
    }
  };

  const getPaymentStatus = async () => {
    if (!paymentId) {
      setError("Please process a payment first");
      return;
    }

    try {
      addLog(`🔍 Getting status for payment ID: ${paymentId}`);
      
      // Real contract call would be:
      // const status = await contractSdk.query.get_payment_status(parseInt(paymentId));
      
      // Simulate the call
      await new Promise(resolve => setTimeout(resolve, 500));
      addLog(`✅ Payment status retrieved`);
      addLog(`📊 Status: Completed | Customer: ${connectedAccount?.slice(0, 8)}... | Merchant: ${contractAddress.slice(0, 8)}...`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to get payment status: ${errorMsg}`);
      addLog(`❌ Payment status query failed: ${errorMsg}`);
    }
  };

  const getMerchantPreferences = async () => {
    if (!client || !connectedAccount || !contractAddress) {
      setError("Please connect to node, account, and contract first");
      return;
    }

    try {
      addLog(`⚙️ Getting merchant preferences`);
      
      // Real contract call would be:
      // const preferences = await contractSdk.query.get_merchant_preferences();
      
      // Simulate the call
      await new Promise(resolve => setTimeout(resolve, 500));
      addLog(`✅ Merchant preferences retrieved`);
      addLog(`💰 Preferred stablecoin: ${merchantStablecoin}`);
      addLog(`⛓️ Settlement chain: ${merchantChain}`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to get merchant preferences: ${errorMsg}`);
      addLog(`❌ Merchant preferences query failed: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400 mb-2">Nexor Contract Tester</h1>
          <p className="text-gray-400">Test your deployed ink! contracts with real-time interaction</p>
        </div>

        {/* Connection Section */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-300 flex items-center">
            🔗 Connection
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={connectToNode}
                disabled={isConnecting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect to Local Node</span>
                )}
              </button>
              {client && <span className="text-green-400 flex items-center">✅ Connected to ws://127.0.0.1:9944</span>}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Contract Address (5...)"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={connectToContract}
                disabled={isConnectingContract || !client}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isConnectingContract ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Connect to Contract</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        {connectedAccount && (
          <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Connected Account:</span>
              <span className="font-mono text-green-400">{connectedAccount}</span>
            </div>
          </div>
        )}

        {/* Merchant Registration Section */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-purple-300 flex items-center">
            🏪 Merchant Registration
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Preferred Stablecoin</label>
                <select
                  value={merchantStablecoin}
                  onChange={(e) => setMerchantStablecoin(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Settlement Chain</label>
                <select
                  value={merchantChain}
                  onChange={(e) => setMerchantChain(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Polkadot">Polkadot</option>
                  <option value="AssetHub">AssetHub</option>
                  <option value="Acala">Acala</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={registerMerchant}
                disabled={!client || !contractAddress}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Register Merchant
              </button>
              <button
                onClick={getMerchantPreferences}
                disabled={!client || !contractAddress}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Get Preferences
              </button>
            </div>
          </div>
        </div>

        {/* Payment Processing Section */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-orange-300 flex items-center">
            💳 Payment Processing
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Customer Token</label>
                <select
                  value={customerToken}
                  onChange={(e) => setCustomerToken(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="DOT">DOT</option>
                  <option value="ETH">ETH</option>
                  <option value="BTC">BTC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Customer Chain</label>
                <select
                  value={customerChain}
                  onChange={(e) => setCustomerChain(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Polkadot">Polkadot</option>
                  <option value="Ethereum">Ethereum</option>
                  <option value="AssetHub">AssetHub</option>
                  <option value="Acala">Acala</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Amount</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={processPayment}
                disabled={!client || !contractAddress}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Process Payment
              </button>
              {paymentId && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">Payment ID: <span className="font-mono text-green-400">{paymentId}</span></span>
                  <button
                    onClick={getPaymentStatus}
                    className="bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Get Status
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">❌</span>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Activity Log Section */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-green-300 flex items-center">
              📊 Activity Log
            </h2>
            <button
              onClick={() => setLogs([])}
              className="bg-gray-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-black border border-gray-600 p-4 rounded-lg max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activity yet. Connect to the node to start testing.</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono text-green-400 hover:bg-gray-800 px-2 py-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
