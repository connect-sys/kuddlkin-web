import React, { useEffect, useRef, useState } from 'react';
import { Search, X, MapPin } from 'lucide-react';

interface Pincode {
  pincode: string;
  city: string;
  state: string;
  area?: string;
}

interface PincodePickerProps {
  selected: string[];
  onChange: (pincodes: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const PincodePicker: React.FC<PincodePickerProps> = ({
  selected,
  onChange,
  label = 'Serviceable Pincodes',
  placeholder = 'Search pincodes by area, city, or pincode...',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [allPincodes, setAllPincodes] = useState<Pincode[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load pincodes from local JSON file
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Import pincodes from local JSON file
        const pincodesData = await import('../config/pincodes.json');
        const pincodes = pincodesData.default || pincodesData;
        
        // Transform to match expected format
        const formattedPincodes: Pincode[] = pincodes.map((p: any) => ({
          pincode: p.pincode,
          city: p.city || p.zone || 'Delhi',
          state: p.state || 'Delhi',
          area: p.area || ''
        }));
        
        setAllPincodes(formattedPincodes);
      } catch (err) {
        console.warn('Failed to load pincodes', err);
        setAllPincodes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSelected = (pincode: string) => selected.includes(pincode);

  const addPincode = (pincode: string) => {
    if (disabled || isSelected(pincode)) return;
    onChange([...selected, pincode]);
    setQuery('');
    inputRef.current?.focus();
  };

  const removePincode = (pincode: string) => {
    if (disabled) return;
    onChange(selected.filter(p => p !== pincode));
  };

  // Filter pincodes based on search query
  const filteredPincodes = query.trim()
    ? allPincodes.filter((p) => 
        p.pincode.includes(query) ||
        p.city.toLowerCase().includes(query.toLowerCase()) ||
        p.area?.toLowerCase().includes(query.toLowerCase()) ||
        p.state.toLowerCase().includes(query.toLowerCase())
      )
    : allPincodes;

  // Show only unselected pincodes in dropdown
  const availablePincodes = filteredPincodes.filter((p) => !isSelected(p.pincode));

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Selected Pincodes */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selected.map((pincode) => {
            const pincodeData = allPincodes.find(p => p.pincode === pincode);
            return (
              <div
                key={pincode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#578f82] text-white rounded-lg text-sm font-medium"
              >
                <MapPin size={14} />
                <span>{pincode}</span>
                {pincodeData && (
                  <span className="text-xs opacity-90">({pincodeData.city})</span>
                )}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => removePincode(pincode)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => !disabled && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent text-sm disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading pincodes…</div>
          )}
          
          {!loading && availablePincodes.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              {query ? 'No pincodes found' : selected.length === allPincodes.length ? 'All pincodes selected' : 'No pincodes available'}
            </div>
          )}
          
          {!loading &&
            availablePincodes.slice(0, 50).map((p) => (
              <button
                key={p.pincode}
                type="button"
                onClick={() => addPincode(p.pincode)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#578f82]" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.pincode}</div>
                    <div className="text-xs text-gray-500">
                      {p.area ? `${p.area}, ` : ''}{p.city}, {p.state}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          
          {!loading && availablePincodes.length > 50 && (
            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
              Showing first 50 results. Type to search for more.
            </div>
          )}
        </div>
      )}

      {/* Count */}
      <p className="text-xs text-gray-500 mt-2">
        {selected.length > 0 
          ? `${selected.length} pincode(s) selected` 
          : 'No pincodes selected'}
      </p>
    </div>
  );
};

export default PincodePicker;
