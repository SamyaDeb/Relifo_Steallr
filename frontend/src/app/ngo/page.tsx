'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

interface Campaign {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

interface BeneficiaryApplication {
  id: string;
  walletAddress: string;
  name: string;
  email: string;
  description: string;
  campaignId: string;
  status: 'pending' | 'approved' | 'rejected';
  allocatedAmount?: number;
  submittedAt: string;
}

export default function NGODashboard() {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [beneficiaryApps, setBeneficiaryApps] = useState<BeneficiaryApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    
    // Check if user has NGO role
    if (publicKey) {
      const userRole = localStorage.getItem(`user_role_${publicKey}`);
      if (!userRole || (!userRole.includes('ngo') && userRole !== 'ngo_pending')) {
        router.push('/register');
      }
    }
    
    fetchData();
  }, [isConnected, publicKey, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch campaigns for this NGO
      const campaignsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/campaigns?ngo=${publicKey}`
      );
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }

      // Fetch beneficiary applications for this NGO's campaigns
      const beneficiariesRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/beneficiaries?ngo=${publicKey}`
      );
      if (beneficiariesRes.ok) {
        const data = await beneficiariesRes.json();
        setBeneficiaryApps(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/campaigns`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...campaignForm,
            ngoWallet: publicKey,
            targetAmount: parseFloat(campaignForm.targetAmount),
            status: 'active',
            raisedAmount: 0,
          }),
        }
      );

      if (response.ok) {
        setShowCreateCampaign(false);
        setCampaignForm({ name: '', description: '', targetAmount: '' });
        fetchData();
        alert('Campaign created successfully!');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const handleApproveBeneficiary = async (app: BeneficiaryApplication) => {
    const amount = prompt('Enter allocation amount (USDC):');
    if (!amount || isNaN(parseFloat(amount))) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/beneficiaries/${app.id}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            allocatedAmount: parseFloat(amount),
            approvedBy: publicKey,
          }),
        }
      );

      setBeneficiaryApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? { ...a, status: 'approved', allocatedAmount: parseFloat(amount) }
            : a
        )
      );
      alert(`Approved ${app.name} with ${amount} USDC allocation`);
    } catch (error) {
      console.error('Error approving beneficiary:', error);
    }
  };

  const handleRejectBeneficiary = async (app: BeneficiaryApplication) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/beneficiaries/${app.id}/reject`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        }
      );

      setBeneficiaryApps((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'rejected' } : a))
      );
      alert(`Rejected ${app.name}'s application`);
    } catch (error) {
      console.error('Error rejecting beneficiary:', error);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campaign Organizer Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Create campaigns, review applications, and allocate funds
            </p>
          </div>
          <button
            onClick={() => setShowCreateCampaign(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Create Campaign
          </button>
        </div>

        {/* Create Campaign Modal */}
        {showCreateCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., Flood Relief 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe the relief campaign..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={campaignForm.targetAmount}
                    onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: e.target.value })}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="10000"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCampaign(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'campaigns', name: 'My Campaigns' },
                { id: 'applications', name: 'Beneficiary Applications' },
                { id: 'allocations', name: 'Fund Allocations' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold text-blue-600">{campaigns.length}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Active Beneficiaries</p>
                    <p className="text-2xl font-bold text-green-600">
                      {beneficiaryApps.filter((a) => a.status === 'approved').length}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Allocated</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {beneficiaryApps
                        .filter((a) => a.status === 'approved')
                        .reduce((sum, a) => sum + (a.allocatedAmount || 0), 0)}{' '}
                      USDC
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Campaigns</h2>
                {campaigns.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No campaigns yet. Create your first campaign!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                            <div className="mt-2 text-sm">
                              <span className="text-gray-500">Progress: </span>
                              <span className="font-medium">
                                {campaign.raisedAmount} / {campaign.targetAmount} USDC
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Beneficiary Applications</h2>
                {beneficiaryApps.filter((a) => a.status === 'pending').length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beneficiaryApps
                      .filter((a) => a.status === 'pending')
                      .map((app) => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900">{app.name}</h3>
                              <p className="text-sm text-gray-600">{app.email}</p>
                              <p className="text-sm text-gray-500 mt-2">{app.description}</p>
                              <p className="text-xs text-gray-400 mt-2 font-mono">
                                Wallet: {app.walletAddress}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveBeneficiary(app)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectBeneficiary(app)}
                                className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'allocations' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Approved Beneficiaries</h2>
                {beneficiaryApps.filter((a) => a.status === 'approved').length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No approved beneficiaries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {beneficiaryApps
                      .filter((a) => a.status === 'approved')
                      .map((app) => (
                        <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-gray-900">{app.name}</h3>
                              <p className="text-sm text-gray-600">{app.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                {app.allocatedAmount} USDC
                              </p>
                              <p className="text-xs text-gray-500">Allocated</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
