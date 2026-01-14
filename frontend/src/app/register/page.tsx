'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';

type UserRole = 'ngo' | 'donor' | 'beneficiary' | 'merchant';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'ngo',
    title: 'Campaign Organizer (NGO)',
    description: 'Create relief campaigns, review beneficiary applications, and allocate funds',
    icon: '🏢',
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'donor',
    title: 'Donor',
    description: 'Browse campaigns and donate to help those in need',
    icon: '💚',
    color: 'from-green-500 to-green-700',
  },
  {
    id: 'beneficiary',
    title: 'Beneficiary',
    description: 'Apply for relief aid from approved campaigns',
    icon: '👥',
    color: 'from-yellow-500 to-yellow-700',
  },
  {
    id: 'merchant',
    title: 'Merchant',
    description: 'Accept payments from beneficiaries and process relief purchases',
    icon: '🏪',
    color: 'from-red-500 to-red-700',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { isConnected, publicKey } = useWallet();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    description: '',
    documents: '',
  });

  // Check if user already has a role (only redirect if they do)
  useEffect(() => {
    if (isConnected && publicKey) {
      const existingRole = localStorage.getItem(`user_role_${publicKey}`);
      if (existingRole) {
        // If pending, redirect to pending page
        if (existingRole.includes('_pending')) {
          router.push('/register/pending');
        } else {
          // Redirect to role dashboard
          router.push(`/${existingRole}`);
        }
      }
    }
  }, [isConnected, publicKey, router]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    
    // Donors can proceed directly without approval
    if (role === 'donor') {
      if (publicKey) {
        localStorage.setItem(`user_role_${publicKey}`, 'donor');
        router.push('/donor');
      }
    } else {
      setStep('form');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save application to backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey,
          role: selectedRole,
          status: 'pending',
          ...formData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      // Store pending status
      if (publicKey) {
        localStorage.setItem(`user_role_${publicKey}`, `${selectedRole}_pending`);
        localStorage.setItem(`user_application_${publicKey}`, JSON.stringify({
          role: selectedRole,
          status: 'pending',
          ...formData,
        }));
      }

      // Redirect to pending page
      router.push('/register/pending');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Still save locally for demo purposes
      if (publicKey) {
        localStorage.setItem(`user_role_${publicKey}`, `${selectedRole}_pending`);
        localStorage.setItem(`user_application_${publicKey}`, JSON.stringify({
          role: selectedRole,
          status: 'pending',
          ...formData,
        }));
      }
      router.push('/register/pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Register on Relifo
          </h1>
          <p className="text-lg text-gray-600">
            Connected: <span className="font-mono">{publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}</span>
          </p>
        </div>

        {step === 'role' && (
          <>
            <h2 className="text-2xl font-semibold text-center mb-8 text-gray-900">
              Select Your Role
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="text-left group"
                >
                  <div className={`h-full bg-gradient-to-br ${role.color} rounded-xl shadow-lg p-6 transition-transform duration-200 hover:scale-105 hover:shadow-xl`}>
                    <div className="text-5xl mb-4">{role.icon}</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {role.title}
                    </h3>
                    <p className="text-white/90">
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'form' && selectedRole && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('role')}
              className="mb-6 text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back to role selection
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                {selectedRole === 'ngo' && 'Campaign Organizer Registration'}
                {selectedRole === 'beneficiary' && 'Beneficiary Application'}
                {selectedRole === 'merchant' && 'Merchant Registration'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {selectedRole === 'ngo' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your NGO/Organization name"
                    />
                  </div>
                )}

                {selectedRole === 'merchant' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your business name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedRole === 'ngo' && 'Organization Description *'}
                    {selectedRole === 'beneficiary' && 'Why do you need assistance? *'}
                    {selectedRole === 'merchant' && 'Business Description *'}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      selectedRole === 'ngo'
                        ? 'Describe your organization and its mission...'
                        : selectedRole === 'beneficiary'
                        ? 'Describe your situation and why you need assistance...'
                        : 'Describe your business and the products/services you offer...'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents (URLs)
                  </label>
                  <input
                    type="text"
                    name="documents"
                    value={formData.documents}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Links to supporting documents (optional)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Provide links to any supporting documents (e.g., ID, registration certificate)
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your application will be reviewed by an administrator. 
                    You will be notified once your application is approved.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
