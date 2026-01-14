'use client';

import { useState, useEffect } from 'react';

export default function AuditExplorer() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for blockchain data fetching
    setLoading(false);
    setTransactions([]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Explorer</h1>
          <p className="mt-2 text-sm text-gray-600">
            Public blockchain audit trail - All transactions are transparent and verifiable
          </p>
        </div>

        {/* Network Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Connected to <span className="font-semibold">Stellar Testnet</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contract IDs */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Smart Contract Addresses</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">ReliefVault</span>
              <code className="text-xs text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID || 'Not configured'}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">NGO Registry</span>
              <code className="text-xs text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_NGO_CONTRACT_ID || 'Not configured'}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">Beneficiary Registry</span>
              <code className="text-xs text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_BENEFICIARY_CONTRACT_ID || 'Not configured'}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">Merchant Registry</span>
              <code className="text-xs text-gray-600 font-mono">
                {process.env.NEXT_PUBLIC_MERCHANT_CONTRACT_ID || 'Not configured'}
              </code>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading blockchain data...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Transactions will appear here once activity begins on the platform
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((tx, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{tx.type}</span>
                      <span className="text-xs text-gray-500">{tx.timestamp}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{tx.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Explorer Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            View detailed contract data on Stellar Explorer
          </p>
          <a
            href="https://stellar.expert/explorer/testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Open Stellar Explorer
          </a>
        </div>
      </div>
    </div>
  );
}
