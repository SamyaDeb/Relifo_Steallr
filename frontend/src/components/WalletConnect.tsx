'use client';

import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/stellar';
import { useState } from 'react';

interface WalletConnectProps {
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
  className?: string;
  showBalance?: boolean;
}

export default function WalletConnect({
  onConnect,
  onDisconnect,
  className = '',
  showBalance = true,
}: WalletConnectProps) {
  const {
    isConnected,
    isLoading,
    publicKey,
    usdcBalance,
    isFreighterInstalled,
    hasUSDCTrustline,
    error,
    connect,
    disconnect,
    setupUSDCTrustline,
    fundAccount,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      const key = await connect();
      onConnect?.(key);
    } catch (err) {
      console.error('Failed to connect:', err);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onDisconnect?.();
    setShowDropdown(false);
  };

  const handleSetupTrustline = async () => {
    try {
      await setupUSDCTrustline();
    } catch (err) {
      console.error('Failed to setup trustline:', err);
    }
  };

  const handleFundAccount = async () => {
    try {
      await fundAccount();
    } catch (err) {
      console.error('Failed to fund account:', err);
    }
  };

  // Not installed state
  if (!isFreighterInstalled && !isLoading) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors ${className}`}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Install Freighter
      </a>
    );
  }

  // Connected state
  if (isConnected && publicKey) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-3 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {/* Wallet Icon */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          
          <div className="text-left">
            <p className="text-xs text-gray-500">Connected</p>
            <p className="text-sm font-mono font-medium text-gray-800">
              {formatAddress(publicKey, 4)}
            </p>
          </div>

          {showBalance && (
            <div className="pl-3 border-l border-gray-200">
              <p className="text-xs text-gray-500">USDC</p>
              <p className="text-sm font-semibold text-green-600">
                {parseFloat(usdcBalance).toFixed(2)}
              </p>
            </div>
          )}

          <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500">Wallet Address</p>
              <p className="text-sm font-mono text-gray-700 break-all">
                {publicKey}
              </p>
            </div>

            {!hasUSDCTrustline && (
              <button
                onClick={handleSetupTrustline}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add USDC Trustline
              </button>
            )}

            <button
              onClick={handleFundAccount}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Fund with Friendbot (Testnet)
            </button>

            <a
              href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View on Stellar Expert
            </a>

            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Connect Wallet
        </>
      )}
    </button>
  );
}
