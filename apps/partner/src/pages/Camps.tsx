import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Tent, Users, CalendarDays, MapPin, Clock, Loader2, X, ChevronDown, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';
import ServiceImageUpload from '../components/services/ServiceImageUpload';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CAMP_TYPES = [
  { value: 'summer_camp', label: 'Summer Camp' },
  { value: 'winter_camp', label: 'Winter Camp' },
  { value: 'adventure_camp', label: 'Adventure Camp' },
  { value: 'art_camp', label: 'Art & Craft Camp' },
  { value: 'sports_camp', label: 'Sports Camp' },
  { value: 'coding_camp', label: 'Coding Camp' },
  { value: 'dance_camp', label: 'Dance Camp' },
  { value: 'music_camp', label: 'Music Camp' },
  { value: 'theatre_camp', label: 'Theatre Camp' },
  { value: 'other', label: 'Other' },
];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  full: 'bg-orange-100 text-orange-700',
  inactive: 'bg-gray-100 text-gray-600',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

interface Camp {
  id: string;
  title: string;
  description: string;
  camp_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  max_members: number;
  current_enrolled: number;
  enrolled_count: number;
  price: number;
  price_type: string;
  age_min: number;
  age_max: number;
  location: string;
  city: string;
  status: string;
  schedule_time: string;
  image_urls: string[];
  features: string[];
  is_full: boolean;
  slots_remaining: number;
}

interface PricingSlot {
  id: string;
  label: string;
  age_min?: number;
  age_max?: number;
  duration_minutes?: number;
  start_time?: string;
  end_time?: string;
  price: number;
}

const emptyForm = {
  title: '', description: '', camp_type: 'summer_camp',
  start_date: '', end_date: '',
  schedule_start_time: '', schedule_end_time: '',
  schedule_time: '', // kept for backwards compatibility on submit
  booking_closes_at: '',
  schedule_days: '', max_members: 20, price: 0, price_type: 'camp',
  age_min: 4, age_max: 16, location: '', address: '', city: '', pincode: '',
  features: '',
  pricing_slots: [] as PricingSlot[],
};

// Subtract one hour from a HH:MM string. Used to suggest a default booking cutoff.
const oneHourBefore = (hhmm: string): string => {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setHours(d.getHours() - 1);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default function Camps() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Camp | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [campImages, setCampImages] = useState<string[]>([]);
  const [campPrimaryImage, setCampPrimaryImage] = useState<string | undefined>();

  useEffect(() => { fetchCamps(); }, []);

  const getToken = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please login first');
      return '';
    }
    return token;
  };

  const fetchCamps = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partner/camps`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.success) setCamps(data.camps || []);
    } catch { toast.error('Failed to load camps'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Price 0 is allowed (free camp); only block missing or negative prices.
    if (!form.title || !form.start_date || !form.end_date || !form.max_members) {
      toast.error('Please fill required fields');
      return;
    }
    if (form.price == null || isNaN(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Enter a valid price (0 or greater)');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        max_members: parseInt(String(form.max_members)),
        price: parseFloat(String(form.price)),
        age_min: parseInt(String(form.age_min)),
        age_max: parseInt(String(form.age_max)),
        features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        image_urls: campImages,
        primary_image_url: campPrimaryImage || campImages[0] || null,
        // Multi-slot pricing + new schedule fields (camps_pricing_slots.sql)
        schedule_start_time: form.schedule_start_time || form.schedule_time || null,
        schedule_end_time:   form.schedule_end_time   || null,
        booking_closes_at:   form.booking_closes_at   || null,
        pricing_slots:       Array.isArray(form.pricing_slots) ? form.pricing_slots : [],
        ...(editingCamp ? { camp_id: editingCamp.id } : {})
      };

      const url = `${API_BASE_URL}/api/camps`;
      const method = editingCamp ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) { toast.error(data.message || 'Failed to save camp'); return; }

      toast.success(editingCamp ? 'Camp updated!' : 'Camp created!');
      setShowForm(false);
      setEditingCamp(null);
      setForm(emptyForm);
      setCampImages([]);
      setCampPrimaryImage(undefined);
      fetchCamps();
    } catch { toast.error('Something went wrong'); }
    finally { setSaving(false); }
  };

  const openEdit = (camp: Camp) => {
    setEditingCamp(camp);
    const startT = (camp as any).schedule_start_time || camp.schedule_time || '';
    const endT   = (camp as any).schedule_end_time   || '';
    const closeT = (camp as any).booking_closes_at   || oneHourBefore(startT);
    let slots: PricingSlot[] = [];
    try {
      const raw = (camp as any).pricing_slots;
      if (Array.isArray(raw)) slots = raw;
      else if (typeof raw === 'string' && raw) slots = JSON.parse(raw);
    } catch { slots = []; }

    setForm({
      title: camp.title, description: camp.description || '', camp_type: camp.camp_type,
      start_date: camp.start_date, end_date: camp.end_date,
      schedule_start_time: startT,
      schedule_end_time: endT,
      schedule_time: camp.schedule_time || '',
      booking_closes_at: closeT,
      schedule_days: '',
      max_members: camp.max_members, price: camp.price, price_type: camp.price_type || 'camp',
      age_min: camp.age_min || 4, age_max: camp.age_max || 16,
      location: camp.location || '', address: '', city: camp.city || '', pincode: '',
      features: Array.isArray(camp.features) ? camp.features.join(', ') : '',
      pricing_slots: slots,
    });
    const existingImgs = Array.isArray(camp.image_urls) ? camp.image_urls : [];
    setCampImages(existingImgs);
    setCampPrimaryImage(existingImgs[0]);
    setShowForm(true);
  };

  const filteredCamps = camps.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'completed') return c.status === 'completed';
    return true;
  });

  const enrolled = camps.reduce((sum, c) => sum + (c.enrolled_count || c.current_enrolled || 0), 0);
  const totalRevenue = camps.reduce((sum, c) => {
    const count = c.enrolled_count || c.current_enrolled || 0;
    return sum + (count * c.price);
  }, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camps Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage summer, winter, and adventure camps</p>
        </div>
        <Button
          onClick={() => navigate('/camps/create')}
          className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Create Camp
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Camps', value: camps.length, icon: Tent, color: 'bg-purple-50 text-purple-600' },
          { label: 'Active', value: camps.filter(c => c.status === 'active').length, icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Total Enrolled', value: enrolled, icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-orange-50 text-orange-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {['all', 'active', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Camp cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredCamps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <Tent className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">No camps yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create your first camp to start enrolling participants</p>
          <Button onClick={() => navigate('/camps/create')} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Create Camp
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCamps.map(camp => {
            const enrolled = camp.enrolled_count || camp.current_enrolled || 0;
            const pct = Math.min(100, Math.round((enrolled / camp.max_members) * 100));
            return (
              <div key={camp.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{camp.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {CAMP_TYPES.find(t => t.value === camp.camp_type)?.label || camp.camp_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[camp.status] || 'bg-gray-100 text-gray-500'}`}>
                      {camp.status}
                    </span>
                    <button onClick={() => navigate(`/camps/create?campId=${camp.id}`, { state: { camp } })} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Enrollment bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Enrolled: {enrolled}/{camp.max_members}</span>
                    <span className={pct >= 100 ? 'text-red-500 font-medium' : pct >= 75 ? 'text-orange-500' : 'text-green-600'}>
                      {pct >= 100 ? 'Full' : `${camp.max_members - enrolled} spots left`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 75 ? 'bg-orange-400' : 'bg-green-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                    {camp.start_date} → {camp.end_date} ({camp.duration_days || '?'} days)
                  </div>
                  {camp.schedule_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> {camp.schedule_time}
                    </div>
                  )}
                  {camp.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> {camp.city}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-400">Ages {camp.age_min}–{camp.age_max} yrs</span>
                    <span className="font-semibold text-indigo-700 text-sm">₹{camp.price?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Manage Batches (Camp Architecture v2.0) */}
                <button
                  onClick={() => navigate(`/manage/camp/${camp.id}`)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700"
                >
                  Manage Batches
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editingCamp ? 'Edit Camp' : 'Create New Camp'}</h2>
              <button onClick={() => { setShowForm(false); setEditingCamp(null); }} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Title + Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Camp Title *</label>
                  <input
                    required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Summer Art Camp 2026"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Camp Type *</label>
                  <div className="relative">
                    <select
                      value={form.camp_type} onChange={e => setForm(f => ({ ...f, camp_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      {CAMP_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Start Time</label>
                  <input
                    type="time"
                    value={form.schedule_start_time}
                    onChange={e => {
                      const v = e.target.value;
                      setForm(f => ({
                        ...f,
                        schedule_start_time: v,
                        schedule_time: v, // keep legacy field in sync for backwards compatibility
                        // Auto-suggest booking cutoff = 1h before start (only if user hasn't typed one)
                        booking_closes_at: f.booking_closes_at || oneHourBefore(v),
                      }));
                    }}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Schedule end + booking cutoff */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule End Time</label>
                  <input
                    type="time"
                    value={form.schedule_end_time}
                    onChange={e => setForm(f => ({ ...f, schedule_end_time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking closes at
                    {form.schedule_start_time && (
                      <span className="ml-2 text-xs text-gray-400">
                        suggested {oneHourBefore(form.schedule_start_time)}
                      </span>
                    )}
                  </label>
                  <input
                    type="time"
                    value={form.booking_closes_at}
                    onChange={e => setForm(f => ({ ...f, booking_closes_at: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. 08:00"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    required type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    required type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Members + Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Members *</label>
                  <input
                    required type="number" min="1" value={form.max_members} onChange={e => setForm(f => ({ ...f, max_members: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    required type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Type</label>
                  <div className="relative">
                    <select
                      value={form.price_type} onChange={e => setForm(f => ({ ...f, price_type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="camp">Per Camp</option>
                      <option value="per_day">Per Day</option>
                      <option value="per_week">Per Week</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Ages */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Age (years)</label>
                  <input
                    type="number" min="1" value={form.age_min} onChange={e => setForm(f => ({ ...f, age_min: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Age (years)</label>
                  <input
                    type="number" min="1" value={form.age_max} onChange={e => setForm(f => ({ ...f, age_max: +e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Multi-slot pricing: optional. Lets the partner publish variants priced
                  differently by age, duration or timing (e.g. 4–6 yrs morning ₹999,
                  7–10 yrs afternoon ₹1499). Leave empty to use the single Price above. */}
              <div className="border border-dashed border-[#578F82]/40 rounded-2xl p-4 space-y-3 bg-[#F6FBF9]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Pricing slots (optional)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Add variants priced by age, duration or timing. Leave empty if a single price is fine.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      pricing_slots: [
                        ...f.pricing_slots,
                        { id: `slot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, label: `Slot ${f.pricing_slots.length + 1}`, age_min: f.age_min, age_max: f.age_max, duration_minutes: 60, start_time: '', end_time: '', price: 0 },
                      ],
                    }))}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#578F82] text-white hover:opacity-90"
                  >
                    + Add slot
                  </button>
                </div>

                {form.pricing_slots.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No pricing slots yet — the single Price above will be used.</p>
                ) : (
                  <div className="space-y-3">
                    {form.pricing_slots.map((slot, idx) => (
                      <div key={slot.id} className="bg-white rounded-xl ring-1 ring-gray-200 p-3 grid grid-cols-2 md:grid-cols-7 gap-2 items-end">
                        <div className="col-span-2 md:col-span-2">
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Label</label>
                          <input
                            type="text"
                            value={slot.label}
                            onChange={e => {
                              const v = e.target.value;
                              setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, label: v } : s) }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                            placeholder="Morning batch"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Age min</label>
                          <input
                            type="number" min="0"
                            value={slot.age_min ?? ''}
                            onChange={e => {
                              const v = e.target.value === '' ? undefined : +e.target.value;
                              setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, age_min: v } : s) }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Age max</label>
                          <input
                            type="number" min="0"
                            value={slot.age_max ?? ''}
                            onChange={e => {
                              const v = e.target.value === '' ? undefined : +e.target.value;
                              setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, age_max: v } : s) }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">Start</label>
                          <input
                            type="time"
                            value={slot.start_time || ''}
                            onChange={e => {
                              const v = e.target.value;
                              setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, start_time: v } : s) }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-gray-500 mb-1">End</label>
                          <input
                            type="time"
                            value={slot.end_time || ''}
                            onChange={e => {
                              const v = e.target.value;
                              setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, end_time: v } : s) }));
                            }}
                            className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">Price ₹</label>
                            <input
                              type="number" min="0"
                              value={slot.price}
                              onChange={e => {
                                const v = +e.target.value;
                                setForm(f => ({ ...f, pricing_slots: f.pricing_slots.map((s, i) => i === idx ? { ...s, price: v } : s) }));
                              }}
                              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, pricing_slots: f.pricing_slots.filter((_, i) => i !== idx) }))}
                            className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center text-lg leading-none"
                            aria-label="Remove slot"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Venue</label>
                  <input
                    value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Stance Dance Studio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. New Delhi"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Describe the camp activities..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features / Highlights</label>
                <input
                  value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Comma-separated: Physical fitness, Team building, Creativity"
                />
                <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
              </div>

              {/* Camp Images */}
              <div className="border-t border-gray-100 pt-4">
                <ServiceImageUpload
                  serviceId=""
                  uploadEndpoint="/api/camps/upload-image"
                  existingImages={campImages}
                  primaryImage={campPrimaryImage}
                  onImagesUpdate={(imgs, primary) => { setCampImages(imgs); setCampPrimaryImage(primary); }}
                  maxImages={5}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCamp(null); setCampImages([]); setCampPrimaryImage(undefined); }}
                  className="flex-1 border border-teal-200 bg-white text-teal-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {saving ? 'Saving...' : editingCamp ? 'Update Camp' : 'Create Camp'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
