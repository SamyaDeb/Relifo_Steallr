'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Merchant {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  address: string;
  verified: boolean;
}

const CATEGORIES = ['Food', 'Shelter', 'Clothes', 'Medical', 'Education', 'Other'];

export default function DirectSpending() {
  const { isConnected, publicKey, usdcBalance } = useWallet();
  const [step, setStep] = useState<'category' | 'merchant' | 'amount' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [availableMerchants, setAvailableMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // Fetch merchants when category is selected
  useEffect(() => {
    if (selectedCategory && selectedCategory !== '') {
      fetchMerchantsByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchMerchantsByCategory = async (category: string) => {
    try {
      setLoadingMerchants(true);
      const response = await fetch(`/api/merchants/category/${category}?verified=true`);
      if (!response.ok) throw new Error('Failed to fetch merchants');
      
      const data = await response.json();
      setAvailableMerchants(data.merchants || []);
    } catch (err) {
      console.error('Error fetching merchants:', err);
      setAvailableMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep('merchant');
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setStep('amount');
  };

  const handlePayment = async () => {
    if (!amount || !selectedMerchant) return;

    try {
      setProcessing(true);

      // In production: Call Stellar transaction
      const response = await fetch('/api/beneficiary/spend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryAddress: publicKey,
          merchantId: selectedMerchant.id,
          amount: parseFloat(amount),
          category: selectedCategory,
        }),
      });

      if (!response.ok) throw new Error('Payment failed');

      const data = await response.json();
      setTxHash(data.txHash);
      setStep('success');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setStep('category');
    setSelectedCategory('');
    setSelectedMerchant(null);
    setAmount('');
    setTxHash('');
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to make purchases</p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your payment of ${amount} USDC to {selectedMerchant?.name} has been processed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
            <code className="text-xs text-gray-800 break-all">{txHash}</code>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Category:</strong> {selectedCategory}<br />
              <strong>Merchant:</strong> {selectedMerchant?.name}<br />
              <strong>Amount Spent:</strong> ${amount} USDC
            </p>
          </div>

          <button
            onClick={handleReset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Make Another Purchase
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Direct Spending</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-3xl font-bold text-gray-800">${usdcBalance} USDC</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔓</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600">
          You&apos;re in Direct Mode. Select a category, choose a merchant, and spend funds freely without approval.
        </p>
      </div>

      {/* Step 1: Category Selection */}
      {step === 'category' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Step 1: Select Category</h3>
          <p className="text-sm text-gray-600 mb-4">What would you like to purchase?</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center font-medium text-gray-700 hover:text-blue-600"
              >
                <div className="text-2xl mb-2">
                  {category === 'Food' && '🍎'}
                  {category === 'Shelter' && '🏠'}
                  {category === 'Clothes' && '👕'}
                  {category === 'Medical' && '🏥'}
                  {category === 'Education' && '📚'}
                  {category === 'Other' && '📦'}
                </div>
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Merchant Selection */}
      {step === 'merchant' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Step 2: Select Merchant</h3>
            <button
              onClick={() => {
                setStep('category');
                setSelectedCategory('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Change Category
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Available merchants for <strong>{selectedCategory}</strong>:
          </p>

          {loadingMerchants ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-500 mt-2">Loading merchants...</p>
            </div>
          ) : availableMerchants.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No merchants available in this category.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableMerchants.map(merchant => (
                <button
                  key={merchant._id || merchant.id}
                  onClick={() => handleMerchantSelect(merchant)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{merchant.name}</p>
                      <p className="text-sm text-gray-500">{merchant.address}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {merchant.verified && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          ✓ Verified
                        </span>
                      )}
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Amount & Confirmation */}
      {step === 'amount' && selectedMerchant && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Step 3: Enter Amount</h3>
            <button
              onClick={() => {
                setStep('merchant');
                setSelectedMerchant(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← Change Merchant
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700 mb-1">Category</p>
                <p className="font-semibold text-blue-900">{selectedCategory}</p>
              </div>
              <div>
                <p className="text-sm text-blue-700 mb-1">Merchant</p>
                <p className="font-semibold text-blue-900">{selectedMerchant.name}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block mb-2">
              <span className="text-sm font-medium text-gray-700">Amount to Spend (USDC)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-16"
                step="0.01"
                min="0"
                max={usdcBalance}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                USDC
              </span>
            </div>

            {amount && parseFloat(amount) > parseFloat(usdcBalance) && (
              <p className="text-sm text-red-600 mt-2">Insufficient balance</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium text-gray-800">${amount || '0'}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-gray-800">Total</span>
              <span className="font-bold text-gray-900">${amount || '0'}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setStep('merchant')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handlePayment}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(usdcBalance) || processing}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
            >
              {processing ? 'Processing...' : `Pay $${amount || '0'} USDC`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
