import React, { useEffect, useRef, useState } from 'react';
import { Search, X, Plus } from 'lucide-react';
import {
  ServiceType,
  listServiceTypes,
  CATEGORY_META
} from '../api/serviceTypes';

interface Props {
  selected: ServiceType[];
  onChange: (next: ServiceType[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

const ServiceTypePicker: React.FC<Props> = ({
  selected,
  onChange,
  label = 'What service do you offer?',
  placeholder = 'Start typing — e.g. dance, therapy, birthday magician…',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [allServiceTypes, setAllServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load all service types on mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = listServiceTypes();
        setAllServiceTypes(data);
      } catch (err) {
        console.warn('Failed to load service types', err);
        setAllServiceTypes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const isSelected = (id: string) => selected.some((s) => s.id === id);

  const addType = (st: ServiceType) => {
    if (disabled || isSelected(st.id)) return;
    onChange([...selected, st]);
    setQuery('');
    inputRef.current?.focus();
  };

  const addCustomType = () => {
    if (disabled || !query.trim()) return;
    const customId = `other_${query.toLowerCase().replace(/\s+/g, '_')}`;
    if (isSelected(customId)) return;
    
    const customType: ServiceType = {
      id: customId,
      label: query.trim(),
      category: 'discover' // Default to discover category for custom types
    };
    onChange([...selected, customType]);
    setQuery('');
    inputRef.current?.focus();
  };

  const removeType = (id: string) => {
    if (disabled) return;
    onChange(selected.filter((s) => s.id !== id));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query.length === 0 && selected.length > 0) {
      removeType(selected[selected.length - 1].id);
    }
  };

  // Filter service types based on query
  const filteredTypes = query.trim()
    ? allServiceTypes.filter((st) => 
        st.label.toLowerCase().includes(query.toLowerCase()) ||
        st.category.toLowerCase().includes(query.toLowerCase())
      )
    : allServiceTypes;

  // Separate matched and unmatched, show matched first
  const matchedTypes = filteredTypes.filter((st) => !isSelected(st.id));
  const hasExactMatch = matchedTypes.some((st) => 
    st.label.toLowerCase() === query.toLowerCase()
  );
  const showAddCustom = query.trim() && !hasExactMatch;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      <div
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white focus-within:border-[#578f82] focus-within:ring-1 focus-within:ring-[#578f82] cursor-text min-h-[48px]"
      >
        <Search size={16} className="text-gray-400 flex-shrink-0" />

        {selected.map((st) => {
          const meta = CATEGORY_META[st.category];
          return (
            <span
              key={st.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {st.label}
              <span className="text-xs opacity-75">({meta.label})</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeType(st.id);
                  }}
                  className="hover:opacity-70"
                  aria-label={`Remove ${st.label}`}
                >
                  <X size={14} />
                </button>
              )}
            </span>
          );
        })}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            if (!disabled) {
              setQuery(e.target.value);
              setOpen(true);
            }
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selected.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[160px] border-0 outline-none text-sm bg-transparent py-1 disabled:cursor-not-allowed disabled:text-gray-400"
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Loading service types…</div>
          )}
          
          {/* Add custom option if query doesn't match any existing type */}
          {!loading && showAddCustom && (
            <button
              type="button"
              onClick={addCustomType}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#578f82]/5 hover:bg-[#578f82]/10 text-left border-b border-gray-100"
            >
              <Plus size={16} className="text-[#578f82]" />
              <span className="text-sm font-medium text-[#578f82]">
                Add "{query}" as Other
              </span>
            </button>
          )}

          {!loading && matchedTypes.length === 0 && !showAddCustom && (
            <div className="px-4 py-3 text-sm text-gray-500">
              {query ? 'No matches found' : 'No service types available'}
            </div>
          )}
          
          {!loading &&
            matchedTypes.map((st) => {
              const meta = CATEGORY_META[st.category];
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => addType(st)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                >
                  <span className="text-sm text-gray-900">{st.label}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ServiceTypePicker;
