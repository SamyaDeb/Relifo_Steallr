'use client';

import { useState } from 'react';

interface DocumentUploadProps {
  onComplete: (fileUrls: string[]) => void;
  onBack?: () => void;
  isSubmitting?: boolean;
}

export default function DocumentUpload({ onComplete, onBack, isSubmitting }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const { fileUrls } = await response.json();
      onComplete(fileUrls);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '📷';
    if (file.type === 'application/pdf') return '📄';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Verification Documents</h3>
      <p className="text-gray-600 mb-6">
        Please upload supporting documents (ID, proof of residence, income proof, etc.)
      </p>

      {/* Upload Area */}
      <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer transition-colors mb-6">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 font-medium mb-1">Click to upload or drag and drop</p>
        <p className="text-sm text-gray-400">PDF, JPG, PNG up to 10MB each</p>
        <input
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
        />
      </label>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Files ({files.length})
          </p>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getFileIcon(file)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Document Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Required Documents</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Government-issued ID or passport</li>
          <li>✓ Proof of residence (utility bill, rental agreement)</li>
          <li>✓ Income proof (if applicable)</li>
          <li>✓ Any supporting documents for your situation</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        {onBack && (
          <button
            onClick={onBack}
            disabled={uploading || isSubmitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          onClick={handleUpload}
          disabled={files.length === 0 || uploading || isSubmitting}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {uploading || isSubmitting ? 'Submitting Application...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}
