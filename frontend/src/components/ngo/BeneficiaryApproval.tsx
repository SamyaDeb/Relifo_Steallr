'use client';

import { useState } from 'react';
import CategoryConfig from './CategoryConfig';

interface Application {
  id: string;
  campaignId: string;
  campaignControlMode: 'direct' | 'controlled';
  applicantName: string;
  applicantWallet: string;
}

interface BeneficiaryApprovalProps {
  application: Application;
  onApproved: () => void;
  onRejected: () => void;
}

interface CategoryLimits {
  food: number;
  medical: number;
  education: number;
  shelter: number;
  other: number;
}

export default function BeneficiaryApproval({ application, onApproved, onRejected }: BeneficiaryApprovalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [allocationAmount, setAllocationAmount] = useState(100);
  const [categoryLimits, setCategoryLimits] = useState<CategoryLimits>({
    food: 50,
    medical: 30,
    education: 10,
    shelter: 10,
    other: 0,
  });
  const [processing, setProcessing] = useState(false);

  const handleApprove = async () => {
    if (allocationAmount <= 0) {
      alert('Please enter a valid allocation amount');
      return;
    }

    if (application.campaignControlMode === 'controlled') {
      const totalLimits = Object.values(categoryLimits).reduce((sum, val) => sum + val, 0);
      if (totalLimits !== 100) {
        alert('Category limits must sum to 100%');
        return;
      }
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/ngo/applications/${application.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationAmount,
          categoryLimits: application.campaignControlMode === 'controlled' ? categoryLimits : undefined,
        }),
      });

      if (!response.ok) throw new Error('Approval failed');
      
      onApproved();
    } catch (err) {
      console.error('Approval error:', err);
      alert('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      
      const response = await fetch(`/api/ngo/applications/${application.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) throw new Error('Rejection failed');
      
      onRejected();
    } catch (err) {
      console.error('Rejection error:', err);
      alert('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  if (action === 'approve') {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">Approve Application</h4>
          <p className="text-sm text-green-700">
            Set the initial allocation amount for {application.applicantName}.
          </p>
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
            Amount will be transferred to beneficiary&apos;s wallet from campaign funds
          </p>
        </div>

        {application.campaignControlMode === 'controlled' && (
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Set Category Spending Limits</h4>
            <p className="text-sm text-gray-600 mb-4">
              Define percentage limits for each spending category. Must total 100%.
            </p>
            <CategoryConfig
              limits={categoryLimits}
              onChange={setCategoryLimits}
            />
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setAction(null)}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {processing ? 'Approving...' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    );
  }

  if (action === 'reject') {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Reject Application</h4>
          <p className="text-sm text-red-700">
            Provide a reason for rejecting {application.applicantName}&apos;s application.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason *
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this application is being rejected..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setAction(null)}
            disabled={processing}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={processing}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {processing ? 'Rejecting...' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-4">Review Application</h4>
      <div className="flex space-x-3">
        <button
          onClick={() => setAction('reject')}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Reject
        </button>
        <button
          onClick={() => setAction('approve')}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Approve
        </button>
      </div>
    </div>
  );
}
