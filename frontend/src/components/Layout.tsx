'use client';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarRole?: 'donor' | 'ngo' | 'admin' | 'beneficiary' | 'merchant';
}

export default function Layout({ 
  children, 
  showSidebar = false, 
  sidebarRole = 'donor' 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Navbar />
      
      <div className="flex flex-1">
        {showSidebar && <Sidebar role={sidebarRole} />}
        
        <main className={`flex-1 ${showSidebar ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

// Simple layout without sidebar for public pages
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={false}>{children}</Layout>;
}

// Dashboard layouts for different roles
export function DonorLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={true} sidebarRole="donor">{children}</Layout>;
}

export function NGOLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={true} sidebarRole="ngo">{children}</Layout>;
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={true} sidebarRole="admin">{children}</Layout>;
}

export function BeneficiaryLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={true} sidebarRole="beneficiary">{children}</Layout>;
}

export function MerchantLayout({ children }: { children: React.ReactNode }) {
  return <Layout showSidebar={true} sidebarRole="merchant">{children}</Layout>;
}
