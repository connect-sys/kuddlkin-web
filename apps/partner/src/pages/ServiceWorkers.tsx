import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, UserCheck, Shield, Users, Zap, Building2, CheckCircle2, Lock, Phone, Mail, User, Star, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Permission {
  permission_type: string;
  resource_id?: string;
  can_view: number;
  can_edit: number;
  can_delete: number;
}

interface ServiceWorker {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  is_active: number;
  created_at: string;
  permissions: Permission[];
}

interface Subscription {
  plan_type: string;
  max_workers: number;
  current_workers: number;
  can_add_more: boolean;
  billing_cycle?: string;
  subscription_end_date?: string;
}

interface SubscriptionPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  max_workers: number;
  monthly_price: number;
  yearly_price: number;
  features: string[];
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Users className="w-5 h-5" />,
  basic: <Zap className="w-5 h-5" />,
  premium: <Star className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
};

const PLAN_COLORS: Record<string, { bg: string; border: string; badge: string; button: string }> = {
  free: { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-700', button: 'bg-gray-800 hover:bg-gray-700 text-white' },
  basic: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', button: 'bg-blue-600 hover:bg-blue-700 text-white' },
  premium: { bg: 'bg-[#578f82]/10', border: 'border-[#578f82]/40', badge: 'bg-[#578f82]/20 text-[#578f82]', button: 'bg-[#578f82] hover:bg-[#467368] text-white' },
  enterprise: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
};

const ServiceWorkers: React.FC = () => {
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState<ServiceWorker | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    permissions: {
      bookings: { can_view: true, can_edit: true, can_delete: false },
      services: { can_view: false, can_edit: false, can_delete: false },
      customers: { can_view: false, can_edit: false, can_delete: false }
    }
  });

  useEffect(() => {
    fetchWorkers();
    fetchSubscription();
    fetchPlans();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/service-workers`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) setWorkers(data.workers || []);
    } catch (error) {
      toast.error('Failed to load service workers');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/partner/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setSubscription(data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription-plans`);
      const data = await response.json();
      if (data.success) setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handleUpgrade = async (planType: string) => {
    setUpgradingPlan(planType);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/partner/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: planType, billing_cycle: billingCycle })
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Upgraded to ${planType} plan!`);
        fetchSubscription();
      } else {
        toast.error(data.message || 'Failed to upgrade');
      }
    } catch (error) {
      toast.error('Failed to upgrade plan');
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const permissionsArray = Object.entries(formData.permissions).map(([type, perms]) => ({
        permission_type: type,
        can_view: perms.can_view ? 1 : 0,
        can_edit: perms.can_edit ? 1 : 0,
        can_delete: perms.can_delete ? 1 : 0
      }));

      const payload = {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        permissions: permissionsArray
      };

      const response = await fetch(`${API_BASE_URL}/api/service-workers`, {
        method: editingWorker ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editingWorker ? { ...payload, worker_id: editingWorker.id } : payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success(editingWorker ? 'Worker updated!' : 'Worker created!');
        setShowForm(false);
        setEditingWorker(null);
        resetForm();
        fetchWorkers();
        fetchSubscription();
      } else {
        toast.error(data.message || 'Failed to save worker');
      }
    } catch (error) {
      toast.error('Failed to save worker');
    }
  };

  const handleEdit = (worker: ServiceWorker) => {
    setEditingWorker(worker);
    const permsObj: any = {
      bookings: { can_view: false, can_edit: false, can_delete: false },
      services: { can_view: false, can_edit: false, can_delete: false },
      customers: { can_view: false, can_edit: false, can_delete: false }
    };
    worker.permissions.forEach(perm => {
      if (permsObj[perm.permission_type]) {
        permsObj[perm.permission_type] = {
          can_view: perm.can_view === 1,
          can_edit: perm.can_edit === 1,
          can_delete: perm.can_delete === 1
        };
      }
    });
    setFormData({ username: worker.username, password: '', full_name: worker.full_name, email: worker.email, phone: worker.phone, permissions: permsObj });
    setShowForm(true);
  };

  const handleDelete = async (workerId: string) => {
    if (!confirm('Are you sure you want to delete this service worker?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/service-workers?worker_id=${workerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) { toast.success('Worker deleted'); fetchWorkers(); fetchSubscription(); }
      else toast.error(data.message || 'Failed to delete worker');
    } catch (error) {
      toast.error('Failed to delete worker');
    }
  };

  const toggleWorkerStatus = async (worker: ServiceWorker) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/service-workers`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: worker.id, is_active: worker.is_active === 1 ? 0 : 1 })
      });
      const data = await response.json();
      if (data.success) { toast.success(worker.is_active === 1 ? 'Worker deactivated' : 'Worker activated'); fetchWorkers(); }
      else toast.error(data.message || 'Failed to update status');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '', password: '', full_name: '', email: '', phone: '',
      permissions: {
        bookings: { can_view: true, can_edit: true, can_delete: false },
        services: { can_view: false, can_edit: false, can_delete: false },
        customers: { can_view: false, can_edit: false, can_delete: false }
      }
    });
  };

  const getPermissionBadges = (permissions: Permission[]) => {
    return permissions.filter(p => p.can_view === 1).map(p => p.permission_type);
  };

  const currentPlan = subscription?.plan_type || 'free';
  const currentWorkers = subscription?.current_workers ?? workers.length;
  const maxWorkers = subscription?.max_workers ?? 2;
  const canAddMore = currentWorkers < maxWorkers;
  const usagePercent = Math.min((currentWorkers / maxWorkers) * 100, 100);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Workers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and control their access</p>
        </div>
        <div className="relative group">
          <Button
            onClick={() => {
              if (!canAddMore) {
                toast.error(`You've reached your limit of ${maxWorkers} workers. Please upgrade your plan.`);
                return;
              }
              setEditingWorker(null);
              resetForm();
              setShowForm(true);
            }}
            disabled={!canAddMore}
            className={`gap-2 ${canAddMore ? 'bg-[#578f82] hover:bg-[#467368]' : 'bg-gray-300 cursor-not-allowed opacity-60'}`}
          >
            {canAddMore ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            Add Service Worker
          </Button>
          {!canAddMore && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              You've used {currentWorkers}/{maxWorkers} workers. Upgrade to add more.
            </div>
          )}
        </div>
      </div>

      {/* Current Plan Usage Banner */}
      <div className={`rounded-2xl border p-5 ${PLAN_COLORS[currentPlan]?.bg} ${PLAN_COLORS[currentPlan]?.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${PLAN_COLORS[currentPlan]?.badge}`}>
              {PLAN_ICONS[currentPlan]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 capitalize">{currentPlan} Plan</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[currentPlan]?.badge}`}>Current</span>
              </div>
              <p className="text-sm text-gray-500">{currentWorkers} of {maxWorkers} workers used</p>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Workers</span>
              <span className="font-medium">{currentWorkers}/{maxWorkers}</span>
            </div>
            <div className="h-2 bg-white/70 rounded-full overflow-hidden border border-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 100 ? 'bg-red-500' : usagePercent >= 75 ? 'bg-amber-500' : 'bg-[#578f82]'}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          {!canAddMore && (
            <button
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-1.5 text-sm font-medium text-[#578f82] hover:underline"
            >
              Upgrade Plan <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#578f82]" />
        </div>
      ) : workers.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">No service workers yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first team member to get started</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {workers.map((worker) => {
            const permBadges = getPermissionBadges(worker.permissions);
            return (
              <div key={worker.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-[#578f82]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#578f82] font-bold text-base">{worker.full_name?.charAt(0)?.toUpperCase() || 'W'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{worker.full_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${worker.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {worker.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{worker.username}</span>
                      {worker.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{worker.email}</span>}
                      {worker.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{worker.phone}</span>}
                    </div>
                    {permBadges.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs text-gray-400 self-center">Access:</span>
                        {permBadges.map(p => (
                          <span key={p} className="text-xs bg-[#578f82]/10 text-[#578f82] px-2 py-0.5 rounded-full capitalize font-medium">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleWorkerStatus(worker)}
                      title={worker.is_active === 1 ? 'Deactivate' : 'Activate'}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      {worker.is_active === 1 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(worker)}
                      title="Edit"
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(worker.id)}
                      title="Delete"
                      className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subscription Plans */}
      <div id="plans-section" className="pt-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Choose a plan that fits your team size</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-[#578f82]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Yearly <span className="text-[#578f82] font-semibold">Save 17%</span>
          </span>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Loading plans...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const colors = PLAN_COLORS[plan.plan_type] || PLAN_COLORS.free;
              const isCurrent = currentPlan === plan.plan_type;
              const price = billingCycle === 'yearly' ? Math.round(plan.yearly_price / 12) : plan.monthly_price;
              const isPopular = plan.plan_type === 'premium';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col transition-all ${isCurrent ? `${colors.border} ${colors.bg}` : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#578f82] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Most Popular
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 right-4 bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current
                    </div>
                  )}

                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${colors.badge}`}>
                    {PLAN_ICONS[plan.plan_type]}
                  </div>

                  <h3 className="font-bold text-gray-900 text-base">{plan.plan_name}</h3>
                  <div className="mt-2 mb-4">
                    {plan.monthly_price === 0 ? (
                      <span className="text-3xl font-bold text-gray-900">Free</span>
                    ) : (
                      <div>
                        <span className="text-3xl font-bold text-gray-900">₹{price}</span>
                        <span className="text-sm text-gray-400">/mo</span>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-gray-400 mt-0.5">Billed ₹{plan.yearly_price}/yr</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-white/70">
                    <Users className="w-4 h-4 text-[#578f82]" />
                    <span className="text-sm font-semibold text-gray-700">
                      {plan.max_workers >= 999 ? 'Unlimited' : `Up to ${plan.max_workers}`} workers
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6 flex-1">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#578f82] flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && handleUpgrade(plan.plan_type)}
                    disabled={isCurrent || upgradingPlan === plan.plan_type}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : `${colors.button} cursor-pointer`}`}
                  >
                    {isCurrent ? 'Current Plan' : upgradingPlan === plan.plan_type ? 'Upgrading...' : plan.monthly_price === 0 ? 'Downgrade' : 'Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Worker Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full my-8 shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingWorker ? 'Edit Service Worker' : 'Add Service Worker'}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">Fill in the details and set access permissions</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username *</label>
                  <input
                    type="text" required disabled={!!editingWorker}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="e.g. worker001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password {editingWorker ? '(optional)' : '*'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!editingWorker}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-transparent pr-9"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text" required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#578f82] focus:border-transparent"
                />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-[#578f82]" />
                  <span className="text-sm font-semibold text-gray-900">Access Permissions</span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'bookings', label: 'Bookings', sub: 'Can Edit (Start/Complete bookings)' },
                    { key: 'services', label: 'Services', sub: 'Can Edit Services' },
                    { key: 'customers', label: 'Customer Information', sub: null }
                  ].map(({ key, label, sub }) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-3">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.permissions as any)[key].can_view}
                          onChange={(e) => setFormData({ ...formData, permissions: { ...formData.permissions, [key]: { ...(formData.permissions as any)[key], can_view: e.target.checked, ...(!e.target.checked ? { can_edit: false } : {}) } } })}
                          className="rounded text-[#578f82] focus:ring-[#578f82] w-4 h-4"
                        />
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                      </label>
                      {sub && (formData.permissions as any)[key].can_view && (
                        <label className="flex items-center gap-2.5 ml-6 mt-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.permissions as any)[key].can_edit}
                            onChange={(e) => setFormData({ ...formData, permissions: { ...formData.permissions, [key]: { ...(formData.permissions as any)[key], can_edit: e.target.checked } } })}
                            className="rounded text-[#578f82] focus:ring-[#578f82] w-3.5 h-3.5"
                          />
                          <span className="text-xs text-gray-600">{sub}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1"
                  onClick={() => { setShowForm(false); setEditingWorker(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#578f82] hover:bg-[#467368]">
                  {editingWorker ? 'Update Worker' : 'Create Worker'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceWorkers;
