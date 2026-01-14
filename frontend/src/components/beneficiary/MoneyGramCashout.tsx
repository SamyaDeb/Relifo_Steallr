'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface CashoutRequest {
  amount: number;
  receiverName: string;
  receiverPhone: string;
  country: string;
}

export default function MoneyGramCashout() {
  const { isConnected, publicKey, usdcBalance } = useWallet();
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [request, setRequest] = useState<CashoutRequest>({
    amount: 0,
    receiverName: '',
    receiverPhone: '',
    country: '',
  });
  const [referenceNumber, setReferenceNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  const countries = [
    'India', 'Philippines', 'Mexico', 'Nigeria', 'Pakistan',
    'Bangladesh', 'Vietnam', 'Kenya', 'Indonesia', 'Ghana'
  ];

  const handleSubmit = async () => {
    try {
      setProcessing(true);

      // In production: Call MoneyGram API via backend
      const response = await fetch('/api/beneficiary/moneygram-cashout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiaryAddress: publicKey,
          ...request,
        }),
      });

      if (!response.ok) throw new Error('Cashout failed');

      const data = await response.json();
      setReferenceNumber(data.referenceNumber);
      setStep('success');
    } catch (err) {
      console.error('Cashout error:', err);
      alert('Cashout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to cash out</p>
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
          <h3 className="text-xl font-bold text-gray-800 mb-2">Cashout Initiated!</h3>
          <p className="text-gray-600 mb-6">
            Your request has been processed. The receiver can pick up cash at any MoneyGram location.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-sm font-medium text-yellow-800 mb-3">Reference Number</p>
            <p className="text-3xl font-bold text-yellow-900 tracking-wider">{referenceNumber}</p>
            <p className="text-sm text-yellow-700 mt-3">
              Share this reference number with the receiver to collect cash.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-semibold text-gray-800 mb-3">Collection Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-800">${request.amount} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Receiver:</span>
                <span className="font-medium text-gray-800">{request.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-800">{request.receiverPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-medium text-gray-800">{request.country}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong><br />
              1. Share the reference number with the receiver<br />
              2. Receiver visits any MoneyGram location<br />
              3. Provides reference number and valid ID<br />
              4. Receives cash instantly
            </p>
          </div>

          <button
            onClick={() => {
              setStep('form');
              setRequest({ amount: 0, receiverName: '', receiverPhone: '', country: '' });
              setReferenceNumber('');
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Make Another Cashout
          </button>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Cashout</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Review Details</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-gray-800">${request.amount} USD</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Receiver Name</span>
              <span className="font-semibold text-gray-800">{request.receiverName}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Phone Number</span>
              <span className="font-semibold text-gray-800">{request.receiverPhone}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Country</span>
              <span className="font-semibold text-gray-800">{request.country}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">MoneyGram Fee</span>
              <span className="font-semibold text-gray-800">$2.00 USD</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-gray-800">Total Deduction</span>
              <span className="font-bold text-gray-900">${(request.amount + 2).toFixed(2)} USDC</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('form')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            {processing ? 'Processing...' : 'Confirm Cashout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">MoneyGram Cashout</h2>
      <p className="text-gray-600 mb-6">
        Send cash to anyone, anywhere. Receiver can pick up at 350,000+ locations worldwide.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Available Balance:</strong> ${usdcBalance} USDC
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-6">
        <div>
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">Amount to Send (USD)</span>
          </label>
          <input
            type="number"
            value={request.amount || ''}
            onChange={(e) => setRequest({ ...request, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="1"
            max={parseFloat(usdcBalance) - 2}
          />
          {request.amount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Fee: $2.00 | Total: ${(request.amount + 2).toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">Receiver Full Name</span>
          </label>
          <input
            type="text"
            value={request.receiverName}
            onChange={(e) => setRequest({ ...request, receiverName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">Receiver Phone Number</span>
          </label>
          <input
            type="tel"
            value={request.receiverPhone}
            onChange={(e) => setRequest({ ...request, receiverPhone: e.target.value })}
            placeholder="+1234567890"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block mb-2">
            <span className="text-sm font-medium text-gray-700">Receiver Country</span>
          </label>
          <select
            value={request.country}
            onChange={(e) => setRequest({ ...request, country: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => setStep('confirm')}
        disabled={!request.amount || !request.receiverName || !request.receiverPhone || !request.country || request.amount + 2 > parseFloat(usdcBalance)}
        className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Continue
      </button>

      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          💡 <strong>Tip:</strong> MoneyGram has 350,000+ locations in 200+ countries. 
          Cash is typically available within minutes for pickup.
        </p>
      </div>
    </div>
  );
}
