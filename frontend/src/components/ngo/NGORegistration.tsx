'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface NGOFormData {
  name: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  registrationNumber: string;
  country: string;
  address: string;
  category: string;
}

export default function NGORegistration() {
  const { isConnected, publicKey, connect } = useWallet();
  const [formData, setFormData] = useState<NGOFormData>({
    name: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    registrationNumber: '',
    country: '',
    address: '',
    category: 'disaster',
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'documents' | 'success'>('form');

  const handleInputChange = (field: keyof NGOFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Upload documents
      const formDataObj = new FormData();
      documents.forEach(doc => formDataObj.append('documents', doc));
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });
      const { fileUrls } = await uploadRes.json();

      // Submit NGO registration
      const response = await fetch('/api/ngo/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          walletAddress: publicKey,
          documents: fileUrls,
        }),
      });

      if (!response.ok) throw new Error('Registration failed');
      
      setStep('success');
    } catch (err) {
      console.error('Registration error:', err);
      alert('Failed to register NGO. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Connect Wallet to Register</h3>
        <p className="text-gray-500 mb-6">Connect your Freighter wallet to register your NGO.</p>
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
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Registration Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Your NGO registration has been submitted for review. You&apos;ll be notified once it&apos;s verified.
        </p>
        <a href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go to Dashboard
        </a>
      </div>
    );
  }

  if (step === 'documents') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Upload Verification Documents</h3>
        
        <div className="mb-6">
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600">Click to upload documents</p>
            <p className="text-sm text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
            <input type="file" className="hidden" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
          </label>
        </div>

        {documents.length > 0 && (
          <div className="mb-6 space-y-2">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{doc.name}</span>
                <button onClick={() => removeDocument(idx)} className="text-red-600 hover:text-red-700">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex space-x-3">
          <button onClick={() => setStep('form')} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || documents.length === 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Register Your NGO</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number *</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="disaster">Disaster Relief</option>
            <option value="hunger">Food & Hunger</option>
            <option value="medical">Medical Aid</option>
            <option value="education">Education</option>
            <option value="shelter">Shelter</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Connected Wallet:</strong> {publicKey}
          </p>
        </div>

        <button
          onClick={() => setStep('documents')}
          disabled={!formData.name || !formData.email || !formData.description}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Continue to Documents
        </button>
      </div>
    </div>
  );
}
