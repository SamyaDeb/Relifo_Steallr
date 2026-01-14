'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Application {
  id: string;
  campaignTitle: string;
  ngoName: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  allocationAmount?: number;
}

export default function ApplicationStatus() {
  const { isConnected, publicKey } = useWallet();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchApplications();
    }
  }, [isConnected, publicKey]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beneficiary/applications?wallet=${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([
        {
          id: '1',
          campaignTitle: 'Emergency Flood Relief',
          ngoName: 'Relief International',
          status: 'approved',
          submittedAt: '2024-01-15T10:00:00Z',
          reviewedAt: '2024-01-20T14:30:00Z',
          allocationAmount: 100,
        },
        {
          id: '2',
          campaignTitle: 'Food Security Program',
          ngoName: 'World Food Aid',
          status: 'pending',
          submittedAt: '2024-01-22T09:15:00Z',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">Connect your wallet to view application status</p>
      </div>
    );
  }

  const getStatusDisplay = (status: Application['status']) => {
    const configs = {
      pending: {
        icon: '⏳',
        label: 'Under Review',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        badgeColor: 'bg-yellow-100 text-yellow-700',
      },
      approved: {
        icon: '✅',
        label: 'Approved',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        badgeColor: 'bg-green-100 text-green-700',
      },
      rejected: {
        icon: '❌',
        label: 'Not Approved',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        badgeColor: 'bg-red-100 text-red-700',
      },
    };
    return configs[status];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Application Status</h2>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Applications Yet</h3>
          <p className="text-gray-500 mb-6">You haven&apos;t submitted any applications.</p>
          <a href="/browse" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Browse Campaigns
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map(app => {
            const statusConfig = getStatusDisplay(app.status);
            
            return (
              <div
                key={app.id}
                className={`rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {app.campaignTitle}
                      </h3>
                      <p className="text-sm text-gray-600">by {app.ngoName}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{statusConfig.icon}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.badgeColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                    </div>

                    {app.reviewedAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Reviewed: {new Date(app.reviewedAt).toLocaleDateString()}
                      </div>
                    )}

                    {app.status === 'approved' && app.allocationAmount && (
                      <div className={`mt-4 p-4 rounded-lg border ${statusConfig.borderColor}`}>
                        <p className="text-sm font-medium text-gray-700 mb-1">Allocation Amount</p>
                        <p className="text-2xl font-bold text-green-600">${app.allocationAmount} USDC</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Funds will be transferred to your wallet after final processing.
                        </p>
                        <a
                          href="/dashboard"
                          className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Go to Wallet Dashboard
                        </a>
                      </div>
                    )}

                    {app.status === 'pending' && (
                      <div className={`mt-4 p-4 rounded-lg border ${statusConfig.borderColor}`}>
                        <p className={`text-sm ${statusConfig.textColor}`}>
                          Your application is being reviewed by {app.ngoName}. You&apos;ll be notified once a decision is made.
                        </p>
                      </div>
                    )}

                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className={`mt-4 p-4 rounded-lg border ${statusConfig.borderColor}`}>
                        <p className="text-sm font-medium text-red-800 mb-2">Reason</p>
                        <p className="text-sm text-red-700">{app.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
