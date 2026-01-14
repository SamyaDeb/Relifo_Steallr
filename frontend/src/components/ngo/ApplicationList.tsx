'use client';

import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/stellar';

interface Application {
  id: string;
  campaignId: string;
  campaignTitle: string;
  applicantName: string;
  applicantWallet: string;
  email: string;
  phone: string;
  householdSize: number;
  monthlyIncome: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documentsCount: number;
}

interface ApplicationListProps {
  campaignId?: string;
  statusFilter?: 'pending' | 'approved' | 'rejected' | 'all';
  onSelectApplication?: (application: Application) => void;
}

export default function ApplicationList({ 
  campaignId, 
  statusFilter = 'all',
  onSelectApplication 
}: ApplicationListProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(statusFilter);

  useEffect(() => {
    fetchApplications();
  }, [campaignId, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (campaignId) params.append('campaignId', campaignId);
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/ngo/applications?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch applications');
      
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const getStatusBadge = (status: Application['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                filter === status
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {filter !== 'all' ? filter : ''} applications found
            </div>
          ) : (
            filteredApplications.map(app => (
              <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-800">{app.applicantName}</h4>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{app.campaignTitle}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>👤 Household: {app.householdSize}</span>
                      <span>💰 Income: ${app.monthlyIncome}/mo</span>
                      <span>📄 {app.documentsCount} docs</span>
                      <span>{formatAddress(app.applicantWallet, 4)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{app.reason}&rdquo;</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectApplication?.(app)}
                    className="ml-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
