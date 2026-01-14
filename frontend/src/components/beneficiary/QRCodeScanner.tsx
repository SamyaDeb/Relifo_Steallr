'use client';

import { useState, useRef, useEffect } from 'react';

// Merchant interface for QR code scanning
interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
}

export interface QRCodeScannerProps {
  onScan: (merchantData: Merchant) => void;
}

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setScanning(true);

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // In production: Use a QR code library like jsQR or html5-qrcode
      // For now, simulate scan after 2 seconds
      setTimeout(() => {
        simulateScan();
      }, 2000);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions or enter code manually.');
      setScanning(false);
    }
  };

  const simulateScan = () => {
    // In production, this would scan actual QR codes
    setError('QR code scanning requires real merchant QR codes');
    stopScanning();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      setError('Please enter a merchant code');
      return;
    }

    // Validate and fetch merchant data from backend
    fetch(`/api/merchants/${manualCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.merchant) {
          onScan(data.merchant);
        } else {
          setError('Merchant not found');
        }
      })
      .catch(err => {
        console.error('Error fetching merchant:', err);
        setError('Invalid merchant code');
      });
  };

  return (
    <div className="space-y-6">
      {/* Camera Scanner */}
      <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video relative">
        {scanning ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-white rounded-lg opacity-50" />
            </div>
            <div className="absolute top-4 left-4 right-4 bg-black/50 text-white text-sm p-3 rounded-lg">
              Position QR code within the frame
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <span className="text-6xl block mb-4">📷</span>
              <p className="text-lg mb-4">Ready to scan</p>
              <button
                onClick={startScanning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Camera
              </button>
            </div>
          </div>
        )}
      </div>

      {scanning && (
        <button
          onClick={stopScanning}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Stop Scanning
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Manual Entry */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-800 mb-4">Or enter merchant code manually</h4>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Enter merchant code or address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Submit Code
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>How to use:</strong><br />
          1. Ask the merchant to show their QR code<br />
          2. Click &quot;Start Camera&quot; and position the QR code<br />
          3. The code will scan automatically<br />
          4. Or enter the merchant code manually below
        </p>
      </div>
    </div>
  );
}
