'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface DonationFormProps {
  campaignId: string;
  campaignTitle: string;
  ngoWallet: string;
  minAmount?: number;
  maxAmount?: number;
  onSuccess?: (txHash: string) => void;
  onClose?: () => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function DonationForm({
  campaignId,
  campaignTitle,
  ngoWallet,
  minAmount = 1,
  maxAmount = 10000,
  onSuccess,
  onClose,
}: DonationFormProps) {
  const { isConnected, publicKey, usdcBalance, hasUSDCTrustline, connect } = useWallet();
  
  const [amount, setAmount] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const [txHash, setTxHash] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const balance = parseFloat(usdcBalance) || 0;
  const isValidAmount = numericAmount >= minAmount && numericAmount <= maxAmount && numericAmount <= balance;

  const handlePresetAmount = (preset: number) => {
    if (preset <= balance) {
      setAmount(preset.toString());
    }
  };

  const handleSubmit = async () => {
    if (!isValidAmount || !isConnected) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create donation record in backend
      const donationResponse = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          amount: numericAmount,
          donorWallet: isAnonymous ? 'anonymous' : publicKey,
          message: message || undefined,
          isAnonymous,
        }),
      });

      if (!donationResponse.ok) {
        throw new Error('Failed to create donation record');
      }

      const { donationId } = await donationResponse.json();

      // Step 2: Execute Stellar payment (simulated for now)
      // In production, this would use the Soroban contract
      const simulatedTxHash = `TX_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Step 3: Update donation with transaction hash
      await fetch(`/api/donations/${donationId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: simulatedTxHash,
          status: 'completed',
        }),
      });

      setTxHash(simulatedTxHash);
      setStep('success');
      onSuccess?.(simulatedTxHash);
    } catch (err) {
      console.error('Donation error:', err);
      setError(err instanceof Error ? err.message : 'Donation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect to Donate</h3>
          <p className="text-gray-500 mb-4">Connect your wallet to make a donation.</p>
          <button
            onClick={connect}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!hasUSDCTrustline) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">USDC Trustline Required</h3>
          <p className="text-gray-500 mb-4">You need to add a USDC trustline before donating.</p>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Go to Dashboard →
          </a>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-4">
            Your donation of <strong>${numericAmount} USDC</strong> has been sent.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <code className="text-sm text-gray-700 break-all">{txHash}</code>
          </div>
          <div className="flex justify-center space-x-4">
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              View on Explorer
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Donation</h3>
        
        <div className="space-y-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Campaign</p>
            <p className="font-medium text-gray-800">{campaignTitle}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className="text-2xl font-bold text-gray-800">${numericAmount} USDC</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Recipient</p>
            <code className="text-xs text-gray-700">{ngoWallet}</code>
          </div>
          
          {isAnonymous && (
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Donating anonymously
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('form')}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              'Confirm & Send'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Make a Donation</h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Balance Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Your Balance</span>
          <span className="font-medium text-gray-800">{balance.toFixed(2)} USDC</span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Donation Amount (USDC)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min={minAmount}
            max={Math.min(maxAmount, balance)}
            step="0.01"
            className="w-full pl-8 pr-16 py-3 text-2xl font-semibold border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USDC</span>
        </div>
        
        {/* Preset Amounts */}
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              onClick={() => handlePresetAmount(preset)}
              disabled={preset > balance}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                numericAmount === preset
                  ? 'bg-blue-600 text-white'
                  : preset > balance
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ${preset}
            </button>
          ))}
          <button
            onClick={() => setAmount(balance.toString())}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Max
          </button>
        </div>

        {/* Validation Messages */}
        {numericAmount > 0 && numericAmount < minAmount && (
          <p className="text-sm text-red-500 mt-2">Minimum donation is ${minAmount}</p>
        )}
        {numericAmount > balance && (
          <p className="text-sm text-red-500 mt-2">Insufficient balance</p>
        )}
        {numericAmount > maxAmount && (
          <p className="text-sm text-red-500 mt-2">Maximum donation is ${maxAmount}</p>
        )}
      </div>

      {/* Optional Message */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Leave a Message (Optional)
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share why you're supporting this cause..."
          maxLength={200}
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">{message.length}/200</p>
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between py-4 border-y border-gray-100 mb-6">
        <div>
          <p className="font-medium text-gray-800">Donate Anonymously</p>
          <p className="text-sm text-gray-500">Your wallet address won&apos;t be shown publicly</p>
        </div>
        <button
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            isAnonymous ? 'left-7' : 'left-1'
          }`} />
        </button>
      </div>

      {/* Submit Button */}
      <button
        onClick={() => setStep('confirm')}
        disabled={!isValidAmount}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Continue to Review
      </button>
    </div>
  );
}
