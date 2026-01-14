'use client';

import { useWallet } from '@/hooks/useWallet';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import WalletConnect from '@/components/WalletConnect';

export type UserRole = 'admin' | 'ngo' | 'donor' | 'beneficiary' | 'merchant' | 'public';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
  showConnectPrompt?: boolean;
}

function useUserRole(): { role: UserRole | null; isLoading: boolean } {
  const { isConnected, publicKey } = useWallet();
  
  if (!isConnected || !publicKey) {
    return { role: null, isLoading: false };
  }

  // Get user role from localStorage (set during registration/login)
  const storedRole = typeof window !== 'undefined' 
    ? localStorage.getItem(`user_role_${publicKey}`) as UserRole 
    : null;

  return { role: storedRole || 'donor', isLoading: false };
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/',
  showConnectPrompt = true,
}: RoleGuardProps) {
  const router = useRouter();
  const { isConnected, isLoading: walletLoading } = useWallet();
  const { role, isLoading: roleLoading } = useUserRole();

  const isLoading = walletLoading || roleLoading;

  useEffect(() => {
    if (isLoading) return;

    // If public is allowed, no need to check further
    if (allowedRoles.includes('public')) return;

    // If not connected and public is not allowed, redirect or show connect prompt
    if (!isConnected) {
      if (!showConnectPrompt) {
        router.push(fallbackPath);
      }
      return;
    }

    // If connected but role doesn't match, redirect
    if (role && !allowedRoles.includes(role)) {
      router.push(fallbackPath);
    }
  }, [isLoading, isConnected, role, allowedRoles, fallbackPath, showConnectPrompt, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  // Public access allowed
  if (allowedRoles.includes('public')) {
    return <>{children}</>;
  }

  // Not connected - show connect prompt
  if (!isConnected && showConnectPrompt) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500 mb-6">
            Please connect your Freighter wallet to access this page.
          </p>
          <WalletConnect />
        </div>
      </div>
    );
  }

  // Connected but wrong role
  if (role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-500 mb-6">
            You don&apos;t have permission to access this page. 
            Required role: {allowedRoles.join(' or ')}.
          </p>
          <button
            onClick={() => router.push(fallbackPath)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // All checks passed
  return <>{children}</>;
}

// Helper component for role selection (demo purposes)
export function RoleSelector() {
  const roles: UserRole[] = ['admin', 'ngo', 'donor', 'beneficiary', 'merchant'];
  const { isConnected } = useWallet();
  
  const currentRole = typeof window !== 'undefined' 
    ? localStorage.getItem('user_role') as UserRole || 'donor'
    : 'donor';

  const handleRoleChange = (role: UserRole) => {
    localStorage.setItem('user_role', role);
    window.location.reload();
  };

  if (!isConnected) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-yellow-800 mb-2 font-medium">
        🧪 Demo Mode: Select Role
      </p>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => handleRoleChange(role)}
            className={`px-3 py-1 text-sm rounded-full capitalize transition-colors ${
              currentRole === role
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-yellow-700 border border-yellow-300 hover:bg-yellow-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}
