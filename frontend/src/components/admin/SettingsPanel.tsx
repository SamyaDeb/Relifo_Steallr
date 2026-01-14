'use client';

import { useState, useEffect } from 'react';

interface Settings {
  platformFeeRate: number;
  minDonationAmount: number;
  maxDonationAmount: number;
  platformName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewNGOs: boolean;
  allowNewMerchants: boolean;
  requireDocumentVerification: boolean;
  autoApproveMerchants: boolean;
  maxCampaignsPerNGO: number;
}

export default function SettingsPanel() {
  const [settings, setSettings] = useState<Settings>({
    platformFeeRate: 0.5,
    minDonationAmount: 1,
    maxDonationAmount: 10000,
    platformName: 'Relifo',
    supportEmail: 'support@relifo.org',
    maintenanceMode: false,
    allowNewNGOs: true,
    allowNewMerchants: true,
    requireDocumentVerification: true,
    autoApproveMerchants: false,
    maxCampaignsPerNGO: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/settings`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Message */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => updateSetting('platformName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => updateSetting('supportEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Maintenance Mode</p>
              <p className="text-sm text-gray-500">Disable platform access for users</p>
            </div>
            <button
              onClick={() => updateSetting('maintenanceMode', !settings.maintenanceMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.maintenanceMode ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Fee Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={settings.platformFeeRate}
              onChange={(e) => updateSetting('platformFeeRate', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Fee charged on each donation</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Donation (USDC)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={settings.minDonationAmount}
                onChange={(e) => updateSetting('minDonationAmount', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Donation (USDC)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.maxDonationAmount}
                onChange={(e) => updateSetting('maxDonationAmount', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* NGO Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">NGO Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Allow New NGO Registrations</p>
              <p className="text-sm text-gray-500">Enable self-registration for NGOs</p>
            </div>
            <button
              onClick={() => updateSetting('allowNewNGOs', !settings.allowNewNGOs)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.allowNewNGOs ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.allowNewNGOs ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Require Document Verification</p>
              <p className="text-sm text-gray-500">NGOs must upload verification documents</p>
            </div>
            <button
              onClick={() => updateSetting('requireDocumentVerification', !settings.requireDocumentVerification)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.requireDocumentVerification ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.requireDocumentVerification ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Campaigns per NGO
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxCampaignsPerNGO}
              onChange={(e) => updateSetting('maxCampaignsPerNGO', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Merchant Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Merchant Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-800">Allow New Merchant Registrations</p>
              <p className="text-sm text-gray-500">Enable self-registration for merchants</p>
            </div>
            <button
              onClick={() => updateSetting('allowNewMerchants', !settings.allowNewMerchants)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.allowNewMerchants ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.allowNewMerchants ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <p className="font-medium text-gray-800">Auto-Approve Merchants</p>
              <p className="text-sm text-gray-500">Automatically approve merchant applications</p>
            </div>
            <button
              onClick={() => updateSetting('autoApproveMerchants', !settings.autoApproveMerchants)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoApproveMerchants ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                settings.autoApproveMerchants ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
