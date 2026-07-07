import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ServiceType,
  ServiceTypeConfig,
  CategoryBlock,
  listServiceTypes,
  getServiceTypeConfig,
  CATEGORY_META
} from '../../api/serviceTypes';
import ServiceImageUpload from './ServiceImageUpload';
import ServicePreviewModal from './ServicePreviewModal';
import ServiceAreaPicker from './ServiceAreaPicker';
import AgeGroupPicker from './AgeGroupPicker';
import DaysPicker from './DaysPicker';

interface PartnerProfile {
  serviceTypeIds: string[];
  ageGroups: string[];
}

interface Props {
  partnerProfile: PartnerProfile;
  partnerPincodes: string[];
  initialData?: any; // The service object being edited
  onClose: () => void;
  onCreated: () => void;
  providerId?: string; // Admin override: create service on behalf of this partner
}

const DELIVERY_MODES = [
  { value: 'partner_venue',   label: "At partner's venue" },
  { value: 'parent_location', label: "At parent's location" },
  { value: 'online',          label: 'Online' },
  { value: 'hybrid',          label: 'Hybrid' }
];

const CANCELLATION_POLICIES = [
  { value: 'flexible', label: 'Flexible', wording: 'Full refund up to 24 hours before the booking.' },
  { value: 'standard', label: 'Standard', wording: '50% refund up to 48 hours before the booking.' },
  { value: 'strict',   label: 'Strict',   wording: 'Non-refundable within 72 hours of the booking.' }
];

// Trial-toggle keys are part of bloom blocks but only render for the 4 eligible service types.
const TRIAL_BLOCK_KEYS = new Set(['trial_class_available', 'trial_price', 'trial_first_booking_only']);

const AddServiceForm: React.FC<Props> = ({ partnerProfile, partnerPincodes, initialData, onClose, onCreated, providerId }) => {
  const [availableServiceTypes, setAvailableServiceTypes] = useState<ServiceTypeConfig[]>([]);
  const [serviceTypeId, setServiceTypeId] = useState<string>('');
  const [config, setConfig] = useState<ServiceTypeConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Universal core state (9 fields)
  const [title, setTitle] = useState('');
  const [ageBrackets, setAgeBrackets] = useState<string[]>([]);
  const [customAgeRange, setCustomAgeRange] = useState({ enabled: false, min: '', max: '' });
  const [description, setDescription] = useState('');
  const [pricingUnit, setPricingUnit] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [primaryImage, setPrimaryImage] = useState<string | undefined>();
  const [uploadingImages, setUploadingImages] = useState(false);

  // Dynamic block values, keyed by block.key
  const [blockValues, setBlockValues] = useState<Record<string, any>>({});

  const [showPreview, setShowPreview] = useState(false);

  const descriptionDirty = useRef(false);
  const titleDirty = useRef(false);

  // Load partner-scoped service types on mount.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const all = await listServiceTypes();
        if (!active) return;
        const scoped = partnerProfile.serviceTypeIds.length > 0
          ? all.filter((st) => partnerProfile.serviceTypeIds.includes(st.id))
          : all;
        setAvailableServiceTypes(scoped);
      } catch (err) {
        console.error('Failed to load service types', err);
        toast.error('Failed to load service types');
      }
    })();
    return () => { active = false; };
  }, [partnerProfile.serviceTypeIds]);

  // Populate initial data for editing.
  useEffect(() => {
    if (initialData) {
      setServiceTypeId(initialData.service_type_id || '');
      setTitle(initialData.name || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price?.toString() || '');
      setDuration(initialData.duration_minutes?.toString() || '');
      setCancellationPolicy(initialData.cancellation_policy || '');
      setImages(initialData.image_urls || []);
      setPrimaryImage(initialData.primary_image_url || undefined);
      
      const features = initialData.features || {};
      setPricingUnit(features.pricing_unit || '');
      setDeliveryMode(features.delivery_mode || '');
      setBlockValues(features.blocks || {});
      
      if (features.age_groups) {
        setAgeBrackets(features.age_groups.filter((ag: string) => !ag.startsWith('Custom:')));
        const custom = features.age_groups.find((ag: string) => ag.startsWith('Custom:'));
        if (custom) {
          const match = custom.match(/Custom: (\d+)–(\d+)/);
          if (match) {
            setCustomAgeRange({ enabled: true, min: match[1], max: match[2] });
          }
        }
      }
    }
  }, [initialData]);

  // When service type changes, fetch full config.
  useEffect(() => {
    if (!serviceTypeId) { setConfig(null); return; }
    let active = true;
    (async () => {
      try {
        const cfg = await getServiceTypeConfig(serviceTypeId);
        if (!active) return;
        setConfig(cfg);
        
        // Only reset block values if we're not in initial edit load for this type
        if (!initialData || initialData.service_type_id !== serviceTypeId) {
           // Reset block values for fresh service type choice.
           setBlockValues({});
           // If only one pricing option, auto-pick.
           if (cfg && cfg.pricing_unit_options.length === 1) setPricingUnit(cfg.pricing_unit_options[0].value);
        }
      } catch (err) {
        console.error('Failed to load service type config', err);
      }
    })();
    return () => { active = false; };
  }, [serviceTypeId, initialData]);

  const meta = config ? CATEGORY_META[config.category] : null;

  const setBlockValue = (key: string, value: any) =>
    setBlockValues((prev) => ({ ...prev, [key]: value }));

  const isBlockVisible = (block: CategoryBlock): boolean => {
    if (!block.conditional) return true;
    const { field, equals, in: inList, filled } = block.conditional;
    const source = field === '__delivery_mode' ? deliveryMode : blockValues[field];
    if (filled) {
      return Array.isArray(source) ? source.length > 0 : Boolean(source);
    }
    if (equals !== undefined) return source === equals;
    if (inList) return inList.includes(source);
    return true;
  };

  const isBlockRequired = (block: CategoryBlock): boolean => {
    if (!isBlockVisible(block)) return false;
    return block.required || Boolean(block.requiredWhenVisible);
  };

  const renderableBlocks = useMemo(() => {
    if (!config) return [];
    return config.blocks.filter((b) => {
      if (TRIAL_BLOCK_KEYS.has(b.key) && !config.show_trial_toggle) return false;
      return true;
    });
  }, [config]);

  const validate = (): string | null => {
    if (!serviceTypeId) return 'Pick a service type first';
    if (!title.trim()) return 'Service title is required';
    if (title.length > 80) return 'Service title must be 80 characters or fewer';
    if (ageBrackets.length === 0 && !customAgeRange.enabled) return 'Select at least one age group';
    if (customAgeRange.enabled && (!customAgeRange.min || !customAgeRange.max)) return 'Enter both custom age range values';
    if (!description.trim()) return 'Description is required';
    if (!pricingUnit) return 'Select a pricing unit';
    // Allow free services (price 0). Require the field to be filled and non-negative.
    if (price.trim() === '' || isNaN(Number(price)) || Number(price) < 0) return 'Enter a valid price (0 or greater)';
    if (!duration || Number(duration) <= 0) return 'Enter a valid duration in minutes';
    if (!deliveryMode) return 'Select a delivery mode';
    if (!cancellationPolicy) return 'Select a cancellation policy';
    // Images are now optional - no minimum required
    if (images.length > 6) return 'Maximum 6 service images allowed';

    for (const block of renderableBlocks) {
      if (!isBlockRequired(block)) continue;
      const v = blockValues[block.key];
      const empty =
        v === undefined || v === null || v === '' ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === 'object' && !Array.isArray(v) && Object.values(v).every((x) => !x));
      if (empty) return `"${block.label}" is required`;
    }
    return null;
  };

  const buildPayload = (status: 'draft' | 'submitted') => {
    if (!config) return null;
    const ageGroupsList = [
      ...ageBrackets,
      ...(customAgeRange.enabled && customAgeRange.min && customAgeRange.max
        ? [`Custom: ${customAgeRange.min}–${customAgeRange.max}`]
        : [])
    ];
    // Map service_type_id to subcategory_id (default to "other" for each category)
    const subcategoryMap: Record<string, string> = {
      // Adventure/Events
      'birthday_planners': 'adventure_kids_parties',
      'entertainment_performers': 'adventure_entertainment_live_performers',
      'party_decorators': 'adventure_party_decor_setups',
      // Bloom
      'art_craft_classes': 'bloom_arts_crafts',
      'sports_coaching': 'bloom_sports_fitness',
      'music_dance': 'bloom_music_dance',
      // Care
      'nanny_babysitter': 'care_nanny_babysitter',
      'lactation_postnatal': 'care_lactation_postnatal',
      'infant_postnatal_care': 'care_infant_postnatal',
      // Discover
      'workshops_skill_building': 'discover_workshops_skill_building',
    };
    const defaultSubcategoryByCategory: Record<string, string> = {
      'adventure': 'adventure_other',
      'bloom': 'bloom_other',
      'care': 'care_other',
      'discover': 'discover_other',
    };
    const subcategoryId = subcategoryMap[serviceTypeId] || defaultSubcategoryByCategory[config.category] || null;

    return {
      name: title.trim() || 'Untitled service',
      description: description.trim(),
      ...(providerId ? { provider_id: providerId } : {}),
      category_id: `cat_${config.category}`,
      subcategory_id: subcategoryId,
      service_type_id: serviceTypeId,
      price_type: 'fixed',
      price: Number(price) || 0,
      duration_minutes: Number(duration) || 0,
      cancellation_policy: cancellationPolicy,
      special_requirements: '',
      available_pincodes: partnerPincodes,
      image_urls: images,
      primary_image_url: primaryImage,
      status,
      features: {
        service_type_id: serviceTypeId,
        service_type_label: config.label,
        category_code: config.category,
        age_groups: ageGroupsList,
        custom_age_range: customAgeRange.enabled
          ? { min: customAgeRange.min, max: customAgeRange.max }
          : null,
        pricing_unit: pricingUnit,
        delivery_mode: deliveryMode,
        blocks: blockValues
      }
    };
  };

  const handleSubmit = async (status: 'draft' | 'submitted') => {
    if (status === 'submitted') {
      const err = validate();
      if (err) { toast.error(err); return; }
    } else if (!serviceTypeId) {
      toast.error('Pick a service type before saving a draft');
      return;
    }
    const payload = buildPayload(status);
    if (!payload) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }
      
      const url = initialData?.id 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/services/${initialData.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/services`;
        
      const method = initialData?.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.message || 'Failed to save service');
        return;
      }
      
      toast.success(status === 'draft' ? 'Saved as draft' : (initialData?.id ? 'Service updated' : 'Submitted for review'));
      onCreated();
    } catch (err: any) {
      console.error('Save service error', err);
      toast.error(err?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBlock = (block: CategoryBlock) => {
    if (!isBlockVisible(block)) return null;
    const required = isBlockRequired(block);
    const v = blockValues[block.key];
    const labelEl = (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {block.label} {required && <span className="text-red-500">*</span>}
      </label>
    );
    const helpEl = block.help ? <p className="text-xs text-gray-500 mt-1">{block.help}</p> : null;

    let input: React.ReactNode;
    switch (block.type) {
      case 'text':
        input = (
          <input
            type="text"
            value={v ?? ''}
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
          />
        );
        break;
      case 'textarea':
        input = (
          <textarea
            value={v ?? ''}
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
          />
        );
        break;
      case 'number':
        input = (
          <input
            type="number"
            value={v ?? ''}
            min="0"
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        );
        break;
      case 'currency':
        input = (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
            <input
              type="number"
              value={v ?? ''}
              min="0"
              onChange={(e) => setBlockValue(block.key, e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        );
        break;
      case 'date':
        input = (
          <input
            type="date"
            value={v ?? ''}
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        );
        break;
      case 'time':
        input = (
          <input
            type="time"
            value={v ?? ''}
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        );
        break;
      case 'date_with_time': {
        const obj = (v as { date?: string; time?: string }) ?? {};
        input = (
          <div className="flex gap-2">
            <input
              type="date"
              value={obj.date ?? ''}
              onChange={(e) => setBlockValue(block.key, { ...obj, date: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="time"
              value={obj.time ?? ''}
              onChange={(e) => setBlockValue(block.key, { ...obj, time: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        );
        break;
      }
      case 'multi_date': {
        const list: string[] = Array.isArray(v) ? v : [];
        input = (
          <div className="space-y-2">
            {list.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="date"
                  value={d}
                  onChange={(e) => {
                    const next = [...list]; next[i] = e.target.value;
                    setBlockValue(block.key, next);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setBlockValue(block.key, list.filter((_, j) => j !== i))}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >Remove</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setBlockValue(block.key, [...list, ''])}
              className="text-sm text-[#578f82] hover:underline"
            >+ Add date</button>
          </div>
        );
        break;
      }
      case 'date_range_with_daily_time': {
        const obj = (v as { start?: string; end?: string; dailyStart?: string; dailyEnd?: string }) ?? {};
        input = (
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={obj.start ?? ''} placeholder="Start"
              onChange={(e) => setBlockValue(block.key, { ...obj, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="date" value={obj.end ?? ''} placeholder="End"
              onChange={(e) => setBlockValue(block.key, { ...obj, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="time" value={obj.dailyStart ?? ''}
              onChange={(e) => setBlockValue(block.key, { ...obj, dailyStart: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="time" value={obj.dailyEnd ?? ''}
              onChange={(e) => setBlockValue(block.key, { ...obj, dailyEnd: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        );
        break;
      }
      case 'recurring_schedule': {
        const obj = (v as { days?: string[]; time?: string; frequency?: string }) ?? {};
        input = (
          <div className="space-y-2">
            <DaysPicker value={obj.days ?? []} onChange={(d) => setBlockValue(block.key, { ...obj, days: d })} />
            <div className="flex gap-2">
              <input type="time" value={obj.time ?? ''}
                onChange={(e) => setBlockValue(block.key, { ...obj, time: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg" />
              <select
                value={obj.frequency ?? ''}
                onChange={(e) => setBlockValue(block.key, { ...obj, frequency: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select frequency</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        );
        break;
      }
      case 'days_picker':
        input = <DaysPicker value={Array.isArray(v) ? v : []} onChange={(d) => setBlockValue(block.key, d)} />;
        break;
      case 'service_area':
        input = <ServiceAreaPicker value={Array.isArray(v) ? v : []} onChange={(z) => setBlockValue(block.key, z)} availableZones={partnerPincodes} />;
        break;
      case 'multi_select': {
        const list: string[] = Array.isArray(v) ? v : [];
        input = (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {block.options?.map((opt) => {
              const sel = list.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBlockValue(block.key, sel ? list.filter((x) => x !== opt.value) : [...list, opt.value])}
                  className={`px-3 py-2 rounded-lg text-sm border text-left ${sel ? 'bg-[#578f82] text-white border-[#578f82]' : 'bg-white border-gray-300'}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
        break;
      }
      case 'multi_select_with_custom': {
        const list: string[] = Array.isArray(v) ? v : [];
        input = (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {list.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-[#578f82]/10 text-[#578f82] rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setBlockValue(block.key, list.filter((x) => x !== tag))}
                    className="ml-1"
                  >×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Type and press Enter to add"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val && !list.includes(val)) setBlockValue(block.key, [...list, val]);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        );
        break;
      }
      case 'single_select':
        input = (
          <select
            value={v ?? ''}
            onChange={(e) => setBlockValue(block.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select…</option>
            {block.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
        break;
      case 'toggle':
        input = (
          <button
            type="button"
            onClick={() => setBlockValue(block.key, !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${v ? 'bg-[#578f82]' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        );
        break;
      case 'checkbox':
        input = (
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={Boolean(v)} onChange={(e) => setBlockValue(block.key, e.target.checked)} />
            <span className="text-sm text-gray-700">{block.label}</span>
          </label>
        );
        break;
      case 'file_upload':
        input = (
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple={block.multiple}
            onChange={(e) => setBlockValue(block.key, Array.from(e.target.files || []).map((f) => f.name))}
            className="w-full text-sm"
          />
        );
        break;
      case 'package_pair': {
        const obj = (v as { sessions?: string; price?: string }) ?? {};
        input = (
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Number of sessions" value={obj.sessions ?? ''}
              onChange={(e) => setBlockValue(block.key, { ...obj, sessions: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg" />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input type="number" placeholder="Package price" value={obj.price ?? ''}
                onChange={(e) => setBlockValue(block.key, { ...obj, price: e.target.value })}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        );
        break;
      }
      default:
        input = <div className="text-sm text-gray-400 italic">Unsupported field type: {block.type}</div>;
    }

    if (block.type === 'checkbox') {
      return <div key={block.key}>{input}{helpEl}</div>;
    }
    return (
      <div key={block.key}>
        {labelEl}
        {input}
        {helpEl}
      </div>
    );
  };

  const previewData = useMemo(() => ({
    name: title || 'Untitled service',
    description,
    category: config?.category ?? '',
    serviceType: config?.label ?? '',
    price: Number(price) || 0,
    pricingUnit,
    duration: Number(duration) || 0,
    deliveryMode,
    cancellationPolicy,
    images,
    primaryImage,
    ageGroups: [
      ...ageBrackets,
      ...(customAgeRange.enabled && customAgeRange.min && customAgeRange.max
        ? [`Custom: ${customAgeRange.min}–${customAgeRange.max}`]
        : [])
    ],
    capacity: { min: null, max: null },
    whatsIncluded: blockValues.whats_included,
    whatToBring: blockValues.what_to_bring
  }), [title, description, config, price, pricingUnit, duration, deliveryMode, cancellationPolicy, images, primaryImage, ageBrackets, customAgeRange, blockValues]);

  return (
    <div className="space-y-5">
      {/* Service Type Selection */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            Service Type <span className="text-red-500">*</span>
          </label>
          <select
            value={serviceTypeId}
            onChange={(e) => setServiceTypeId(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent bg-white"
          >
            <option value="">Select service type</option>
            {availableServiceTypes.map((st) => (
              <option key={st.id} value={st.id}>{st.label}</option>
            ))}
          </select>
          {availableServiceTypes.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">Your profile has no registered service types — update profile first.</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
            <div className="h-[42px] flex items-center">
              {meta ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm"
                  style={{ backgroundColor: meta.bg, color: meta.color }}>
                  Küddl {meta.label}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Auto-filled when you pick a service type</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {config && (
        <>
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-[#578f82] rounded-full"></span>
              Basic Information
            </h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Service Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                maxLength={80}
                onChange={(e) => { titleDirty.current = true; setTitle(e.target.value); }}
                placeholder={config.title_placeholder}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{title.length}/80 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => { descriptionDirty.current = true; setDescription(e.target.value); }}
                placeholder={config.description_placeholder}
                rows={4}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent resize-none"
              />
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age Group <span className="text-red-500">*</span>
              </label>
              <AgeGroupPicker
                selectedBrackets={ageBrackets}
                onBracketsChange={setAgeBrackets}
                customRange={customAgeRange}
                onCustomRangeChange={setCustomAgeRange}
                profileBrackets={partnerProfile.ageGroups}
              />
            </div>
          </div>

          {/* Pricing & Duration Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-[#578f82] rounded-full"></span>
              Pricing & Duration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pricing Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Pricing Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={pricingUnit}
                  onChange={(e) => setPricingUnit(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                >
                  <option value="">Select…</option>
                  {config.pricing_unit_options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {pricingUnit && (
                  <p className="text-xs text-gray-500 mt-1">
                    {config.pricing_unit_options.find((o) => o.value === pricingUnit)?.hint}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input
                    type="number"
                    value={price}
                    min="0"
                    placeholder="0"
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Duration (mins) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={duration}
                  min="0"
                  placeholder="60"
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Service Details Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-[#578f82] rounded-full"></span>
              Service Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Service Delivery Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Delivery Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                >
                  <option value="">Select delivery mode</option>
                  {DELIVERY_MODES.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              {/* Cancellation Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cancellation Policy <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                >
                  <option value="">Select policy</option>
                  {CANCELLATION_POLICIES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                {cancellationPolicy && (
                  <p className="text-xs text-gray-600 mt-1.5 bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="font-medium">Shown to parents:</span> <em>"{CANCELLATION_POLICIES.find((p) => p.value === cancellationPolicy)?.wording}"</em>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Service Images Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-[#578f82] rounded-full"></span>
              Service Images
              <span className="text-xs text-gray-500 font-normal normal-case tracking-normal">(Optional, up to 6 images, JPEG/PNG/WebP, max 5MB each)</span>
            </h3>
            <ServiceImageUpload
              serviceId={initialData?.id || ''}
              existingImages={images}
              primaryImage={primaryImage}
              onImagesUpdate={(imgs, primary) => { setImages(imgs); setPrimaryImage(primary); }}
            />
          </div>

          {/* Category-specific blocks */}
          {renderableBlocks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-[#578f82] rounded-full"></span>
                Additional Details for {config.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderableBlocks.map(renderBlock)}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t-2 border-gray-200 bg-gray-50 -mx-8 -mb-8 px-8 py-4 rounded-b-2xl mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg border border-gray-300 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={submitting || uploadingImages}
                className="px-5 py-2.5 border-2 border-[#578f82] text-[#578f82] hover:bg-[#578f82]/10 rounded-lg disabled:opacity-50 transition-colors font-medium"
              >
                💾 Save Draft
              </button>
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                disabled={!serviceTypeId}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-lg disabled:opacity-50 transition-colors font-medium"
              >
                👁️ Preview
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('submitted')}
                disabled={submitting || uploadingImages}
                className="px-6 py-2.5 bg-[#578f82] text-white rounded-lg hover:bg-[#4a7c70] disabled:opacity-50 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                {submitting ? '⏳ Submitting…' : '✓ Submit for Review'}
              </button>
            </div>
          </div>
        </>
      )}

      {showPreview && config && (
        <ServicePreviewModal service={previewData} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
};

export default AddServiceForm;
