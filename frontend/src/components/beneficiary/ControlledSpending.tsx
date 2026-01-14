'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import QRCodeScanner from './QRCodeScanner';

interface SpendingRequest {
  id: string;
  merchant: {
    name: string;
    category: string;
  };
  amount: number;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
}

interface CategoryLimit {
  limit: number;
  spent: number;
}

export default function ControlledSpending() {
  const { isConnected, publicKey } = useWallet();
  const [step, setStep] = useState<'select' | 'form' | 'submit' | 'success'>('select');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [requests, setRequests] = useState<SpendingRequest[]>([]);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, CategoryLimit>>({});

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchData();
    }
  }, [isConnected, publicKey]);

  const fetchData = async () => {
    try {
      // Fetch category limits
      const limitsResponse = await fetch(`/api/beneficiary/category-limits?address=${publicKey}`);
      const limitsData = await limitsResponse.json();
      setCategoryLimits(limitsData.limits || {
        food: { limit: 50, spent: 15 },
        medical: { limit: 30, spent: 0 },
        education: { limit: 20, spent: 10 },
        shelter: { limit: 0, spent: 0 },
        other: { limit: 0, spent: 0 },
      });

      // Fetch pending requests
      const requestsResponse = await fetch(`/api/beneficiary/spending-requests?address=${publicKey}`);
      const requestsData = await requestsResponse.json();
      setRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleScan = (merchantData: Merchant) => {
    setSelectedMerchant(merchantData);
    setShowScanner(false);
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!amount || !category || !description || !selectedMerchant) return;

    try {
      setProcessing(true);

      const response = await fetch('/api/beneficiary/request-spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryAddress: publicKey,
          merchantId: selectedMerchant.id,
          amount: parseFloat(amount),
          category,
          description,
        }),
      });

      if (!response.ok) throw new Error('Request failed');

      setStep('success');
      fetchData();
    } catch (err) {
      console.error('Request error:', err);
      alert('Request failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to access controlled spending</p>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Request Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Your spending request for ${amount} has been sent to the NGO for approval.
          </p>
          
          <button
            onClick={() => {
              setStep('select');
              setAmount('');
              setCategory('');
              setDescription('');
              setSelectedMerchant(null);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-3"
          >
            Make Another Request
          </button>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Controlled Spending</h2>
        <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
          🔒 Approval Required
        </div>
      </div>

      {/* Category Limits */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Spending Limits by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryLimits).map(([cat, data]) => {
            const available = data.limit - data.spent;
            const percentage = (data.spent / data.limit) * 100;
            
            return (
              <div key={cat} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-800 capitalize">{cat}</span>
                  <span className="text-gray-600">${available.toFixed(2)} available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  ${data.spent} of ${data.limit} used
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Request Form */}
      {(step === 'select' || step === 'form') && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">New Spending Request</h3>

          {step === 'select' ? (
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <span className="text-4xl block mb-2">📷</span>
              <p className="font-medium text-gray-700">Scan Merchant QR Code</p>
              <p className="text-sm text-gray-500 mt-1">to start a spending request</p>
            </button>
          ) : (
            <div className="space-y-6">
              {/* Selected Merchant */}
              {selectedMerchant && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-700 mb-1">Merchant</p>
                  <p className="font-semibold text-gray-800">{selectedMerchant.name}</p>
                  <p className="text-sm text-gray-600">{selectedMerchant.category}</p>
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-700">Category</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {Object.entries(categoryLimits).map(([cat, data]) => {
                    const available = data.limit - data.spent;
                    return (
                      <option key={cat} value={cat} disabled={available <= 0}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)} (${available.toFixed(2)} available)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-700">Amount (USDC)</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  step="0.01"
                  min="0"
                  max={category ? categoryLimits[category]?.limit - categoryLimits[category]?.spent : undefined}
                />
                {amount && category && parseFloat(amount) > (categoryLimits[category]?.limit - categoryLimits[category]?.spent) && (
                  <p className="text-sm text-red-600 mt-1">Exceeds category limit</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-700">Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you purchase?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedMerchant(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!amount || !category || !description || processing}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300"
                >
                  {processing ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Requests</h3>
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-800">{req.merchant.name}</p>
                    <p className="text-sm text-gray-600">{req.category} - ${req.amount}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{req.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted {new Date(req.submittedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Scan Merchant QR</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <QRCodeScanner onScan={handleScan} />
          </div>
        </div>
      )}
    </div>
  );
}
