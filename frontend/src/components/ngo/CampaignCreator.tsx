'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import ControlModeSelector from './ControlModeSelector';

interface CampaignFormData {
  title: string;
  description: string;
  targetAmount: number;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  controlMode: 'direct' | 'controlled';
  eligibilityCriteria: string;
}

export default function CampaignCreator() {
  const { publicKey } = useWallet();
  const [formData, setFormData] = useState<CampaignFormData>({
    title: '',
    description: '',
    targetAmount: 10000,
    category: 'disaster',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    controlMode: 'direct',
    eligibilityCriteria: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ngoWallet: publicKey,
        }),
      });

      if (!response.ok) throw new Error('Failed to create campaign');
      
      setSuccess(true);
    } catch (err) {
      console.error('Campaign creation error:', err);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Campaign Created!</h3>
        <p className="text-gray-600 mb-6">Your campaign is now live and accepting donations.</p>
        <div className="flex justify-center space-x-3">
          <button onClick={() => setSuccess(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
            Create Another
          </button>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Campaigns
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Create New Campaign</h3>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="e.g., Emergency Flood Relief in Bangladesh"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe your campaign, goals, and how funds will be used..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (USDC) *</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value))}
              min="100"
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
              <option value="disaster">🌊 Disaster Relief</option>
              <option value="hunger">🍚 Food & Hunger</option>
              <option value="medical">🏥 Medical Aid</option>
              <option value="education">📚 Education</option>
              <option value="shelter">🏠 Shelter</option>
              <option value="other">🤝 Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Dhaka, Bangladesh"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              min={formData.startDate}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary Control Mode *</label>
          <ControlModeSelector
            selected={formData.controlMode}
            onChange={(mode) => handleInputChange('controlMode', mode)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eligibility Criteria *</label>
          <textarea
            value={formData.eligibilityCriteria}
            onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
            placeholder="Describe who is eligible to apply for this campaign..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.title || !formData.description}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? 'Creating Campaign...' : 'Create Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
