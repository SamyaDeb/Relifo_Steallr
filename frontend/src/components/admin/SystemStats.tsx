'use client';

import { useState, useEffect } from 'react';

interface SystemStats {
  totalDonations: number;
  totalDonors: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalNGOs: number;
  verifiedNGOs: number;
  totalBeneficiaries: number;
  approvedBeneficiaries: number;
  totalMerchants: number;
  activeMerchants: number;
  totalTransactions: number;
  platformFees: number;
  avgDonationAmount: number;
  donationTrend: { date: string; amount: number }[];
  topCampaigns: { id: string; title: string; raised: number }[];
  recentActivity: { type: string; description: string; timestamp: string }[];
}

export default function SystemStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/stats?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <div className="text-center py-8">Loading system statistics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total Donations</p>
          <p className="text-3xl font-bold">${(stats.totalDonations / 1000).toFixed(0)}k</p>
          <p className="text-blue-100 text-xs mt-2">{stats.totalDonors} donors</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Campaigns</p>
          <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
          <p className="text-green-100 text-xs mt-2">{stats.activeCampaigns} active</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Beneficiaries</p>
          <p className="text-3xl font-bold">{stats.totalBeneficiaries}</p>
          <p className="text-purple-100 text-xs mt-2">{stats.approvedBeneficiaries} approved</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <p className="text-orange-100 text-sm mb-1">Avg Donation</p>
          <p className="text-3xl font-bold">${stats.avgDonationAmount.toFixed(0)}</p>
          <p className="text-orange-100 text-xs mt-2">{stats.totalTransactions} transactions</p>
        </div>
      </div>

      {/* NGO & Merchant Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">NGO Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total NGOs</span>
              <span className="font-semibold text-gray-800">{stats.totalNGOs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified</span>
              <span className="font-semibold text-green-600">{stats.verifiedNGOs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats.totalNGOs - stats.verifiedNGOs}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.verifiedNGOs / stats.totalNGOs) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.verifiedNGOs / stats.totalNGOs) * 100)}% verified
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Merchant Network</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Merchants</span>
              <span className="font-semibold text-gray-800">{stats.totalMerchants}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats.activeMerchants}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inactive</span>
              <span className="font-semibold text-gray-400">{stats.totalMerchants - stats.activeMerchants}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stats.activeMerchants / stats.totalMerchants) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {Math.round((stats.activeMerchants / stats.totalMerchants) * 100)}% active
            </p>
          </div>
        </div>
      </div>

      {/* Donation Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Trend</h3>
        <div className="h-64 flex items-end space-x-4">
          {stats.donationTrend.map((data, idx) => {
            const maxAmount = Math.max(...stats.donationTrend.map(d => d.amount));
            const heightPercent = (data.amount / maxAmount) * 100;
            
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end justify-center mb-2">
                  <span className="text-xs text-gray-600">${(data.amount / 1000).toFixed(0)}k</span>
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-colors cursor-pointer"
                  style={{ height: `${heightPercent}%` }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Campaigns & Recent Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Campaigns</h3>
          <div className="space-y-3">
            {stats.topCampaigns.map((campaign, idx) => (
              <div key={campaign.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{campaign.title}</p>
                  <p className="text-sm text-gray-500">${campaign.raised.toLocaleString()} raised</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'donation' ? 'bg-green-500' :
                  activity.type === 'ngo' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Revenue */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Platform Fees Collected</h3>
            <p className="text-sm text-gray-500">From {timeRange === 'all' ? 'all time' : `last ${timeRange}`}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">${stats.platformFees.toLocaleString()}</p>
            <p className="text-sm text-gray-500">0.5% fee rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
