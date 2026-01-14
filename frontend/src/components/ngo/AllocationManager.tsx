'use client';

import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/stellar';

interface Beneficiary {
  id: string;
  name: string;
  walletAddress: string;
  campaignId: string;
  campaignTitle: string;
  currentBalance: number;
  totalAllocated: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  approvedAt: string;
}

export default function AllocationManager() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [allocationAmount, setAllocationAmount] = useState(0);
  const [allocating, setAllocating] = useState(false);

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ngo/beneficiaries?status=active');
      if (!response.ok) throw new Error('Failed to fetch beneficiaries');
      
      const data = await response.json();
      setBeneficiaries(data.beneficiaries || []);
    } catch (err) {
      console.error('Error fetching beneficiaries:', err);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedBeneficiary || allocationAmount <= 0) return;

    try {
      setAllocating(true);
      
      const response = await fetch(`/api/ngo/beneficiaries/${selectedBeneficiary.id}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: allocationAmount }),
      });

      if (!response.ok) throw new Error('Allocation failed');
      
      await fetchBeneficiaries();
      setSelectedBeneficiary(null);
      setAllocationAmount(0);
    } catch (err) {
      console.error('Allocation error:', err);
      alert('Failed to allocate funds');
    } finally {
      setAllocating(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Approved Beneficiaries</h3>
          <p className="text-sm text-gray-500 mt-1">
            Allocate additional funds to approved beneficiaries
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading beneficiaries...</div>
        ) : beneficiaries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No approved beneficiaries found
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {beneficiaries.map(beneficiary => (
              <div key={beneficiary.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-800">{beneficiary.name}</h4>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{beneficiary.campaignTitle}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatAddress(beneficiary.walletAddress, 4)}</span>
                      <span>•</span>
                      <span>Balance: ${beneficiary.currentBalance}</span>
                      <span>•</span>
                      <span>Allocated: ${beneficiary.totalAllocated}</span>
                      <span>•</span>
                      <span>Spent: ${beneficiary.totalSpent}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBeneficiary(beneficiary);
                      setAllocationAmount(50);
                    }}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Allocate Funds
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Allocation Modal */}
      {selectedBeneficiary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Allocate Funds</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Beneficiary</label>
                <p className="text-gray-800 mt-1">{selectedBeneficiary.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Current Balance</label>
                <p className="text-2xl font-bold text-gray-800">${selectedBeneficiary.currentBalance}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allocation Amount (USDC) *
                </label>
                <input
                  type="number"
                  value={allocationAmount}
                  onChange={(e) => setAllocationAmount(parseFloat(e.target.value))}
                  min="1"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  New balance: ${selectedBeneficiary.currentBalance + allocationAmount}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setSelectedBeneficiary(null)}
                disabled={allocating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocate}
                disabled={allocating || allocationAmount <= 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {allocating ? 'Allocating...' : 'Confirm Allocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
