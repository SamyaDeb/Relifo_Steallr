'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Campaign {
  _id?: string;
  id: string;
  title: string;
  description: string;
  ngoName: string;
  ngoId: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  startDate: string;
  endDate: string;
  category: 'disaster' | 'hunger' | 'medical' | 'education' | 'shelter' | 'other';
  status: 'active' | 'completed' | 'paused';
  imageUrl?: string;
  location: string;
  isVerified: boolean;
}

interface CampaignListProps {
  filter?: 'all' | 'active' | 'completed';
  category?: string;
  limit?: number;
  showFilters?: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories', icon: '🌍' },
  { value: 'disaster', label: 'Disaster Relief', icon: '🌊' },
  { value: 'hunger', label: 'Food & Hunger', icon: '🍚' },
  { value: 'medical', label: 'Medical Aid', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'shelter', label: 'Shelter', icon: '🏠' },
  { value: 'other', label: 'Other', icon: '🤝' },
];

export default function CampaignList({ 
  filter = 'all', 
  category = 'all',
  limit,
  showFilters = true 
}: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedStatus, setSelectedStatus] = useState(filter);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, [selectedCategory, selectedStatus]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      
      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.ngoName.toLowerCase().includes(query) ||
        campaign.location.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const displayCampaigns = limit ? filteredCampaigns.slice(0, limit) : filteredCampaigns;

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  const getCategoryInfo = (cat: string) => {
    return CATEGORIES.find(c => c.value === cat) || CATEGORIES[6];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-48 h-32 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'active' | 'completed')}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">{error}</p>
        </div>
      )}

      {/* Campaign Grid */}
      {displayCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Campaigns Found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayCampaigns.map(campaign => {
            const progress = getProgressPercentage(campaign.raisedAmount, campaign.targetAmount);
            const categoryInfo = getCategoryInfo(campaign.category);
            
            return (
              <div 
                key={campaign._id || campaign.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-30">{categoryInfo.icon}</span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {campaign.status === 'active' ? '● Active' : 'Completed'}
                    </span>
                  </div>
                  {campaign.isVerified && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center">
                        ✓ Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{categoryInfo.icon}</span>
                    <span className="ml-1">{categoryInfo.label}</span>
                    <span className="mx-2">•</span>
                    <span>📍 {campaign.location}</span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    by {campaign.ngoName}
                  </p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">
                        ${campaign.raisedAmount.toLocaleString()}
                      </span>
                      <span className="text-gray-500">
                        of ${campaign.targetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.round(progress)}% funded</span>
                      <span>{campaign.donorCount} donors</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Link 
                    href={`/campaigns/${campaign.id}`}
                    className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {campaign.status === 'active' ? 'Donate Now' : 'View Details'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All Link */}
      {limit && filteredCampaigns.length > limit && (
        <div className="text-center mt-6">
          <Link 
            href="/browse"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Campaigns
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
