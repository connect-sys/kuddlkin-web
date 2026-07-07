import React from 'react';

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  availableZones?: string[];
  disabled?: boolean;
}

const ServiceAreaPicker: React.FC<Props> = ({ value, onChange, availableZones, disabled }) => {
  const zones = (availableZones && availableZones.length > 0) ? availableZones : [];

  if (zones.length === 0) {
    return (
      <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
        No service area found in your profile. Please add serviceable pincodes/cities in your Profile before creating a service.
      </div>
    );
  }

  const allSelected = zones.every((z) => value.includes(z));

  const toggleZone = (zone: string) => {
    if (disabled) return;
    onChange(value.includes(zone) ? value.filter((z) => z !== zone) : [...value, zone]);
  };

  const toggleAll = () => {
    if (disabled) return;
    onChange(allSelected ? [] : [...zones]);
  };

  return (
    <div>
      <label className="flex items-center gap-2 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          disabled={disabled}
          className="rounded border-gray-300 text-[#578f82] focus:ring-[#578f82]"
        />
        <span className="text-sm font-medium text-gray-700">Serve all my areas</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {zones.map((zone) => {
          const selected = value.includes(zone);
          return (
            <button
              key={zone}
              type="button"
              onClick={() => toggleZone(zone)}
              disabled={disabled}
              className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                selected
                  ? 'bg-[#578f82] text-white border-[#578f82]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#578f82]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {zone}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Drawn from the service areas you set in your profile.
      </p>
    </div>
  );
};

export default ServiceAreaPicker;
