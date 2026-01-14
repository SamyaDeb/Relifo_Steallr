'use client';

interface ControlModeSelectorProps {
  selected: 'direct' | 'controlled';
  onChange: (mode: 'direct' | 'controlled') => void;
}

export default function ControlModeSelector({ selected, onChange }: ControlModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange('direct')}
        className={`p-4 border-2 rounded-lg text-left transition-all ${
          selected === 'direct'
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center mb-2">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected === 'direct' ? 'border-blue-500' : 'border-gray-300'
          }`}>
            {selected === 'direct' && (
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            )}
          </div>
          <span className="ml-2 font-semibold text-gray-800">Direct Spending</span>
          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            Default
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Beneficiaries can spend funds freely at any registered merchant. Maximum flexibility and dignity.
        </p>
        <div className="mt-3 text-xs text-gray-500">
          ✅ Full autonomy • ✅ Faster relief • ✅ Less overhead
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('controlled')}
        className={`p-4 border-2 rounded-lg text-left transition-all ${
          selected === 'controlled'
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center mb-2">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected === 'controlled' ? 'border-purple-500' : 'border-gray-300'
          }`}>
            {selected === 'controlled' && (
              <div className="w-3 h-3 rounded-full bg-purple-500" />
            )}
          </div>
          <span className="ml-2 font-semibold text-gray-800">Controlled Spending</span>
        </div>
        <p className="text-sm text-gray-600">
          Beneficiaries request purchases with category limits. NGO approves each transaction. More oversight.
        </p>
        <div className="mt-3 text-xs text-gray-500">
          ⚙️ Category limits • 📋 Pre-approval • 🔍 More control
        </div>
      </button>
    </div>
  );
}
