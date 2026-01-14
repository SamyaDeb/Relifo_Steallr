'use client';

import { useWallet } from '@/hooks/useWallet';
import DonorWallet from '@/components/donor/DonorWallet';
import CampaignList from '@/components/donor/CampaignList';
import DonationHistory from '@/components/donor/DonationHistory';
import AddUSDC from '@/components/donor/AddUSDC';
import { useState } from 'react';

export default function DonorDashboard() {
  const { isConnected } = useWallet();
  const [showAddUSDC, setShowAddUSDC] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to access the donor dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse campaigns and make donations
          </p>
        </div>

        {/* Wallet Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <DonorWallet />
          </div>
          <div>
            <button
              onClick={() => setShowAddUSDC(true)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:from-green-600 hover:to-green-700 transition-all duration-200"
            >
              <div className="text-4xl mb-2">💵</div>
              <div className="text-xl font-semibold">Add USDC</div>
              <div className="text-sm opacity-90 mt-1">Get testnet USDC</div>
            </button>
          </div>
        </div>

        {/* Add USDC Modal */}
        {showAddUSDC && (
          <AddUSDC onClose={() => setShowAddUSDC(false)} />
        )}

        {/* Campaigns */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Active Campaigns
          </h2>
          <CampaignList />
        </div>

        {/* Donation History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your Donation History
          </h2>
          <DonationHistory />
        </div>
      </div>
    </div>
  );
}
