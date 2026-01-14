'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  role?: 'donor' | 'ngo' | 'admin' | 'beneficiary' | 'merchant';
}

export default function Sidebar({ role = 'donor' }: SidebarProps) {
  const pathname = usePathname();
  const { isConnected } = useWallet();

  const linksByRole: Record<string, SidebarLink[]> = {
    donor: [
      { href: '/donor', label: 'Dashboard', icon: '🏠' },
      { href: '/donor/wallet', label: 'My Wallet', icon: '💰' },
      { href: '/donor/campaigns', label: 'Browse Campaigns', icon: '📋' },
      { href: '/donor/donations', label: 'My Donations', icon: '🎁' },
      { href: '/donor/history', label: 'Transaction History', icon: '📜' },
    ],
    ngo: [
      { href: '/ngo', label: 'Dashboard', icon: '🏠' },
      { href: '/ngo/register', label: 'Register NGO', icon: '📝' },
      { href: '/ngo/campaigns', label: 'My Campaigns', icon: '📋' },
      { href: '/ngo/create-campaign', label: 'Create Campaign', icon: '➕' },
      { href: '/ngo/applications', label: 'Applications', icon: '📄' },
      { href: '/ngo/beneficiaries', label: 'Beneficiaries', icon: '👥' },
      { href: '/ngo/allocations', label: 'Fund Allocation', icon: '💸' },
    ],
    admin: [
      { href: '/admin', label: 'Dashboard', icon: '🏠' },
      { href: '/admin/ngos', label: 'NGO Verification', icon: '✅' },
      { href: '/admin/merchants', label: 'Merchant Registry', icon: '🏪' },
      { href: '/admin/stats', label: 'Platform Stats', icon: '📊' },
      { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
    beneficiary: [
      { href: '/beneficiary', label: 'Dashboard', icon: '🏠' },
      { href: '/beneficiary/apply', label: 'Apply for Aid', icon: '📝' },
      { href: '/beneficiary/wallet', label: 'My Wallet', icon: '💰' },
      { href: '/beneficiary/spend', label: 'Spend Funds', icon: '🛒' },
      { href: '/beneficiary/history', label: 'Transaction History', icon: '📜' },
    ],
    merchant: [
      { href: '/merchant', label: 'Dashboard', icon: '🏠' },
      { href: '/merchant/register', label: 'Register', icon: '📝' },
      { href: '/merchant/transactions', label: 'Transactions', icon: '💳' },
      { href: '/merchant/earnings', label: 'Earnings', icon: '💰' },
    ],
  };

  const links = linksByRole[role] || linksByRole.donor;

  if (!isConnected) {
    return (
      <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            Connect your wallet to access the dashboard
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
          {role} Dashboard
        </h2>
        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
