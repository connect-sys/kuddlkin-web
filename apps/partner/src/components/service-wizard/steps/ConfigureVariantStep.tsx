/**
 * Step 3: Configure Variant
 * Location, mode, age, capacity, logistics per spec
 */

import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { ServiceArchetype, OfferingFormData } from '../../../types/service-wizard';
import { getFieldVisibility, CANCELLATION_POLICIES } from '../../../config/archetypes';

interface ConfigureVariantStepProps {
  archetype?: ServiceArchetype;
  data?: OfferingFormData;
  onChange: (data: OfferingFormData) => void;
}

export const ConfigureVariantStep: React.FC<ConfigureVariantStepProps> = ({
  archetype,
  data,
  onChange,
}) => {
  const [localData, setLocalData] = useState<OfferingFormData>(
    data || {
      location_id: '',
      archetype: archetype || 'workshop',
      mode: 'offline',
      virtual_link: '',
      tech_requirements: '',
      recording_policy: false,
      age_min: 5,
      age_max: 12,
      booking_cutoff_hours: 24,
      cancellation_policy: 'flexible',
      min_advance_booking_hours: 0,
      materials_provided: [],
    }
  );

  const [availablePincodes, setAvailablePincodes] = useState<string[]>([]);
  const [loadingPincodes, setLoadingPincodes] = useState(true);
  const [newPincode, setNewPincode] = useState('');
  // Whether the partner has manually overridden the auto-generated Batch Name.
  const [batchNameEdited, setBatchNameEdited] = useState(!!data?.variant_name);

  const selectedPincodes = localData.serviceable_pincodes || [];

  // Load provider's serviceable pincodes from profile
  useEffect(() => {
    const fetchPincodes = async () => {
      try {
        setLoadingPincodes(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/provider/profile`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const profile = data.provider || data;

          // serviceable_pincodes can be a comma-separated string or an array
          const raw = profile.serviceable_pincodes;
          const pincodes: string[] = Array.isArray(raw)
            ? raw.map((p: any) => String(p).trim())
            : typeof raw === 'string'
            ? raw.split(',').map((p) => p.trim())
            : [];

          setAvailablePincodes([...new Set(pincodes.filter(Boolean))]);
        }
      } catch (error) {
        console.error('Error fetching pincodes:', error);
      } finally {
        setLoadingPincodes(false);
      }
    };

    fetchPincodes();
  }, []);

  // Keep location_id in sync with selected pincodes
  const updatePincodes = (pincodes: string[]) => {
    const updated = {
      ...localData,
      serviceable_pincodes: pincodes,
      location_id: pincodes.join(','),
    };
    setLocalData(updated);
    onChange(updated);
  };

  const togglePincode = (pincode: string) => {
    if (selectedPincodes.includes(pincode)) {
      updatePincodes(selectedPincodes.filter((p) => p !== pincode));
    } else {
      updatePincodes([...selectedPincodes, pincode]);
    }
  };

  const selectAllPincodes = () => {
    const allSelected = availablePincodes.every((p) => selectedPincodes.includes(p));
    updatePincodes(allSelected ? [] : [...new Set([...selectedPincodes, ...availablePincodes])]);
  };

  const addPincode = () => {
    const pin = newPincode.trim();
    if (!/^\d{6}$/.test(pin)) return;
    if (!availablePincodes.includes(pin)) {
      setAvailablePincodes((prev) => [...prev, pin]);
    }
    if (!selectedPincodes.includes(pin)) {
      updatePincodes([...selectedPincodes, pin]);
    }
    setNewPincode('');
  };

  const fieldVisibility = archetype ? getFieldVisibility(archetype, localData.mode) : {
    per_session_capacity: false,
    cohort_capacity: false,
    pass_type: false,
    availability_windows: false,
    session_length: false,
    buffer_time: false,
    virtual_link: false,
    tech_requirements: false,
    recording_policy: false,
    physical_location: false,
    hybrid_capacity_split: false,
  };

  const handleChange = (field: keyof OfferingFormData, value: any) => {
    const updated = { ...localData, [field]: value };
    setLocalData(updated);
    onChange(updated);
  };

  if (!archetype) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600">Please select a program type first</p>
      </div>
    );
  }

  const inputCls =
    'w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#578F82] focus:border-transparent';
  const labelCls = 'block text-xs font-medium text-gray-700 mb-1';

  // Batch Name auto-generates from {age} · {mode} · {location} · {timing}.
  // Timing is filled in Step 3; here we build the age/mode/location part.
  const modeLabel = localData.mode
    ? localData.mode.charAt(0).toUpperCase() + localData.mode.slice(1)
    : '';
  const autoBatchName = [
    localData.age_min != null && localData.age_max != null
      ? `${localData.age_min}-${localData.age_max} yrs`
      : '',
    modeLabel,
    selectedPincodes[0] || '',
  ]
    .filter(Boolean)
    .join(' · ');

  // Keep Batch Name synced to the auto value until the partner overrides it.
  useEffect(() => {
    if (!batchNameEdited && autoBatchName && localData.variant_name !== autoBatchName) {
      const updated = { ...localData, variant_name: autoBatchName };
      setLocalData(updated);
      onChange(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBatchName, batchNameEdited]);

  return (
    <div className="space-y-3">
      {/* Service Pincodes */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls + ' mb-0'}>
            Service Pincodes <span className="text-red-500">*</span>
          </label>
          {availablePincodes.length > 0 && (
            <button
              type="button"
              onClick={selectAllPincodes}
              className="text-xs font-medium text-[#578F82] hover:underline"
            >
              {availablePincodes.every((p) => selectedPincodes.includes(p))
                ? 'Clear all'
                : 'Select all'}
            </button>
          )}
        </div>

        {loadingPincodes ? (
          <div className="flex items-center gap-2 py-1.5 px-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#578F82]"></div>
            <span className="text-xs text-gray-500">Loading pincodes...</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {[...new Set([...availablePincodes, ...selectedPincodes])].map((pincode) => {
              const isSelected = selectedPincodes.includes(pincode);
              return (
                <button
                  key={pincode}
                  type="button"
                  onClick={() => togglePincode(pincode)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-[#578F82] text-white border-[#578F82]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#578F82]'
                  }`}
                >
                  {pincode}
                  {isSelected && <X className="w-3 h-3" />}
                </button>
              );
            })}
            {/* Inline add */}
            <input
              type="text"
              inputMode="numeric"
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPincode();
                }
              }}
              placeholder="Add pincode"
              className="w-28 px-2.5 py-1 border border-gray-300 rounded-full text-xs focus:ring-2 focus:ring-[#578F82] focus:border-transparent"
            />
            <button
              type="button"
              onClick={addPincode}
              disabled={!/^\d{6}$/.test(newPincode.trim())}
              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#578F82] text-white hover:bg-[#467063] disabled:bg-gray-200 disabled:text-gray-400"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Mode + Age Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>
            Mode <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {['online', 'offline', 'hybrid'].map((mode) => (
              <button
                key={mode}
                onClick={() => handleChange('mode', mode)}
                className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-all ${
                  localData.mode === mode
                    ? 'border-[#578F82] bg-[#578F82]/5 text-[#578F82]'
                    : 'border-gray-200 text-gray-700 hover:border-[#578F82]/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>
            Age Range <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={localData.age_min}
              onChange={(e) => handleChange('age_min', parseInt(e.target.value))}
              onBlur={() => onChange(localData)}
              min={0}
              max={100}
              placeholder="Min"
              className={inputCls}
            />
            <input
              type="number"
              value={localData.age_max}
              onChange={(e) => handleChange('age_max', parseInt(e.target.value))}
              onBlur={() => onChange(localData)}
              min={0}
              max={100}
              placeholder="Max"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Mode-specific fields */}
      {(fieldVisibility.virtual_link || fieldVisibility.tech_requirements) && (
        <div className="grid grid-cols-2 gap-3">
          {fieldVisibility.virtual_link && (
            <div>
              <label className={labelCls}>
                Virtual Meeting Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={localData.virtual_link || ''}
                onChange={(e) => handleChange('virtual_link', e.target.value)}
                onBlur={() => onChange(localData)}
                placeholder="https://zoom.us/j/..."
                className={inputCls}
              />
            </div>
          )}
          {fieldVisibility.tech_requirements && (
            <div>
              <label className={labelCls}>Tech Requirements (Optional)</label>
              <input
                type="text"
                value={localData.tech_requirements || ''}
                onChange={(e) => handleChange('tech_requirements', e.target.value)}
                onBlur={() => onChange(localData)}
                placeholder="e.g., Stable internet, webcam"
                className={inputCls}
              />
            </div>
          )}
        </div>
      )}

      {fieldVisibility.recording_policy && (
        <label className="flex items-center gap-2 text-xs text-gray-700">
          <input
            type="checkbox"
            checked={localData.recording_policy}
            onChange={(e) => handleChange('recording_policy', e.target.checked)}
            className="w-3.5 h-3.5 accent-[#578F82]"
          />
          Sessions will be recorded
        </label>
      )}

      {/* Capacity */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
          Capacity
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {fieldVisibility.per_session_capacity && !fieldVisibility.cohort_capacity && (
            <div>
              <label className={labelCls}>
                Per-session Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={localData.per_session_capacity || ''}
                onChange={(e) => handleChange('per_session_capacity', parseInt(e.target.value))}
                onBlur={() => onChange(localData)}
                min={1}
                placeholder={archetype === 'appointment' ? '1 (locked)' : '12'}
                disabled={archetype === 'appointment'}
                className={inputCls + ' disabled:bg-gray-100'}
              />
            </div>
          )}

          {fieldVisibility.cohort_capacity && (
            <>
              <div>
                <label className={labelCls}>
                  Total seats in this Batch <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={localData.cohort_capacity || ''}
                  onChange={(e) => handleChange('cohort_capacity', parseInt(e.target.value))}
                  onBlur={() => onChange(localData)}
                  min={1}
                  placeholder="15"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Per-session override (Optional)</label>
                <input
                  type="number"
                  value={localData.per_session_capacity || ''}
                  onChange={(e) => handleChange('per_session_capacity', parseInt(e.target.value))}
                  onBlur={() => onChange(localData)}
                  min={1}
                  placeholder="Defaults to cohort capacity"
                  className={inputCls}
                />
              </div>
            </>
          )}

          {fieldVisibility.hybrid_capacity_split && (
            <>
              <div>
                <label className={labelCls}>
                  Online Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={localData.online_capacity || ''}
                  onChange={(e) => handleChange('online_capacity', parseInt(e.target.value))}
                  onBlur={() => onChange(localData)}
                  min={0}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>
                  Offline Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={localData.offline_capacity || ''}
                  onChange={(e) => handleChange('offline_capacity', parseInt(e.target.value))}
                  onBlur={() => onChange(localData)}
                  min={0}
                  className={inputCls}
                />
              </div>
            </>
          )}

          <div>
            <label className={labelCls}>Min Participants (Optional)</label>
            <input type="number" placeholder="4" min={1} className={inputCls} />
          </div>
          <label className="flex items-center gap-2 text-xs text-gray-700 self-end pb-1.5">
            <input type="checkbox" className="w-3.5 h-3.5 accent-[#578F82]" />
            Enable waitlist
          </label>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
          Booking Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Cancellation Policy <span className="text-red-500">*</span>
            </label>
            <select
              value={localData.cancellation_policy}
              onChange={(e) => handleChange('cancellation_policy', e.target.value)}
              onBlur={() => onChange(localData)}
              className={inputCls}
            >
              {Object.entries(CANCELLATION_POLICIES).map(([key, policy]) => (
                <option key={key} value={key}>
                  {policy.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>
              Booking Cutoff (hours before) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={localData.booking_cutoff_hours}
              onChange={(e) => handleChange('booking_cutoff_hours', parseInt(e.target.value))}
              onBlur={() => onChange(localData)}
              min={0}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Optional details */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
          Optional
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Instructor</label>
            <input
              type="text"
              value={localData.instructor_name || ''}
              onChange={(e) => handleChange('instructor_name', e.target.value)}
              onBlur={() => onChange(localData)}
              placeholder="Instructor name"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>What to Bring</label>
            <input
              type="text"
              value={localData.what_to_bring || ''}
              onChange={(e) => handleChange('what_to_bring', e.target.value)}
              onBlur={() => onChange(localData)}
              placeholder="e.g., Water bottle, notebook"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Auto-generated */}
      <div className="border-t pt-3">
        <h3 className="text-xs font-semibold text-gray-900 mb-1.5 uppercase tracking-wide">
          Auto-generated
        </h3>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls + ' mb-0'}>
            Batch Name <span className="text-gray-400">(editable, single source of truth)</span>
          </label>
          {batchNameEdited && autoBatchName && (
            <button
              type="button"
              onClick={() => {
                setBatchNameEdited(false);
                handleChange('variant_name', autoBatchName);
              }}
              className="text-xs font-medium text-[#578F82] hover:underline"
            >
              Reset to auto
            </button>
          )}
        </div>
        <input
          type="text"
          value={localData.variant_name ?? ''}
          onChange={(e) => {
            setBatchNameEdited(true);
            handleChange('variant_name', e.target.value);
          }}
          onBlur={() => onChange(localData)}
          placeholder={autoBatchName || 'e.g., 5-7 yrs · Offline · Saket'}
          className={inputCls + ' font-medium'}
        />
        <p className="text-xs text-gray-400 mt-1">
          Auto-generated from age · mode · location · timing. You can customize it.
        </p>
      </div>
    </div>
  );
};
