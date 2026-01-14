'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Order {
  id: string;
  beneficiary: {
    name: string;
    address: string;
  };
  amount: number;
  category: string;
  items: string[];
  approvedAt: string;
}

interface OrderFulfillmentProps {
  orderId?: string;
}

export default function OrderFulfillment({ orderId }: OrderFulfillmentProps) {
  const { isConnected, publicKey } = useWallet();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'verify' | 'confirm' | 'process' | 'success'>('verify');
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    if (isConnected && publicKey && orderId) {
      fetchOrder();
    }
  }, [isConnected, publicKey, orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/merchant/orders/${orderId}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const handleComplete = async () => {
    if (!order) return;

    try {
      setProcessing(true);
      setStep('process');

      // In production: Call Stellar transaction
      const response = await fetch('/api/merchant/complete-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          merchantAddress: publicKey,
          beneficiaryAddress: order.beneficiary.address,
          amount: order.amount,
        }),
      });

      if (!response.ok) throw new Error('Transaction failed');

      const data = await response.json();
      setTxHash(data.txHash);
      setStep('success');
    } catch (err) {
      console.error('Fulfillment error:', err);
      alert('Transaction failed. Please try again.');
      setStep('confirm');
    } finally {
      setProcessing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Connect your wallet to fulfill orders</p>
      </div>
    );
  }

  if (loading || !order) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Order Fulfilled!</h3>
          <p className="text-gray-600 mb-6">
            Payment of ${order.amount} USDC has been received successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
            <code className="text-xs text-gray-800 break-all">{txHash}</code>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong><br />
              • Payment has been transferred to your merchant wallet<br />
              • Order marked as completed in the system<br />
              • Beneficiary will receive confirmation
            </p>
          </div>

          <a
            href="/merchant/orders"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </a>
        </div>
      </div>
    );
  }

  if (step === 'process') {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">⏳</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Transaction...</h3>
          <p className="text-gray-600">
            Please wait while we complete the payment on the blockchain.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirm Order Fulfillment</h2>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Order ID</span>
              <span className="font-semibold text-gray-800">{order.id}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Beneficiary</span>
              <span className="font-semibold text-gray-800">{order.beneficiary.name}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-gray-600">Category</span>
              <span className="font-semibold text-gray-800">{order.category}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-semibold text-gray-800">Amount to Receive</span>
              <span className="font-bold text-green-600 text-xl">${order.amount} USDC</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> By clicking &quot;Complete Order&quot;, you confirm that:
            <br />• All items have been provided to the beneficiary
            <br />• The beneficiary has verified receipt
            <br />• Payment will be transferred to your wallet immediately
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setStep('verify')}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={processing}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
          >
            {processing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Fulfillment</h2>
      <p className="text-gray-600 mb-6">Verify items and complete the order</p>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-700 mb-1">Order ID: {order.id}</p>
            <p className="font-semibold text-blue-900">{order.beneficiary.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">${order.amount}</p>
            <p className="text-sm text-blue-700">{order.category}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Items Checklist</h3>
        <p className="text-sm text-gray-600 mb-4">
          Check off each item as you provide it to the beneficiary:
        </p>
        
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                checkedItems.has(index)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={checkedItems.has(index)}
                onChange={() => toggleItem(index)}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className={`ml-3 ${checkedItems.has(index) ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {item}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600">
            Progress: {checkedItems.size} of {order.items.length} items checked
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(checkedItems.size / order.items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('confirm')}
        disabled={checkedItems.size !== order.items.length}
        className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {checkedItems.size === order.items.length
          ? 'Proceed to Confirmation'
          : `Check all items (${checkedItems.size}/${order.items.length})`}
      </button>
    </div>
  );
}
