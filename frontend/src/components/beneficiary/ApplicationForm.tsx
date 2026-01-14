'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import DocumentUpload from './DocumentUpload';

interface ApplicationFormData {
  campaignId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  householdSize: number;
  monthlyIncome: number;
  occupation: string;
  reason: string;
}

interface ApplicationFormProps {
  campaignId: string;
  campaignTitle: string;
  onSuccess?: () => void;
}

export default function ApplicationForm({ campaignId, campaignTitle, onSuccess }: ApplicationFormProps) {
  const { isConnected, publicKey, connect } = useWallet();
  const [step, setStep] = useState<'form' | 'documents' | 'success'>('form');
  const [formData, setFormData] = useState<ApplicationFormData>({
    campaignId,
    fullName: '',
    email: '',
    phone: '',
    address: '',
    householdSize: 1,
    monthlyIncome: 0,
    occupation: '',
    reason: '',
  });
  const [documents, setDocuments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof ApplicationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/beneficiary/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress: publicKey,
          documents,
        }),
      });

      if (!response.ok) throw new Error('Application submission failed');
      
      setStep('success');
      onSuccess?.();
    } catch (err) {
      console.error('Application error:', err);
      alert('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect Wallet to Apply</h3>
        <p className="text-gray-500 mb-6">You need to connect your Freighter wallet to submit an application.</p>
        <button onClick={connect} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Connect Wallet
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Application Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Your application has been submitted for review. You&apos;ll be notified once it&apos;s reviewed by the NGO.
        </p>
        <a href="/status" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Check Application Status
        </a>
      </div>
    );
  }

  if (step === 'documents') {
    return (
      <div className="max-w-2xl mx-auto">
        <DocumentUpload
          onComplete={(urls) => {
            setDocuments(urls);
            handleSubmit();
          }}
          onBack={() => setStep('form')}
          isSubmitting={submitting}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Apply for Assistance</h3>
        <p className="text-gray-600 mt-1">{campaignTitle}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Household Size *</label>
            <input
              type="number"
              value={formData.householdSize}
              onChange={(e) => handleInputChange('householdSize', parseInt(e.target.value))}
              min="1"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income (USD) *</label>
            <input
              type="number"
              value={formData.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value))}
              min="0"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Why do you need assistance? *
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Please explain your situation and why you need this assistance..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Wallet Address:</strong> {publicKey}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            If approved, funds will be sent to this wallet address.
          </p>
        </div>

        <button
          onClick={() => setStep('documents')}
          disabled={!formData.fullName || !formData.email || !formData.reason}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );
}
