'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/stellar';

interface WalletInfo {
  balance: number;
  controlMode: 'direct' | 'controlled';
  categoryLimits?: {
    food: { limit: number; spent: number };
    medical: { limit: number; spent: number };
    education: { limit: number; spent: number };
    shelter: { limit: number; spent: number };
    other: { limit: number; spent: number };
  };
  campaignTitle: string;
  ngoName: string;
}

export default function WalletDashboard() {
  const { isConnected, publicKey } = useWallet();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchWalletInfo();
    }
  }, [isConnected, publicKey]);

  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beneficiary/wallet?address=${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch wallet info');
      
      const data = await response.json();
      setWalletInfo(data);
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setWalletInfo(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to view dashboard</p>
      </div>
    );
  }

  if (loading || !walletInfo) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-20 bg-gray-200 rounded mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Balance Card */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Available Balance</p>
            <p className="text-4xl font-bold">${walletInfo.balance} USDC</p>
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            walletInfo.controlMode === 'direct' 
              ? 'bg-green-500/20 text-green-100' 
              : 'bg-purple-500/20 text-purple-100'
          }`}>
            {walletInfo.controlMode === 'direct' ? '🔓 Direct Mode' : '🔒 Controlled Mode'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-blue-500">
          <div>
            <p className="text-blue-100 text-sm">Campaign</p>
            <p className="font-medium">{walletInfo.campaignTitle}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">NGO</p>
            <p className="font-medium">{walletInfo.ngoName}</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-500">
          <p className="text-blue-100 text-sm mb-1">Wallet Address</p>
          <code className="text-sm">{publicKey && formatAddress(publicKey, 8)}</code>
        </div>
      </div>

      {/* Control Mode Info */}
      {walletInfo.controlMode === 'direct' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start">
            <span className="text-3xl mr-4">🔓</span>
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Direct Spending Mode</h3>
              <p className="text-green-700 text-sm mb-4">
                You have full control over your funds. Spend them at any registered merchant without restrictions.
              </p>
              <a
                href="/dashboard/spend"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Make a Purchase
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start">
            <span className="text-3xl mr-4">🔒</span>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 mb-2">Controlled Spending Mode</h3>
              <p className="text-purple-700 text-sm mb-4">
                Spending is organized by categories with limits. Submit purchase requests for NGO approval.
              </p>

              {walletInfo.categoryLimits && (
                <div className="space-y-3">
                  {Object.entries(walletInfo.categoryLimits).map(([category, data]) => {
                    const percentage = (data.spent / data.limit) * 100;
                    const available = data.limit - data.spent;
                    
                    return (
                      <div key={category} className="bg-white rounded-lg p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-800 capitalize">{category}</span>
                          <span className="text-gray-600">${available.toFixed(2)} available</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          ${data.spent} of ${data.limit} used ({percentage.toFixed(0)}%)
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <a
                href="/dashboard/request"
                className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Request Purchase
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <a href="/dashboard/transactions" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow text-center">
          <span className="text-3xl block mb-2">📊</span>
          <h4 className="font-medium text-gray-800">Transaction History</h4>
        </a>
        <a href="/dashboard/moneygram" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow text-center">
          <span className="text-3xl block mb-2">💵</span>
          <h4 className="font-medium text-gray-800">MoneyGram Cashout</h4>
        </a>
        <a href="/status" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow text-center">
          <span className="text-3xl block mb-2">📋</span>
          <h4 className="font-medium text-gray-800">Application Status</h4>
        </a>
      </div>
    </div>
  );
}
