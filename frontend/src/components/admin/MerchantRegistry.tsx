'use client';

import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/stellar';

interface Merchant {
  id: string;
  name: string;
  businessName: string;
  walletAddress: string;
  category: string;
  location: string;
  email: string;
  phone: string;
  registrationDate: string;
  status: 'pending' | 'active' | 'suspended';
  documents: {
    type: string;
    url: string;
  }[];
  totalOrders?: number;
  totalRevenue?: number;
}

export default function MerchantRegistry() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'suspend' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, [filter]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/merchants?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch merchants');
      
      const data = await response.json();
      setMerchants(data.merchants || []);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedMerchant || !actionType) return;
    
    if (actionType === 'suspend' && !actionReason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    try {
      setProcessing(true);
      const endpoint = actionType === 'approve' ? 'verify' : 'suspend';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/merchants/${selectedMerchant.id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: actionReason || undefined }),
      });
      
      if (!response.ok) throw new Error('Action failed');
      
      await fetchMerchants();
      setSelectedMerchant(null);
      setActionType(null);
      setActionReason('');
    } catch (err) {
      console.error('Error processing merchant action:', err);
      alert('Failed to process action');
    } finally {
      setProcessing(false);
    }
  };

  const filteredMerchants = merchants.filter(m => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(query) ||
        m.businessName.toLowerCase().includes(query) ||
        m.location.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: merchants.length,
    pending: merchants.filter(m => m.status === 'pending').length,
    active: merchants.filter(m => m.status === 'active').length,
    suspended: merchants.filter(m => m.status === 'suspended').length,
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
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Suspended</p>
          <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search merchants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Merchant List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Business</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No merchants found
                  </td>
                </tr>
              ) : (
                filteredMerchants.map(merchant => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{merchant.businessName}</p>
                        <p className="text-sm text-gray-500">{formatAddress(merchant.walletAddress, 4)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-800">{merchant.name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {merchant.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {merchant.location}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        merchant.status === 'active' ? 'bg-green-100 text-green-700' :
                        merchant.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {merchant.totalOrders || 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedMerchant(merchant)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{selectedMerchant.businessName}</h3>
                <button onClick={() => setSelectedMerchant(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner</label>
                  <p className="text-gray-800 mt-1">{selectedMerchant.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-gray-800 mt-1">{selectedMerchant.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800 mt-1">{selectedMerchant.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-800 mt-1">{selectedMerchant.phone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-800 mt-1">{selectedMerchant.location}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                <code className="block text-sm text-gray-800 mt-1">{selectedMerchant.walletAddress}</code>
              </div>

              {selectedMerchant.status === 'active' && (
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{selectedMerchant.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-800">${selectedMerchant.totalRevenue?.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Documents</label>
                <div className="mt-2 space-y-2">
                  {selectedMerchant.documents.map((doc, idx) => (
                    <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                      <span className="text-sm text-gray-700">{doc.type}</span>
                      <span className="text-blue-600">View →</span>
                    </a>
                  ))}
                </div>
              </div>

              {selectedMerchant.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => { setActionType('suspend'); handleAction(); }}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { setActionType('approve'); handleAction(); }}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              )}

              {selectedMerchant.status === 'active' && (
                <button
                  onClick={() => setActionType('suspend')}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Suspend Merchant
                </button>
              )}

              {actionType === 'suspend' && (
                <div>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Reason for suspension..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                  <div className="flex space-x-3 mt-3">
                    <button onClick={() => setActionType(null)} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleAction} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg">Confirm</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
