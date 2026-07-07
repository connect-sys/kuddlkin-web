import React from 'react';

const ALL_BRACKETS = [
  '0–3 months',
  '3–6 months',
  '6–12 months',
  '1–2 years',
  '2–3 years',
  '3–5 years',
  '5–8 years',
  '8–12 years',
  '12–15 years',
  '15+ years'
];

interface CustomRange { enabled: boolean; min: string; max: string; }

interface Props {
  selectedBrackets: string[];
  onBracketsChange: (next: string[]) => void;
  customRange: CustomRange;
  onCustomRangeChange: (next: CustomRange) => void;
  profileBrackets?: string[];
}

const AgeGroupPicker: React.FC<Props> = ({
  selectedBrackets,
  onBracketsChange,
  customRange,
  onCustomRangeChange,
  profileBrackets
}) => {
  const visible = profileBrackets && profileBrackets.length > 0
    ? ALL_BRACKETS.filter((b) => profileBrackets.includes(b))
    : ALL_BRACKETS;

  const list = visible.length > 0 ? visible : ALL_BRACKETS;

  const toggle = (b: string) => {
    onBracketsChange(selectedBrackets.includes(b)
      ? selectedBrackets.filter((x) => x !== b)
      : [...selectedBrackets, b]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {list.map((b) => {
          const sel = selectedBrackets.includes(b);
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggle(b)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                sel
                  ? 'bg-[#578f82] text-white border-[#578f82]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#578f82]'
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={customRange.enabled}
            onChange={(e) => onCustomRangeChange({ ...customRange, enabled: e.target.checked })}
            className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
          />
          <span className="text-sm font-medium text-gray-700">Custom range</span>
        </label>
        {customRange.enabled && (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={customRange.min}
              onChange={(e) => onCustomRangeChange({ ...customRange, min: e.target.value })}
              placeholder="e.g. 4 years"
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="text"
              value={customRange.max}
              onChange={(e) => onCustomRangeChange({ ...customRange, max: e.target.value })}
              placeholder="e.g. 7 years"
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgeGroupPicker;
