import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🚀 Nexor Contract Testing Suite
          </h1>
          <p className="text-gray-400 text-xl">
            Test your deployed ink! contracts on local node
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cross Chain Swap Tester */}
          <Link href="/cross-chain-swap" className="group">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  💱
                </div>
                <h2 className="text-2xl font-bold mb-3 text-blue-400">
                  Cross Chain Swap
                </h2>
                <p className="text-gray-400 mb-4">
                  Test payment processing, merchant registration, and cross-chain swaps with Hyperbridge ISMP integration
                </p>
                <div className="bg-gray-900 rounded-lg p-3 text-sm">
                  <div className="text-green-400 font-mono">Functions:</div>
                  <div className="text-gray-300 mt-1">
                    • register_merchant()<br/>
                    • process_payment()<br/>
                    • get_payment_status()<br/>
                    • get_merchant_preferences()
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Key Registry Tester */}
          <Link href="/key-registry" className="group">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105 cursor-pointer">
              <div className="text-center">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  🔑
                </div>
                <h2 className="text-2xl font-bold mb-3 text-purple-400">
                  Key Registry
                </h2>
                <p className="text-gray-400 mb-4">
                  Test user tag registration and address lookup functionality for human-readable address mapping
                </p>
                <div className="bg-gray-900 rounded-lg p-3 text-sm">
                  <div className="text-green-400 font-mono">Functions:</div>
                  <div className="text-gray-300 mt-1">
                    • register_tag()<br/>
                    • lookup_address()
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Local vs Production Info */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            🏗️ Testing Environment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl mb-2">🏠</div>
              <h3 className="font-semibold text-blue-400 mb-2">Local Node</h3>
              <p className="text-sm text-gray-400">
                Testing on ws://127.0.0.1:9944 with instant finality
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl mb-2">🌉</div>
              <h3 className="font-semibold text-purple-400 mb-2">Hyperbridge Ready</h3>
              <p className="text-sm text-gray-400">
                Contracts include ISMP integration for cross-chain functionality
              </p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold text-green-400 mb-2">Production Ready</h3>
              <p className="text-sm text-gray-400">
                Deploy to mainnet for real cross-chain payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
