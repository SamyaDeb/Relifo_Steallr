'use client';

import { useState, useEffect } from 'react';

interface Transaction {
  hash: string;
  type: 'donation' | 'allocation' | 'spending' | 'cashout';
  from: string;
  to: string;
  amount: number;
  timestamp: string;
  campaignId?: string;
  campaignTitle?: string;
  ngoName?: string;
  category?: string;
  memo?: string;
}

export default function AuditExplorer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'donation' | 'allocation' | 'spending' | 'cashout'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions
    .filter(tx => {
      // Type filter
      if (filter !== 'all' && tx.type !== filter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.hash.toLowerCase().includes(query) ||
          tx.from.toLowerCase().includes(query) ||
          tx.to.toLowerCase().includes(query) ||
          tx.campaignTitle?.toLowerCase().includes(query) ||
          tx.ngoName?.toLowerCase().includes(query) ||
          tx.memo?.toLowerCase().includes(query)
        );
      }
      
      // Date filter
      if (dateRange !== 'all') {
        const txDate = new Date(tx.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - txDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        
        if (dateRange === 'today' && diffDays > 1) return false;
        if (dateRange === 'week' && diffDays > 7) return false;
        if (dateRange === 'month' && diffDays > 30) return false;
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getTypeConfig = (type: Transaction['type']) => {
    const configs = {
      donation: {
        icon: '💝',
        label: 'Donation',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
      },
      allocation: {
        icon: '📤',
        label: 'Allocation',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
      },
      spending: {
        icon: '🛒',
        label: 'Spending',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
      },
      cashout: {
        icon: '💵',
        label: 'Cashout',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
      },
    };
    return configs[type];
  };

  const stats = {
    total: transactions.length,
    donations: transactions.filter(t => t.type === 'donation').length,
    allocations: transactions.filter(t => t.type === 'allocation').length,
    spending: transactions.filter(t => t.type === 'spending').length,
    cashouts: transactions.filter(t => t.type === 'cashout').length,
    totalVolume: transactions.reduce((sum, t) => sum + t.amount, 0),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Audit Explorer</h2>
          <p className="text-gray-600">Public blockchain transaction viewer</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 mb-1">Donations</p>
          <p className="text-2xl font-bold text-blue-600">{stats.donations}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 mb-1">Allocations</p>
          <p className="text-2xl font-bold text-green-600">{stats.allocations}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700 mb-1">Spending</p>
          <p className="text-2xl font-bold text-purple-600">{stats.spending}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-sm text-orange-700 mb-1">Cashouts</p>
          <p className="text-2xl font-bold text-orange-600">{stats.cashouts}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Volume</p>
          <p className="text-xl font-bold text-gray-800">${stats.totalVolume}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-75">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hash, address, campaign, or memo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="donation">Donations</option>
              <option value="allocation">Allocations</option>
              <option value="spending">Spending</option>
              <option value="cashout">Cashouts</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Transactions Found</h3>
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(tx => {
            const typeConfig = getTypeConfig(tx.type);
            
            return (
              <div
                key={tx.hash}
                className={`bg-white border-l-4 ${typeConfig.borderColor} rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{typeConfig.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`font-semibold ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {tx.hash}
                          </code>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${typeConfig.color}`}>
                      ${tx.amount} USDC
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <code className="text-sm text-gray-800">{tx.from}</code>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">To</p>
                      <code className="text-sm text-gray-800">{tx.to}</code>
                    </div>
                  </div>

                  {(tx.campaignTitle || tx.ngoName) && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      {tx.campaignTitle && (
                        <p className="text-sm text-gray-700">
                          <strong>Campaign:</strong> {tx.campaignTitle}
                        </p>
                      )}
                      {tx.ngoName && (
                        <p className="text-sm text-gray-700">
                          <strong>NGO:</strong> {tx.ngoName}
                        </p>
                      )}
                      {tx.category && (
                        <p className="text-sm text-gray-700">
                          <strong>Category:</strong> {tx.category}
                        </p>
                      )}
                    </div>
                  )}

                  {tx.memo && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Memo:</strong> {tx.memo}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                      View on Stellar Expert
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
