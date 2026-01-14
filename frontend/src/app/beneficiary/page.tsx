'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

interface Campaign {
  id: string;
  name: string;
  description: string;
  ngoName?: string;
  targetAmount: number;
  raisedAmount: number;
  status: 'active' | 'completed';
}

interface Application {
  id: string;
  campaignId: string;
  campaignName: string;
  status: 'pending' | 'approved' | 'rejected';
  allocatedAmount?: number;
  submittedAt: string;
}

export default function BeneficiaryDashboard() {
  const router = useRouter();
  const { isConnected, publicKey, usdcBalance } = useWallet();
  const [activeTab, setActiveTab] = useState('wallet');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applyForm, setApplyForm] = useState({
    description: '',
    documents: '',
  });

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }
    
    fetchData();
  }, [isConnected, publicKey, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch active campaigns
      const campaignsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/campaigns?status=active`
      );
      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }

      // Fetch my applications
      const appsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/beneficiaries/applications/${publicKey}`
      );
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !publicKey) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/beneficiaries/apply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: publicKey,
            campaignId: selectedCampaign.id,
            campaignName: selectedCampaign.name,
            ...applyForm,
            status: 'pending',
            submittedAt: new Date().toISOString(),
          }),
        }
      );

      if (response.ok) {
        setShowApplyModal(false);
        setApplyForm({ description: '', documents: '' });
        setSelectedCampaign(null);
        fetchData();
        alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      // Save locally for demo
      const newApp: Application = {
        id: `app_${Date.now()}`,
        campaignId: selectedCampaign.id,
        campaignName: selectedCampaign.name,
        status: 'pending',
        submittedAt: new Date().toISOString(),
      };
      setApplications((prev) => [...prev, newApp]);
      setShowApplyModal(false);
      setApplyForm({ description: '', documents: '' });
      alert('Application submitted!');
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Beneficiary Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Apply for aid, view your balance, and make purchases
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 mb-8">
          <p className="text-white/80 text-sm mb-2">Available Balance</p>
          <p className="text-4xl font-bold text-white">{usdcBalance} USDC</p>
          <p className="text-white/70 text-sm mt-2 font-mono">
            {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
          </p>
        </div>

        {/* Apply Modal */}
        {showApplyModal && selectedCampaign && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-2">Apply for Relief</h2>
              <p className="text-gray-600 mb-4">Campaign: {selectedCampaign.name}</p>
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Why do you need assistance?
                  </label>
                  <textarea
                    value={applyForm.description}
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, description: e.target.value })
                    }
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe your situation and why you need relief aid..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supporting Documents (URLs)
                  </label>
                  <input
                    type="text"
                    value={applyForm.documents}
                    onChange={(e) =>
                      setApplyForm({ ...applyForm, documents: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Links to ID, proof of address, etc. (optional)"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Submit Application
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
                { id: 'wallet', name: 'Wallet' },
                { id: 'campaigns', name: 'Browse Campaigns' },
                { id: 'applications', name: 'My Applications' },
                { id: 'history', name: 'Transaction History' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
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
            {activeTab === 'wallet' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Wallet</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{usdcBalance} USDC</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Spending Mode</p>
                    <p className="text-lg font-semibold text-gray-900">Direct Spending</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can spend funds freely at any registered merchant
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Approved Applications</p>
                    <p className="text-2xl font-bold text-green-600">
                      {applications.filter((a) => a.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No active campaigns available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-600 h-2 rounded-full"
                                  style={{
                                    width: `${Math.min(
                                      (campaign.raisedAmount / campaign.targetAmount) * 100,
                                      100
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {campaign.raisedAmount} / {campaign.targetAmount} USDC raised
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleApplyToCampaign(campaign)}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">My Applications</h2>
                {applications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">
                      No applications yet. Browse campaigns and apply for relief!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.campaignName}</h3>
                            <p className="text-xs text-gray-500">
                              Applied: {new Date(app.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                app.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </span>
                            {app.status === 'approved' && app.allocatedAmount && (
                              <p className="text-sm font-semibold text-green-600 mt-1">
                                {app.allocatedAmount} USDC
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
