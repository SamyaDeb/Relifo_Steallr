'use client';

import { useWallet } from '@/hooks/useWallet';

interface AddUSDCProps {
  onClose: () => void;
}

export default function AddUSDC({ onClose }: AddUSDCProps) {
  const { publicKey, setupUSDCTrustline, hasUSDCTrustline, isLoading } = useWallet();

  const USDC_ISSUER = process.env.NEXT_PUBLIC_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Add USDC to Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Network Notice */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🧪</span>
              <div>
                <p className="font-medium text-purple-800">Testnet Mode</p>
                <p className="text-sm text-purple-600">
                  You are on Stellar Testnet. USDC here has no real value.
                </p>
              </div>
            </div>
          </div>

          {/* Step 1: Trustline */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                hasUSDCTrustline ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {hasUSDCTrustline ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-bold">1</span>
                )}
              </div>
              <h3 className="font-medium text-gray-800">
                {hasUSDCTrustline ? 'USDC Trustline Added ✓' : 'Add USDC Trustline'}
              </h3>
            </div>
            
            {!hasUSDCTrustline && (
              <div className="ml-11">
                <p className="text-sm text-gray-600 mb-3">
                  Before you can receive USDC, you need to add a trustline to your Stellar account.
                </p>
                <button
                  onClick={setupUSDCTrustline}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add USDC Trustline'}
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Get USDC */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                <span className="text-sm font-bold">2</span>
              </div>
              <h3 className="font-medium text-gray-800">Get Testnet USDC</h3>
            </div>
            
            <div className="ml-11 space-y-4">
              <p className="text-sm text-gray-600">
                Use one of these methods to get testnet USDC:
              </p>

              {/* Option A: Stellar Laboratory */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Option A: Stellar Laboratory
                </h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside mb-3">
                  <li>Go to Stellar Laboratory</li>
                  <li>Select &quot;Build Transaction&quot;</li>
                  <li>Use the payment operation to send yourself USDC</li>
                </ol>
                <a
                  href="https://laboratory.stellar.org/#txbuilder?network=test"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Open Stellar Laboratory
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Option B: Testnet Faucet */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Option B: Request from Testnet Faucet
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Some test USDC faucets are available in Stellar Discord community.
                </p>
                <a
                  href="https://discord.gg/stellardev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Join Stellar Discord
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Option C: DEX */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  Option C: Stellar DEX
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Use Stellar DEX to swap XLM for testnet USDC.
                </p>
                <a
                  href="https://stellarterm.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  Open StellarTerm
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Your Wallet Info */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-500 mb-2">Your Wallet Address</p>
            <code className="text-xs text-gray-700 break-all">{publicKey}</code>
            <p className="text-sm text-gray-500 mt-3 mb-2">USDC Issuer (Testnet)</p>
            <code className="text-xs text-gray-700 break-all">{USDC_ISSUER}</code>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
