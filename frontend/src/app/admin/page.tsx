'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import NGOVerification from '@/components/admin/NGOVerification';
import MerchantRegistry from '@/components/admin/MerchantRegistry';
import SystemStats from '@/components/admin/SystemStats';
import SettingsPanel from '@/components/admin/SettingsPanel';

interface Application {
  id: string;
  walletAddress: string;
  role: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  description: string;
  documents?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Get admin address from environment variable
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

  // Check if current user is admin
  const isAdmin = publicKey === adminAddress;

  useEffect(() => {
    if (isConnected && !isAdmin) {
      router.push('/');
    }
  }, [isConnected, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [isAdmin]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/applications`
      );
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (application: Application) => {
    setProcessingId(application.id);
    try {
      // Try to update in backend
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/applications/${application.walletAddress}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        }
      );
    } catch (error) {
      console.log('Backend update failed, updating localStorage');
    }

    // Update localStorage (will be picked up by user's browser)
    // For demo, we store approved roles
    localStorage.setItem(`approved_${application.walletAddress}`, JSON.stringify({
      role: application.role,
      status: 'approved',
      approvedAt: new Date().toISOString(),
    }));

    // Remove from pending list
    setApplications((prev) => prev.filter((app) => app.id !== application.id));
    setProcessingId(null);
    alert(`Approved ${application.name} as ${getRoleLabel(application.role)}`);
  };

  const handleReject = async (application: Application) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessingId(application.id);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/applications/${application.walletAddress}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected', reason }),
        }
      );
    } catch (error) {
      console.log('Backend update failed');
    }

    localStorage.setItem(`rejected_${application.walletAddress}`, JSON.stringify({
      role: application.role,
      status: 'rejected',
      reason,
      rejectedAt: new Date().toISOString(),
    }));

    setApplications((prev) => prev.filter((app) => app.id !== application.id));
    setProcessingId(null);
    alert(`Rejected ${application.name}'s application`);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ngo':
        return 'Campaign Organizer (NGO)';
      case 'beneficiary':
        return 'Beneficiary';
      case 'merchant':
        return 'Merchant';
      case 'donor':
        return 'Donor';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ngo':
        return 'bg-blue-100 text-blue-800';
      case 'beneficiary':
        return 'bg-yellow-100 text-yellow-800';
      case 'merchant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-gray-600">
            Please connect your wallet to access the admin dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to access the admin dashboard
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage applications, NGOs, merchants, and system settings
          </p>
          <p className="mt-1 text-xs text-gray-500 font-mono">
            Admin: {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'applications', name: 'Applications', count: applications.length },
                { id: 'ngos', name: 'NGO Verification' },
                { id: 'merchants', name: 'Merchants' },
                { id: 'stats', name: 'System Stats' },
                { id: 'settings', name: 'Settings' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'applications' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pending Applications</h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading applications...</p>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      All applications have been processed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{app.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(app.role)}`}>
                                {getRoleLabel(app.role)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Email: {app.email}</p>
                              {app.phone && <p>Phone: {app.phone}</p>}
                              {app.organization && <p>Organization: {app.organization}</p>}
                              <p className="text-gray-500 mt-2">{app.description}</p>
                              <p className="text-xs text-gray-400 mt-2 font-mono">
                                Wallet: {app.walletAddress}
                              </p>
                              <p className="text-xs text-gray-400">
                                Submitted: {new Date(app.submittedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleApprove(app)}
                              disabled={processingId === app.id}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                            >
                              {processingId === app.id ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleReject(app)}
                              disabled={processingId === app.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={fetchApplications}
                  className="mt-4 text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  ↻ Refresh Applications
                </button>
              </div>
            )}

            {activeTab === 'ngos' && <NGOVerification />}
            {activeTab === 'merchants' && <MerchantRegistry />}
            {activeTab === 'stats' && <SystemStats />}
            {activeTab === 'settings' && <SettingsPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
