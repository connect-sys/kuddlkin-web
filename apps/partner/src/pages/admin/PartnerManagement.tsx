import React, { useState, useEffect } from 'react';
import {
  Users, Search, UserPlus, Eye, Check, X, Calendar, Phone,
  MapPin, Briefcase, Trash2, Settings, RefreshCw, ChevronDown,
  Tent, Shield, ShieldCheck, ShieldX, MoreVertical
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import PartnerCredentialsModal from '../../components/admin/PartnerCredentialsModal';
import CompleteProfileModal from '../../components/modals/CompleteProfileModal';
import { useNavigate } from 'react-router-dom';

interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
  kycStatus: string;
  isActive: boolean;
  profileImageUrl: string;
  servicesCount: number;
  campsCount: number;
  services: { id: string; name: string; price: number; status: string }[];
  camps: { id: string; name: string; price: number; status: string }[];
  createdAt: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'approved') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <ShieldCheck className="w-3 h-3" /> Verified
    </span>
  );
  if (status === 'rejected') return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
      <ShieldX className="w-3 h-3" /> Rejected
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
      <Shield className="w-3 h-3" /> Pending
    </span>
  );
};

const PartnerManagement: React.FC = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [createdPartnerCredentials, setCreatedPartnerCredentials] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);

  const handleModalSubmit = async (formData: any) => {
    setCreateLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/create-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const result = await response.json();
        setCreatedPartnerCredentials({ name: result.partner.name, email: result.partner.email, temporaryPassword: result.temporaryPassword });
        setShowCreateModal(false);
        setShowCredentialsModal(true);
        fetchPartners();
      } else {
        const err = await response.json();
        alert(`Error creating partner: ${err.message}`);
      }
    } catch (e) {
      alert('Failed to create partner. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok && data.success && data.partners) {
        setPartners(data.partners.map((p: any) => ({
          id: p.id,
          name: p.name || 'N/A',
          email: p.email || 'N/A',
          phone: p.phone || 'N/A',
          businessName: p.business_name || 'N/A',
          address: p.address || '',
          city: p.city || '',
          state: p.state || '',
          kycStatus: p.kyc_status || 'pending',
          isActive: !!p.is_active,
          profileImageUrl: p.profile_image_url || p.profile_picture || '',
          servicesCount: p.services_count || 0,
          campsCount: p.camps_count || 0,
          services: p.services || [],
          camps: p.camps || [],
          status: p.kyc_status === 'verified' ? 'approved' : (p.kyc_status === 'rejected' ? 'rejected' : 'pending'),
          createdAt: p.created_at || new Date().toISOString()
        })));
      } else {
        setError(data.message || 'Failed to fetch partners');
      }
    } catch (e) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePartner = async (partnerId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/verify`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'verified', documentStatuses: {}, profileCompletion: 100 })
      });
      if (response.ok) {
        setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, status: 'approved' as const } : p));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to approve partner');
      }
    } catch { alert('Failed to approve partner'); }
    setOpenMenuId(null);
  };

  const handleRejectPartner = async (partnerId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, status: 'rejected' as const } : p));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to reject partner');
      }
    } catch { alert('Failed to reject partner'); }
    setOpenMenuId(null);
  };

  const handleDeletePartner = async (partnerId: string, partnerName: string) => {
    if (!confirm(`Delete partner "${partnerName}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/partners/${partnerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        setPartners(prev => prev.filter(p => p.id !== partnerId));
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to delete partner');
      }
    } catch { alert('Failed to delete partner'); }
    setOpenMenuId(null);
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.businessName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: partners.length,
    pending: partners.filter(p => p.status === 'pending').length,
    approved: partners.filter(p => p.status === 'approved').length,
    rejected: partners.filter(p => p.status === 'rejected').length,
  };

  // Loading
  if (loading) return (
    <div className="flex items-center justify-center h-72">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82] mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Loading partners...</p>
      </div>
    </div>
  );

  // Error
  if (error) return (
    <div className="flex items-center justify-center h-72">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">Failed to Load Partners</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchPartners} className="bg-[#578f82] hover:bg-[#578f82]/90 text-white gap-2">
          <RefreshCw className="w-4 h-4" /> Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" onClick={() => setOpenMenuId(null)}>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all registered partners</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#578f82] hover:bg-[#578f82]/90 text-white gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Create Partner
        </Button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Total', value: counts.all, color: 'bg-slate-100 text-slate-700' },
          { label: 'Pending', value: counts.pending, color: 'bg-amber-50 text-amber-700' },
          { label: 'Verified', value: counts.approved, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Rejected', value: counts.rejected, color: 'bg-red-50 text-red-700' },
        ] as const).map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color} cursor-pointer`} onClick={(e) => { e.stopPropagation(); setStatusFilter(s.label === 'Total' ? 'all' : s.label === 'Verified' ? 'approved' : s.label.toLowerCase() as any); }}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email or business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-white border-gray-200 rounded-lg"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="appearance-none h-10 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#578f82]/30 focus:border-[#578f82]"
          >
            <option value="all">All Status ({counts.all})</option>
            <option value="pending">Pending ({counts.pending})</option>
            <option value="approved">Verified ({counts.approved})</option>
            <option value="rejected">Rejected ({counts.rejected})</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <Button variant="outline" size="sm" onClick={fetchPartners} className="h-10 gap-2 border-gray-200">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Partner Cards */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 text-center py-16">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {searchTerm || statusFilter !== 'all' ? 'No partners match your filters' : 'No partners yet'}
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filter' : 'Create your first partner to get started'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)} className="bg-[#578f82] hover:bg-[#578f82]/90 text-white gap-2">
              <UserPlus className="w-4 h-4" /> Create Partner
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Partner</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Business</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Services & Camps</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Joined</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50/70 transition-colors">

                    {/* Partner Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {partner.profileImageUrl ? (
                          <img src={partner.profileImageUrl} alt={partner.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#578f82] to-[#3d6b60] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                            {(partner.name || 'P').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{partner.name}</p>
                          <p className="text-xs text-gray-400 truncate">{partner.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Business */}
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-gray-800">{partner.businessName}</p>
                      {(partner.city || partner.state) && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {[partner.city, partner.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </td>

                    {/* Services & Camps */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/partners/${partner.id}/services`); }}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                        >
                          <Briefcase className="w-3 h-3" /> {partner.servicesCount}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/admin/partners/${partner.id}/services`); }}
                          className="inline-flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors"
                        >
                          <Tent className="w-3 h-3" /> {partner.campsCount}
                        </button>
                      </div>
                      {partner.services.length > 0 && (
                        <div className="mt-1.5 space-y-0.5">
                          {partner.services.slice(0, 2).map(s => (
                            <p key={s.id} className="text-xs text-gray-400 truncate max-w-[150px]">
                              • {s.name} <span className="text-[#578f82] font-medium">₹{s.price}</span>
                            </p>
                          ))}
                          {partner.services.length > 2 && <p className="text-xs text-gray-300">+{partner.services.length - 2} more</p>}
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        {partner.phone}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={partner.status} />
                      {!partner.isActive && (
                        <p className="text-xs text-gray-400 mt-1">Inactive</p>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(partner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        {/* Manage services */}
                        <button
                          onClick={() => navigate(`/admin/partners/${partner.id}/services`)}
                          title="Manage Services & Camps"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#578f82]/40 text-[#578f82] hover:bg-[#578f82]/10 transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>

                        {/* View docs */}
                        <button
                          title="View Documents"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Context menu */}
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === partner.id ? null : partner.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {openMenuId === partner.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                              {partner.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePartner(partner.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                                  >
                                    <Check className="w-4 h-4" /> Approve Partner
                                  </button>
                                  <button
                                    onClick={() => handleRejectPartner(partner.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                  >
                                    <X className="w-4 h-4" /> Reject Partner
                                  </button>
                                  <div className="border-t border-gray-100 my-1" />
                                </>
                              )}
                              <button
                                onClick={() => handleDeletePartner(partner.id, partner.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Partner
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-gray-600">{filteredPartners.length}</span> of <span className="font-semibold text-gray-600">{partners.length}</span> partners
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <CompleteProfileModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); fetchPartners(); }}
        onSubmit={() => {}}
        loading={createLoading}
        mode="admin"
      />
      <PartnerCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        partnerData={createdPartnerCredentials}
      />
    </div>
  );
};

export default PartnerManagement;
