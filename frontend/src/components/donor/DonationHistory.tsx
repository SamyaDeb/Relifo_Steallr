'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/stellar';

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  ngoName: string;
  amount: number;
  timestamp: string;
  txHash: string;
  status: 'pending' | 'completed' | 'failed';
  isAnonymous: boolean;
  message?: string;
}

interface DonationHistoryProps {
  limit?: number;
  showFilters?: boolean;
}

export default function DonationHistory({ limit, showFilters = true }: DonationHistoryProps) {
  const { isConnected, publicKey } = useWallet();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchDonations();
    }
  }, [isConnected, publicKey]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/donations?wallet=${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch donations');
      
      const data = await response.json();
      setDonations(data.donations || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = donations
    .filter(d => filter === 'all' || d.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return b.amount - a.amount;
    });

  const displayDonations = limit ? filteredDonations.slice(0, limit) : filteredDonations;

  const totalDonated = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.amount, 0);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getStatusBadge = (status: Donation['status']) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    
    const labels = {
      completed: '✓ Completed',
      pending: '⏳ Pending',
      failed: '✕ Failed',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Connect to View History</h3>
          <p className="text-gray-500">Connect your wallet to see your donation history.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Donation History</h3>
            <p className="text-sm text-gray-500">
              {donations.length} donation{donations.length !== 1 ? 's' : ''} • 
              Total: <span className="font-medium text-green-600">${totalDonated.toFixed(2)} USDC</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && donations.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'completed', 'pending'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    filter === f
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        )}
      </div>

      {/* Donations List */}
      {displayDonations.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💝</span>
          </div>
          <h4 className="font-medium text-gray-800 mb-2">No Donations Yet</h4>
          <p className="text-gray-500 text-sm">
            {filter === 'all' 
              ? 'Start making a difference by donating to a campaign.'
              : `No ${filter} donations found.`}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {displayDonations.map(donation => (
            <div 
              key={donation.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-linear-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
                    ${donation.amount >= 100 ? '💎' : donation.amount >= 50 ? '⭐' : '❤️'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {donation.campaignTitle}
                    </p>
                    <p className="text-sm text-gray-500">
                      {donation.ngoName} • {formatDate(donation.timestamp)}
                    </p>
                    {donation.message && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        &ldquo;{donation.message}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center mt-2 space-x-3">
                      {getStatusBadge(donation.status)}
                      {donation.isAnonymous && (
                        <span className="text-xs text-gray-400 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-lg font-semibold text-gray-800">
                    ${donation.amount}
                  </p>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${donation.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center justify-end mt-1"
                  >
                    {formatAddress(donation.txHash, 4)}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {limit && filteredDonations.length > limit && (
        <div className="p-4 border-t border-gray-100 text-center">
          <a href="/dashboard/donations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Donations →
          </a>
        </div>
      )}
    </div>
  );
}
