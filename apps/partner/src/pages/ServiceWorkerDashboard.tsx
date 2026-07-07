import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays, ClipboardList, LogOut, UserCheck, QrCode, RefreshCw,
  Phone, User, MapPin, Clock, CheckCircle2, AlertCircle, Tent, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface WorkerData {
  full_name: string;
  username: string;
  phone?: string;
  email?: string;
}

interface Permission {
  can_view: number;
  can_edit: number;
  can_delete: number;
}

interface Booking {
  id: string;
  service_name: string;
  parent_name: string;
  parent_phone: string;
  booking_date: string;
  status: string;
  total_amount: number;
  invoice_id?: string;
  invoice_qr_url?: string;
}

interface CampBooking {
  id: string;
  camp_title: string;
  camp_type: string;
  parent_name: string;
  parent_phone: string;
  child_name: string;
  selected_start_date: string;
  selected_end_date: string;
  booking_status: string;
  total_amount: number;
  invoice_id?: string;
  invoice_qr_url?: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  attended: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-600',
};

export default function ServiceWorkerDashboard() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [permissions, setPermissions] = useState<Record<string, Permission>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [campBookings, setCampBookings] = useState<CampBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'camps'>('bookings');
  const [qrModal, setQrModal] = useState<{ url: string; invoiceId: string } | null>(null);

  useEffect(() => {
    const storedWorker = localStorage.getItem('worker_data');
    const token = localStorage.getItem('worker_token');
    if (!token || !storedWorker) {
      navigate('/worker/login');
      return;
    }
    setWorker(JSON.parse(storedWorker));
    fetchDashboard(token);
  }, []);

  const fetchDashboard = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/service-workers/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) {
          localStorage.removeItem('worker_token');
          localStorage.removeItem('worker_data');
          navigate('/worker/login');
          return;
        }
        toast.error('Failed to load dashboard');
        return;
      }
      setPermissions(data.permissions || {});
      setBookings(data.bookings || []);
      setCampBookings(data.camp_bookings || []);
    } catch {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('worker_token');
    localStorage.removeItem('worker_data');
    navigate('/worker/login');
    toast.success('Logged out');
  };

  const canViewBookings = permissions['bookings']?.can_view || permissions['all']?.can_view;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{worker?.full_name || 'Worker'}</p>
              <p className="text-xs text-gray-400">{worker?.phone || worker?.username}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Permission summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Access Permissions</h2>
          {Object.keys(permissions).length === 0 ? (
            <p className="text-sm text-gray-400">No permissions assigned yet. Contact your partner.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Object.entries(permissions).map(([type, perm]) => (
                <div key={type} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="capitalize">{type}</span>
                  <span className="text-indigo-400">
                    ({[perm.can_view && 'view', perm.can_edit && 'edit', perm.can_delete && 'delete'].filter(Boolean).join(', ')})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No access message */}
        {!canViewBookings && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">Limited Access</p>
              <p className="text-amber-600 text-sm mt-0.5">You don't have permission to view bookings. Contact your partner to grant access.</p>
            </div>
          </div>
        )}

        {canViewBookings && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'bookings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                <ClipboardList className="w-4 h-4" />
                Service Bookings
                {bookings.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{bookings.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('camps')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'camps' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              >
                <Tent className="w-4 h-4" />
                Camp Bookings
                {campBookings.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{campBookings.length}</span>
                )}
              </button>
            </div>

            {/* Refresh */}
            <div className="flex justify-end">
              <button
                onClick={() => fetchDashboard(localStorage.getItem('worker_token')!)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* Service Bookings */}
            {activeTab === 'bookings' && (
              <div className="space-y-3">
                {bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No bookings found</p>
                  </div>
                ) : bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{b.service_name || 'Service Booking'}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{b.id.slice(-8).toUpperCase()}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{b.parent_name || 'Customer'}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.parent_phone || '-'}</div>
                      <div className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{b.booking_date}</div>
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">₹{b.total_amount?.toLocaleString()}</div>
                    </div>
                    {b.invoice_qr_url && (
                      <button
                        onClick={() => setQrModal({ url: b.invoice_qr_url!, invoiceId: b.invoice_id || '' })}
                        className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" /> View Invoice QR
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Camp Bookings */}
            {activeTab === 'camps' && (
              <div className="space-y-3">
                {campBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <Tent className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No camp bookings found</p>
                  </div>
                ) : campBookings.map(b => (
                  <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{b.camp_title}</p>
                        <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full mt-1">
                          {b.camp_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[b.booking_status] || 'bg-gray-100 text-gray-600'}`}>
                        {b.booking_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{b.parent_name || 'Parent'}</div>
                      <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.parent_phone || '-'}</div>
                      <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-purple-400" />Child: {b.child_name || 'N/A'}</div>
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">₹{b.total_amount?.toLocaleString()}</div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Clock className="w-3.5 h-3.5" />
                        {b.selected_start_date} → {b.selected_end_date}
                      </div>
                    </div>
                    {b.invoice_qr_url && (
                      <button
                        onClick={() => setQrModal({ url: b.invoice_qr_url!, invoiceId: b.invoice_id || '' })}
                        className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scan Invoice QR
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center gap-2 mb-4">
              <QrCode className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Invoice QR Code</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 font-mono">{qrModal.invoiceId}</p>
            <img src={qrModal.url} alt="Invoice QR" className="w-48 h-48 mx-auto rounded-xl border border-gray-200" />
            <p className="text-xs text-gray-400 mt-4">Scan this QR code to view booking details</p>
            <button
              onClick={() => setQrModal(null)}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
