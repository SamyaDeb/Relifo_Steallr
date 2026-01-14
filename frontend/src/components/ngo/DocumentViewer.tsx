'use client';

interface Document {
  type: string;
  url: string;
}

interface DocumentViewerProps {
  documents: Document[];
}

export default function DocumentViewer({ documents }: DocumentViewerProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500">No documents uploaded</p>
      </div>
    );
  }

  const getDocumentIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('id') || lower.includes('identity')) return '🪪';
    if (lower.includes('proof') || lower.includes('residence')) return '🏠';
    if (lower.includes('income') || lower.includes('salary')) return '💰';
    if (lower.includes('photo')) return '📷';
    return '📄';
  };

  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const isPDF = (url: string) => url.toLowerCase().endsWith('.pdf');
  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div className="space-y-4">
      {documents.map((doc, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getDocumentIcon(doc.type)}</span>
              <div>
                <p className="font-medium text-gray-800">{doc.type}</p>
                <p className="text-sm text-gray-500">{getFileExtension(doc.url)} Document</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Open
              </a>
              <a
                href={doc.url}
                download
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>

          {/* Preview */}
          {isImage(doc.url) && (
            <div className="p-4">
              <img 
                src={doc.url} 
                alt={doc.type}
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {isPDF(doc.url) && (
            <div className="p-4">
              <iframe
                src={doc.url}
                className="w-full h-96 border border-gray-200 rounded-lg"
                title={doc.type}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
