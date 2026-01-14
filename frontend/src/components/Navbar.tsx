'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/stellar';

export default function Navbar() {
  const pathname = usePathname();
  const { isConnected, publicKey, usdcBalance, connect, disconnect, isLoading } = useWallet();
  const [userRole, setUserRole] = useState<string | null>(null);

  // Get admin address from environment variable
  const adminAddress = process.env.NEXT_PUBLIC_ADMIN_ADDRESS;
  const isAdmin = publicKey === adminAddress;

  useEffect(() => {
    if (publicKey) {
      const role = localStorage.getItem(`user_role_${publicKey}`);
      setUserRole(role);
    } else {
      setUserRole(null);
    }
  }, [publicKey]);

  // Build navigation links based on role
  const getNavLinks = () => {
    const links = [{ href: '/', label: 'Home' }];

    if (!isConnected) {
      links.push({ href: '/campaigns', label: 'Campaigns' });
      links.push({ href: '/audit', label: 'Audit' });
      return links;
    }

    if (isAdmin) {
      links.push({ href: '/admin', label: 'Admin Dashboard' });
      links.push({ href: '/campaigns', label: 'Campaigns' });
      links.push({ href: '/audit', label: 'Audit' });
      return links;
    }

    // For other users, show their specific dashboard
    if (userRole === 'donor') {
      links.push({ href: '/donor', label: 'My Dashboard' });
      links.push({ href: '/campaigns', label: 'Campaigns' });
    } else if (userRole === 'ngo') {
      links.push({ href: '/ngo', label: 'My Dashboard' });
    } else if (userRole === 'beneficiary') {
      links.push({ href: '/beneficiary', label: 'My Dashboard' });
    } else if (userRole === 'merchant') {
      links.push({ href: '/merchant', label: 'My Dashboard' });
    } else if (userRole?.includes('_pending')) {
      links.push({ href: '/register/pending', label: 'Application Status' });
    } else {
      links.push({ href: '/register', label: 'Register' });
    }

    links.push({ href: '/audit', label: 'Audit' });
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Relifo
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected && publicKey ? (
              <>
                {/* Role Badge */}
                {isAdmin ? (
                  <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Admin
                  </span>
                ) : userRole && !userRole.includes('_pending') ? (
                  <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {userRole}
                  </span>
                ) : null}

                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">
                    {parseFloat(usdcBalance).toFixed(2)} USDC
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1.5 bg-gray-100 rounded-lg">
                    <span className="text-sm font-mono text-gray-700">
                      {formatAddress(publicKey)}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={connect}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="flex space-x-1 px-2 py-2 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                pathname === link.href
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
