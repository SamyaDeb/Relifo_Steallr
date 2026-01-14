'use client';

interface CategoryLimits {
  food: number;
  medical: number;
  education: number;
  shelter: number;
  other: number;
}

interface CategoryConfigProps {
  limits: CategoryLimits;
  onChange: (limits: CategoryLimits) => void;
}

const CATEGORIES = [
  { key: 'food', label: 'Food & Groceries', icon: '🍚', color: 'green' },
  { key: 'medical', label: 'Medical & Healthcare', icon: '🏥', color: 'red' },
  { key: 'education', label: 'Education', icon: '📚', color: 'blue' },
  { key: 'shelter', label: 'Shelter & Housing', icon: '🏠', color: 'purple' },
  { key: 'other', label: 'Other Essentials', icon: '🛒', color: 'gray' },
] as const;

export default function CategoryConfig({ limits, onChange }: CategoryConfigProps) {
  const totalPercentage = Object.values(limits).reduce((sum, val) => sum + val, 0);
  const isValid = totalPercentage === 100;

  const handleChange = (category: keyof CategoryLimits, value: number) => {
    const newLimits = { ...limits, [category]: Math.max(0, Math.min(100, value)) };
    onChange(newLimits);
  };

  const distributeEvenly = () => {
    const perCategory = Math.floor(100 / CATEGORIES.length);
    const remainder = 100 % CATEGORIES.length;
    const newLimits = CATEGORIES.reduce((acc, cat, idx) => {
      acc[cat.key] = perCategory + (idx < remainder ? 1 : 0);
      return acc;
    }, {} as CategoryLimits);
    onChange(newLimits);
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-500',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Total Allocation</span>
          <span className={`text-sm font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            {totalPercentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
          {CATEGORIES.map(cat => {
            const percentage = limits[cat.key];
            if (percentage === 0) return null;
            return (
              <div
                key={cat.key}
                className={`h-full ${getColorClass(cat.color)}`}
                style={{ width: `${percentage}%` }}
                title={`${cat.label}: ${percentage}%`}
              />
            );
          })}
        </div>
        {!isValid && (
          <p className="text-xs text-red-600 mt-1">
            {totalPercentage > 100 ? 'Total exceeds 100%' : 'Total must equal 100%'}
          </p>
        )}
      </div>

      {/* Category Sliders */}
      <div className="space-y-3">
        {CATEGORIES.map(cat => (
          <div key={cat.key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={limits[cat.key]}
                  onChange={(e) => handleChange(cat.key, parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-16 px-2 py-1 text-sm border border-gray-200 rounded text-center focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 w-6">%</span>
              </div>
            </div>
            <input
              type="range"
              value={limits[cat.key]}
              onChange={(e) => handleChange(cat.key, parseInt(e.target.value))}
              min="0"
              max="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${getColorClass(cat.color).replace('bg-', '')} ${limits[cat.key]}%, #e5e7eb ${limits[cat.key]}%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={distributeEvenly}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Distribute Evenly
        </button>
        <button
          onClick={() => onChange({ food: 100, medical: 0, education: 0, shelter: 0, other: 0 })}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Food Only
        </button>
        <button
          onClick={() => onChange({ food: 60, medical: 20, education: 10, shelter: 10, other: 0 })}
          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Balanced
        </button>
      </div>
    </div>
  );
}
