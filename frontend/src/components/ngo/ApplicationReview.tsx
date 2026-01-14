'use client';

import { useState } from 'react';
import DocumentViewer from './DocumentViewer';


interface Application {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignControlMode: 'direct' | 'controlled';
  applicantName: string;
  applicantWallet: string;
  email: string;
  phone: string;
  householdSize: number;
  monthlyIncome: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  documents: { type: string; url: string }[];
  address?: string;
  occupation?: string;
}

interface ApplicationReviewProps {
  application: Application;
  onClose: () => void;
}

export default function ApplicationReview({ application, onClose }: ApplicationReviewProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'documents'>('details');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{application.applicantName}</h3>
              <p className="text-sm text-gray-500">{application.campaignTitle}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Application Details
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Documents ({application.documents.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'details' ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-800 mt-1">{application.applicantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Wallet Address</label>
                  <code className="text-sm text-gray-800 block mt-1">{application.applicantWallet}</code>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-800 mt-1">{application.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-800 mt-1">{application.phone}</p>
                </div>
              </div>

              {/* Household Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-3">Household Information</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Household Size</label>
                    <p className="text-lg font-semibold text-gray-800">{application.householdSize} people</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Monthly Income</label>
                    <p className="text-lg font-semibold text-gray-800">${application.monthlyIncome}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Per Capita</label>
                    <p className="text-lg font-semibold text-gray-800">
                      ${(application.monthlyIncome / application.householdSize).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {application.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-800 mt-1">{application.address}</p>
                </div>
              )}

              {application.occupation && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Occupation</label>
                  <p className="text-gray-800 mt-1">{application.occupation}</p>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Application</label>
                <p className="text-gray-800 mt-2 p-4 bg-gray-50 rounded-lg">{application.reason}</p>
              </div>

              {/* Control Mode Info */}
              <div className={`p-4 rounded-lg border-2 ${
                application.campaignControlMode === 'direct'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">
                    {application.campaignControlMode === 'direct' ? '🔓' : '🔒'}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {application.campaignControlMode === 'direct' ? 'Direct Spending Mode' : 'Controlled Spending Mode'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {application.campaignControlMode === 'direct'
                        ? 'Beneficiary can spend funds freely at any merchant'
                        : 'Spending requires approval with category limits'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submission Info */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(application.submittedAt).toLocaleString()}
                </p>
              </div>

              {/* Approval Section - Only for pending applications */}
              {application.status === 'pending' && (
                <div className="pt-6 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Next Step:</strong> Go to the Beneficiary Approval page to approve or reject this application.
                    </p>
                    <a
                      href={`/ngo/approve/${application.id}`}
                      className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Go to Approval Page →
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <DocumentViewer documents={application.documents} />
          )}
        </div>
      </div>
    </div>
  );
}
