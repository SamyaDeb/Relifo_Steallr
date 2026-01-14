'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Payment {
  id: string;
  orderId: string;
  beneficiary: {
    name: string;
    address: string;
  };
  amount: number;
  category: string;
  timestamp: string;
  txHash: string;
  status: 'completed' | 'pending';
}

export default function PaymentHistory() {
  const { isConnected, publicKey } = useWallet();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchPayments();
    }
  }, [isConnected, publicKey]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/merchant/payments?address=${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments
    .filter(payment => filter === 'all' || payment.status === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const stats = {
    total: payments.length,
    totalRevenue: payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments.filter(p => p.status === 'pending').length,
    thisMonth: payments.filter(p => {
      const paymentDate = new Date(p.timestamp);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    }).reduce((sum, p) => sum + p.amount, 0),
  };

  const categoryBreakdown = payments.reduce((acc, payment) => {
    acc[payment.category] = (acc[payment.category] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to view payment history</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Payment History</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">💰</span>
            <span className="text-sm font-medium text-gray-600">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📊</span>
            <span className="text-sm font-medium text-blue-700">Total Payments</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">📅</span>
            <span className="text-sm font-medium text-green-700">This Month</span>
          </div>
          <p className="text-2xl font-bold text-green-600">${stats.thisMonth}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">⏳</span>
            <span className="text-sm font-medium text-purple-700">Pending</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.pending}</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue by Category</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(categoryBreakdown).map(([category, amount]) => {
            const percentage = (amount / stats.totalRevenue) * 100;
            return (
              <div key={category} className="text-center">
                <p className="text-2xl font-bold text-gray-800">${amount}</p>
                <p className="text-sm text-gray-600 capitalize">{category}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</p>
              </div>
            );
          })}
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
              <option value="all">All Payments</option>
              <option value="completed">Completed Only</option>
              <option value="pending">Pending Only</option>
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

      {/* Payments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Payments Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You haven't received any payments yet."
              : `No ${filter} payments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map(payment => (
            <div
              key={payment.id}
              className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        Order {payment.orderId}
                      </h3>
                      {payment.status === 'pending' && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      From: {payment.beneficiary.name}
                    </p>
                    <code className="text-xs text-gray-500">{payment.beneficiary.address}</code>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">+${payment.amount}</p>
                    <p className="text-sm text-gray-600">{payment.category}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(payment.timestamp).toLocaleString()}
                  </div>
                  
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${payment.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                  >
                    View on Explorer
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Button */}
      {filteredPayments.length > 0 && (
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
