'use client';

import CampaignList from '@/components/donor/CampaignList';

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Relief Campaigns</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse active disaster relief campaigns and make a difference
          </p>
        </div>

        {/* Campaigns List */}
        <CampaignList />
      </div>
    </div>
  );
}
