'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Order {
  id: string;
  beneficiary: {
    name: string;
    address: string;
  };
  amount: number;
  category: string;
  items: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submittedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export default function OrderDashboard() {
  const { isConnected, publicKey } = useWallet();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  useEffect(() => {
    if (isConnected && publicKey) {
      fetchOrders();
    }
  }, [isConnected, publicKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/merchant/orders?address=${publicKey}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.amount, 0),
  };

  const getStatusConfig = (status: Order['status']) => {
    const configs = {
      pending: {
        icon: '⏳',
        label: 'Pending NGO',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      },
      approved: {
        icon: '✅',
        label: 'Ready to Fulfill',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      rejected: {
        icon: '❌',
        label: 'Rejected',
        color: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      },
      completed: {
        icon: '✔️',
        label: 'Completed',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
    };
    return configs[status];
  };

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to view orders</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Order Dashboard</h2>
        <button
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-700 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 mb-1">Completed</p>
          <p className="text-2xl font-bold text-blue-800">{stats.completed}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-purple-800">${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending NGO Approval</option>
            <option value="approved">Ready to Fulfill</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Orders Found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? "You don't have any orders yet."
              : `No ${filter} orders found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            
            return (
              <div
                key={order.id}
                className={`bg-white border-2 ${statusConfig.borderColor} rounded-xl overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order {order.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                          {statusConfig.icon} {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Beneficiary: {order.beneficiary.name}
                      </p>
                      <code className="text-xs text-gray-500">{order.beneficiary.address}</code>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">${order.amount}</p>
                      <p className="text-sm text-gray-600">{order.category}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Items</p>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium text-gray-800">
                        {new Date(order.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    {order.approvedAt && (
                      <div>
                        <p className="text-gray-600">Approved</p>
                        <p className="font-medium text-gray-800">
                          {new Date(order.approvedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {order.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed</p>
                        <p className="font-medium text-gray-800">
                          {new Date(order.completedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {order.status === 'approved' && (
                    <div className="mt-4 pt-4 border-t">
                      <a
                        href={`/merchant/fulfill/${order.id}`}
                        className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Fulfill Order →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
