import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

const DaysPicker: React.FC<Props> = ({ value, onChange }) => {
  const toggle = (d: string) => {
    onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((d) => {
        const sel = value.includes(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => toggle(d)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              sel
                ? 'bg-[#578f82] text-white border-[#578f82]'
                : 'bg-white text-gray-700 border-gray-300 hover:border-[#578f82]'
            }`}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
};

export default DaysPicker;
