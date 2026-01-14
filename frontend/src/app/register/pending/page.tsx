'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

export default function PendingPage() {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    if (publicKey) {
      const storedApplication = localStorage.getItem(`user_application_${publicKey}`);
      if (storedApplication) {
        setApplication(JSON.parse(storedApplication));
      }

      // Check for status updates periodically
      const checkStatus = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/applications/${publicKey}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'approved') {
              // Update local storage with approved role
              localStorage.setItem(`user_role_${publicKey}`, data.role);
              localStorage.removeItem(`user_application_${publicKey}`);
              router.push(`/${data.role}`);
            } else if (data.status === 'rejected') {
              localStorage.setItem(`user_role_${publicKey}`, `${data.role}_rejected`);
            }
          }
        } catch (error) {
          console.log('Status check failed, will retry');
        }
      };

      checkStatus();
      const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, publicKey, router]);

  if (!isConnected) {
    return null;
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ngo':
        return 'Campaign Organizer (NGO)';
      case 'beneficiary':
        return 'Beneficiary';
      case 'merchant':
        return 'Merchant';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Status Icon */}
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Pending
            </h1>

            <p className="text-gray-600 mb-6">
              Your application has been submitted and is waiting for admin approval.
              You will be notified once your application is reviewed.
            </p>

            {application && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Role:</span>{' '}
                    <span className="font-medium">{getRoleLabel(application.role)}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-medium">{application.name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-medium">{application.email}</span>
                  </p>
                  {application.organization && (
                    <p>
                      <span className="text-gray-500">Organization:</span>{' '}
                      <span className="font-medium">{application.organization}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Wallet: <span className="font-mono">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
              </p>
              
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Check Status
                </button>
                
                <Link
                  href="/campaigns"
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                >
                  Browse Campaigns
                </Link>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An administrator will review your application</li>
              <li>• You&apos;ll receive access to your dashboard once approved</li>
              <li>• This page will automatically update when your status changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
