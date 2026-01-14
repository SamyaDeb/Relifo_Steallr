'use client';

import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/stellar';

interface NGO {
  id: string;
  name: string;
  description: string;
  walletAddress: string;
  website?: string;
  email: string;
  registrationDate: string;
  status: 'pending' | 'verified' | 'rejected';
  documents: {
    type: string;
    url: string;
  }[];
  verifiedBy?: string;
  verificationDate?: string;
  rejectionReason?: string;
}

export default function NGOVerification() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchNGOs();
  }, [filter]);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/ngos?status=${filter}`);
      if (!response.ok) throw new Error('Failed to fetch NGOs');
      
      const data = await response.json();
      setNgos(data.ngos || []);
    } catch (err) {
      console.error('Error fetching NGOs:', err);
      setNgos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (ngoId: string) => {
    try {
      setVerifying(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/ngos/${ngoId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) throw new Error('Verification failed');
      
      await fetchNGOs();
      setSelectedNgo(null);
    } catch (err) {
      console.error('Error verifying NGO:', err);
      alert('Failed to verify NGO');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async (ngoId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setVerifying(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/ngos/${ngoId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });
      
      if (!response.ok) throw new Error('Rejection failed');
      
      await fetchNGOs();
      setSelectedNgo(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting NGO:', err);
      alert('Failed to reject NGO');
    } finally {
      setVerifying(false);
    }
  };

  const stats = {
    pending: ngos.filter(n => n.status === 'pending').length,
    verified: ngos.filter(n => n.status === 'verified').length,
    rejected: ngos.filter(n => n.status === 'rejected').length,
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          {(['pending', 'verified', 'rejected'] as const).map(status => (
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

        {/* NGO List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : ngos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {filter} NGOs found
            </div>
          ) : (
            ngos.map(ngo => (
              <div key={ngo.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{ngo.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{ngo.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>{formatAddress(ngo.walletAddress, 4)}</span>
                      <span>•</span>
                      <span>{new Date(ngo.registrationDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{ngo.documents.length} documents</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNgo(ngo)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">{selectedNgo.name}</h3>
                <button
                  onClick={() => setSelectedNgo(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-800 mt-1">{selectedNgo.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                <code className="block text-sm text-gray-800 mt-1">{selectedNgo.walletAddress}</code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800 mt-1">{selectedNgo.email}</p>
                </div>
                {selectedNgo.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <a href={selectedNgo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 block mt-1">
                      {selectedNgo.website}
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Documents</label>
                <div className="mt-2 space-y-2">
                  {selectedNgo.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <span className="text-sm text-gray-700">{doc.type}</span>
                      <span className="text-blue-600">View →</span>
                    </a>
                  ))}
                </div>
              </div>

              {selectedNgo.status === 'pending' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rejection Reason (Optional)</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this NGO is being rejected..."
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReject(selectedNgo.id)}
                      disabled={verifying}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleVerify(selectedNgo.id)}
                      disabled={verifying}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Verify NGO
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
