'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

export default function Home() {
  const router = useRouter();
  const { isConnected, connect, publicKey, isLoading } = useWallet();
  
  // Get admin address from environment variable (no hardcoding)
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;

  // Redirect based on wallet address
  useEffect(() => {
    if (isConnected && publicKey && !isLoading) {
      if (publicKey === adminAddress) {
        // Admin wallet - redirect to admin dashboard
        router.push('/admin');
      } else {
        // Check if user has registered role in localStorage
        const userRole = localStorage.getItem(`user_role_${publicKey}`);
        if (userRole) {
          // If pending, redirect to pending page
          if (userRole.includes('_pending')) {
            router.push('/register/pending');
          } else {
            // User has a role, redirect to their dashboard
            router.push(`/${userRole}`);
          }
        } else {
          // New user - redirect to register page
          router.push('/register');
        }
      }
    }
  }, [isConnected, publicKey, isLoading, adminAddress, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">Relifo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Blockchain-Powered Disaster Relief Platform on Stellar
          </p>
          
          {/* Wallet Connection */}
          {!isConnected ? (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 mb-6">
                Connect your Freighter wallet to access the platform
              </p>
              <button
                onClick={connect}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Connect Wallet
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Don&apos;t have Freighter?{' '}
                <a 
                  href="https://freighter.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download here
                </a>
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600">Redirecting...</p>
              <p className="text-sm text-gray-500 mt-2 font-mono">
                {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="text-xl font-semibold mb-2">Blockchain Powered</h3>
            <p className="text-gray-600">
              Built on Stellar with Soroban smart contracts for transparency and trust
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
            <p className="text-gray-600">
              Live blockchain data synchronization for instant transaction tracking
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Auditable</h3>
            <p className="text-gray-600">
              Every transaction is recorded on the blockchain for full transparency
            </p>
          </div>
        </div>

        {/* Network Info */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Network: <span className="font-semibold">Stellar Testnet</span></p>
        </div>
      </main>
    </div>
  );
}
