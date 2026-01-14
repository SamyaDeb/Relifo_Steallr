'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  id: string;
  title: string;
  description: string;
  ngoName: string;
  targetAmount: number;
  raisedAmount: number;
  category: string;
  location: string;
  endDate: string;
  controlMode: 'direct' | 'controlled';
  eligibilityCriteria: string;
  isAcceptingApplications: boolean;
}

export default function CampaignBrowser() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/campaigns?status=active&accepting=true`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setCampaigns([
        {
          id: '1',
          title: 'Emergency Flood Relief in Bangladesh',
          description: 'Providing immediate assistance to families affected by devastating floods.',
          ngoName: 'Relief International',
          targetAmount: 50000,
          raisedAmount: 32500,
          category: 'disaster',
          location: 'Bangladesh',
          endDate: '2024-03-15',
          controlMode: 'direct',
          eligibilityCriteria: 'Families affected by floods with income below $200/month',
          isAcceptingApplications: true,
        },
        {
          id: '2',
          title: 'Food Security Program - East Africa',
          description: 'Supporting families facing food insecurity.',
          ngoName: 'World Food Aid',
          targetAmount: 75000,
          raisedAmount: 45000,
          category: 'hunger',
          location: 'Kenya',
          endDate: '2024-06-01',
          controlMode: 'controlled',
          eligibilityCriteria: 'Families with children under 12 facing food insecurity',
          isAcceptingApplications: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-8">
        <h2 className="text-3xl font-bold mb-2">Find Relief Programs</h2>
        <p className="text-blue-100">Browse active campaigns and apply for assistance</p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Active Campaigns</h3>
          <p className="text-gray-500">Check back later for new relief programs.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(campaign => (
            <div key={campaign.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 relative flex items-center justify-center">
                <span className="text-6xl opacity-30">🌍</span>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    campaign.controlMode === 'direct' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {campaign.controlMode === 'direct' ? '🔓 Direct' : '🔒 Controlled'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">by {campaign.ngoName}</p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {campaign.description}
                </p>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Eligibility</p>
                  <p className="text-sm text-gray-700">{campaign.eligibilityCriteria}</p>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>📍 {campaign.location}</span>
                  <span className="mx-2">•</span>
                  <span>Ends {new Date(campaign.endDate).toLocaleDateString()}</span>
                </div>

                <Link
                  href={`/apply/${campaign.id}`}
                  className="block w-full text-center py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
