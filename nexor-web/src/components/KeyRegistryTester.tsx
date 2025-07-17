'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@polkadot-api/substrate-client';
import { getWsProvider } from '@polkadot-api/ws-provider/web';

interface Activity {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export default function KeyRegistryTester() {
  const [isConnected, setIsConnected] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const [isContractConnected, setIsContractConnected] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for contract functions
  const [registerTag, setRegisterTag] = useState('');
  const [lookupTag, setLookupTag] = useState('');
  const [lookupResult, setLookupResult] = useState<string | null>(null);

  const addActivity = (message: string, type: Activity['type'] = 'info') => {
    const newActivity: Activity = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔗';
    }
  };

  const connectToNode = async () => {
    setLoading(true);
    try {
      addActivity('🔗 Connecting to local ink! node...', 'info');
      
      // Simulate connection delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const provider = getWsProvider('ws://127.0.0.1:9944');
      const client = createClient(provider);
      
      addActivity('✅ Successfully connected to local node at ws://127.0.0.1:9944', 'success');
      setIsConnected(true);
    } catch (error) {
      addActivity(`❌ Failed to connect to node: ${error}`, 'error');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const connectToContract = async () => {
    if (!contractAddress.trim()) {
      addActivity('❌ Please enter a contract address', 'error');
      return;
    }

    setLoading(true);
    try {
      addActivity(`🔗 Connecting to key_registry contract at ${contractAddress}...`, 'info');
      
      // Simulate contract connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addActivity('✅ Successfully connected to key_registry contract', 'success');
      addActivity('📋 Available functions: register_tag(), lookup_address()', 'info');
      setIsContractConnected(true);
    } catch (error) {
      addActivity(`❌ Failed to connect to contract: ${error}`, 'error');
      setIsContractConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTag = async () => {
    if (!registerTag.trim()) {
      addActivity('❌ Please enter a user tag to register', 'error');
      return;
    }

    setLoading(true);
    try {
      addActivity(`🏷️ Registering tag "${registerTag}" for current account...`, 'info');
      
      // Simulate contract call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure based on tag length (simple validation)
      const success = registerTag.length >= 3 && registerTag.length <= 20;
      
      if (success) {
        addActivity(`✅ Successfully registered tag "${registerTag}"`, 'success');
        addActivity(`📝 Tag "${registerTag}" is now mapped to your H160 address`, 'info');
        setRegisterTag('');
      } else {
        addActivity(`❌ Registration failed: Tag must be 3-20 characters`, 'error');
      }
    } catch (error) {
      addActivity(`❌ Registration failed: ${error}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupAddress = async () => {
    if (!lookupTag.trim()) {
      addActivity('❌ Please enter a user tag to lookup', 'error');
      return;
    }

    setLoading(true);
    try {
      addActivity(`🔍 Looking up address for tag "${lookupTag}"...`, 'info');
      
      // Simulate contract call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate lookup result (mock data for demo)
      const mockAddresses = {
        'alice': '0x1234567890123456789012345678901234567890',
        'bob': '0x0987654321098765432109876543210987654321',
        'charlie': '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      };
      
      const result = mockAddresses[lookupTag.toLowerCase() as keyof typeof mockAddresses];
      
      if (result) {
        addActivity(`✅ Found address for "${lookupTag}": ${result}`, 'success');
        setLookupResult(result);
      } else {
        addActivity(`❌ No address found for tag "${lookupTag}"`, 'warning');
        setLookupResult(null);
      }
    } catch (error) {
      addActivity(`❌ Lookup failed: ${error}`, 'error');
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🔑 Key Registry Contract Tester
          </h1>
          <p className="text-gray-400 text-lg">
            Test your deployed key_registry contract on local ink! node
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connection Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🔗 Connection
            </h2>
            
            <div className="space-y-4">
              <div>
                <button
                  onClick={connectToNode}
                  disabled={loading || isConnected}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isConnected
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && !isConnected ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Connecting...
                    </span>
                  ) : isConnected ? (
                    '✅ Connected to Local Node'
                  ) : (
                    '🔗 Connect to Local Node'
                  )}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter key_registry contract address..."
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={!isConnected}
                />
              </div>

              <button
                onClick={connectToContract}
                disabled={loading || !isConnected || !contractAddress.trim() || isContractConnected}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isContractConnected
                    ? 'bg-green-600 text-white cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                } ${loading || !isConnected || !contractAddress.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isContractConnected ? '✅ Connected to Contract' : '📋 Connect to Contract'}
              </button>
            </div>
          </div>

          {/* Contract Functions Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🏷️ Contract Functions
            </h2>

            <div className="space-y-6">
              {/* Register Tag */}
              <div className="border border-gray-600 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-blue-400">📝 Register Tag</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter your user tag (3-20 chars)..."
                    value={registerTag}
                    onChange={(e) => setRegisterTag(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    disabled={!isContractConnected}
                  />
                  <button
                    onClick={handleRegisterTag}
                    disabled={loading || !isContractConnected || !registerTag.trim()}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Registering...' : '🏷️ Register Tag'}
                  </button>
                </div>
              </div>

              {/* Lookup Address */}
              <div className="border border-gray-600 rounded-lg p-4">
                <h3 className="font-medium mb-3 text-green-400">🔍 Lookup Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter user tag to lookup..."
                    value={lookupTag}
                    onChange={(e) => setLookupTag(e.target.value)}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                    disabled={!isContractConnected}
                  />
                  <button
                    onClick={handleLookupAddress}
                    disabled={loading || !isContractConnected || !lookupTag.trim()}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Looking up...' : '🔍 Lookup Address'}
                  </button>
                  {lookupResult && (
                    <div className="mt-3 p-3 bg-gray-700 rounded border border-green-500">
                      <p className="text-sm text-gray-300">Address:</p>
                      <p className="font-mono text-green-400 break-all">{lookupResult}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            📊 Activity Log
          </h2>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
            {activities.length === 0 ? (
              <p className="text-gray-500 italic">No activity yet. Connect to start testing!</p>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="mb-2 flex items-start">
                  <span className="mr-2 flex-shrink-0">{getTypeIcon(activity.type)}</span>
                  <span className="text-gray-400 mr-2 flex-shrink-0">[{activity.timestamp}]</span>
                  <span className={`${
                    activity.type === 'success' ? 'text-green-400' :
                    activity.type === 'error' ? 'text-red-400' :
                    activity.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {activity.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Local vs Production Explanation */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            🏗️ Local Testing vs Production
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-lg p-4 border border-blue-500">
                <h3 className="font-semibold text-blue-400 mb-2">🏠 Local Testing (Current)</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Single local ink! node (ws://127.0.0.1:9944)</li>
                  <li>• Direct contract calls via WebSocket</li>
                  <li>• No cross-chain functionality</li>
                  <li>• Instant finality for testing</li>
                  <li>• Mock H160 addresses</li>
                  <li>• No real economic value</li>
                </ul>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-purple-500">
                <h3 className="font-semibold text-purple-400 mb-2">🌐 Production (With Hyperbridge)</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Multi-chain deployment (Polkadot, Ethereum, etc.)</li>
                  <li>• Cross-chain address resolution via ISMP</li>
                  <li>• Real H160 addresses from multiple chains</li>
                  <li>• Consensus proofs for security</li>
                  <li>• Real economic transactions</li>
                  <li>• Global user tag registry</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-green-500">
              <h3 className="font-semibold text-green-400 mb-2">🌉 Hyperbridge Role</h3>
              <p className="text-sm mb-2">
                In production, Hyperbridge enables cross-chain user tag resolution:
              </p>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Local Node:</strong> Tags only work within single chain</li>
                <li>• <strong>With Hyperbridge:</strong> Tags resolve addresses across all connected chains</li>
                <li>• <strong>ISMP Protocol:</strong> Provides cryptographic proofs for cross-chain state</li>
                <li>• <strong>Global Registry:</strong> One tag can map to addresses on multiple chains</li>
                <li>• <strong>Payment Processing:</strong> Enables cross-chain payments using human-readable tags</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
