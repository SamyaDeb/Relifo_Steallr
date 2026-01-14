'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Transaction {
  id: string;
  type: 'received' | 'spent' | 'cashout';
  amount: number;
  merchant?: string;
  category?: string;
  description?: string;
  timestamp: string;
  status: 'completed' | 'pending';
  txHash: string;
}

export default function TransactionHistory() {
  const { isConnected, publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'received' | 'spent' | 'cashout'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchTransactions();
    }
  }, [isConnected, publicKey]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/beneficiary/transactions?address=${publicKey}`);
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
    .filter(tx => filter === 'all' || tx.type === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const getTypeDisplay = (type: Transaction['type']) => {
    const configs = {
      received: {
        icon: '📥',
        label: 'Received',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      spent: {
        icon: '🛒',
        label: 'Spent',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      cashout: {
        icon: '💵',
        label: 'Cashout',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
    };
    return configs[type];
  };

  const totalReceived = transactions
    .filter(tx => tx.type === 'received')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = transactions
    .filter(tx => tx.type === 'spent')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalCashout = transactions
    .filter(tx => tx.type === 'cashout')
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to view transaction history</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📥</span>
            <span className="text-sm font-medium text-green-700">Received</span>
          </div>
          <p className="text-2xl font-bold text-green-600">${totalReceived}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🛒</span>
            <span className="text-sm font-medium text-blue-700">Spent</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">${totalSpent}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💵</span>
            <span className="text-sm font-medium text-purple-700">Cashout</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">${totalCashout}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="received">Received Only</option>
              <option value="spent">Spent Only</option>
              <option value="cashout">Cashout Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
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
            <span className="text-3xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Transactions Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any transactions yet."
              : `No ${filter} transactions found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(tx => {
            const typeConfig = getTypeDisplay(tx.type);
            
            return (
              <div
                key={tx.id}
                className={`bg-white border-l-4 ${typeConfig.borderColor} rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{typeConfig.icon}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          {tx.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${typeConfig.color}`}>
                      {tx.type === 'received' ? '+' : '-'}${tx.amount}
                    </p>
                  </div>

                  {tx.merchant && (
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {tx.merchant}
                      {tx.category && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tx.category}
                        </span>
                      )}
                    </div>
                  )}

                  {tx.description && (
                    <p className="text-sm text-gray-700 mb-3">{tx.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <code className="text-xs">{tx.txHash}</code>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View on Explorer →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export Button */}
      {filteredTransactions.length > 0 && (
        <div className="text-center">
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to CSV
          </button>
        </div>
      )}
    </div>
  );
}
