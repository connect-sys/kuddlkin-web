/**
 * Service Detail page — Camp Architecture v2.0 control center.
 * Lands here after publishing Batch #1. Lists all batches, supports bulk
 * actions, and launches the "Add Another Batch" diff modal.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BATCH_DIFF_FIELDS, SERVICE_LOCKED_FIELDS } from '../config/archetypes';

interface Batch {
  id: string;
  batch_name: string;
  mode: string;
  age_min?: number;
  age_max?: number;
  price: number;
  total_seats?: number;
  booked_seats?: number;
  instructor?: string;
  status: string;
  schedule?: any;
}

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 text-gray-400',
};

const ManageServicePage: React.FC = () => {
  const { entityType, id } = useParams<{ entityType: string; id: string }>();
  const navigate = useNavigate();

  const [parent, setParent] = useState<any>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [busy, setBusy] = useState(false);

  const isCamp = entityType === 'camp';

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/service-detail/${entityType}/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setParent(data.parent);
        setBatches(data.batches || []);
      } else {
        toast.error(data.message || 'Failed to load');
      }
    } catch {
      toast.error('Failed to load service detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, id]);

  const parentName = parent?.title || parent?.name || (isCamp ? 'Camp' : 'Service');
  const liveCount = batches.filter((b) => b.status === 'live').length;
  const totalBookings = batches.reduce((sum, b) => sum + (b.booked_seats || 0), 0);

  const toggleSelect = (bid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(bid) ? next.delete(bid) : next.add(bid);
      return next;
    });
  };

  const runBulk = async (action: string, value?: number) => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/batches/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action, batch_ids: [...selected], value }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || 'Done');
        setSelected(new Set());
        load();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch {
      toast.error('Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handlePriceUpdate = () => {
    const input = window.prompt('New price for the selected batch(es) (₹):');
    if (input == null) return;
    const value = parseFloat(input);
    if (isNaN(value) || value < 0) {
      toast.error('Enter a valid price');
      return;
    }
    runBulk('price_update', value);
  };

  const openAddBatch = (diffKeys: string[]) => {
    const providerId = parent?.provider_id || '';
    const fromBatch = batches[0]?.id || '';
    const base = isCamp ? '/camps/create' : '/services/create';
    navigate(
      `${base}?partnerId=${providerId}&addBatch=1&parentId=${id}` +
        `&from=${fromBatch}&diff=${diffKeys.join(',')}`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-7 h-7 text-[#578f82] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{parentName}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#578f82]/10 text-[#578f82] capitalize">
              {isCamp ? 'Camp' : 'Service'}
            </span>
            <span className="text-sm text-gray-500">
              {batches.length} batch{batches.length === 1 ? '' : 'es'} · {liveCount} live ·{' '}
              {totalBookings} booking{totalBookings === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={batches.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm bg-[#578f82] text-white hover:bg-[#467063] disabled:bg-gray-200 disabled:text-gray-400 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Another Batch
        </button>
      </div>

      {/* Bulk action bar */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-2">
        <span className="text-sm text-gray-600">
          {selected.size > 0 ? `${selected.size} selected` : 'Manage Batches'}
        </span>
        {selected.size > 0 && (
          <div className="flex items-center gap-3 ml-auto text-sm">
            <button disabled={busy} onClick={() => runBulk('pause')} className="text-gray-700 hover:text-[#578f82] disabled:opacity-50">Pause</button>
            <button disabled={busy} onClick={() => runBulk('resume')} className="text-gray-700 hover:text-[#578f82] disabled:opacity-50">Resume</button>
            <button disabled={busy} onClick={() => runBulk('duplicate')} className="text-gray-700 hover:text-[#578f82] disabled:opacity-50">Duplicate</button>
            <button disabled={busy} onClick={handlePriceUpdate} className="text-gray-700 hover:text-[#578f82] disabled:opacity-50">Price update</button>
            <button disabled={busy} onClick={() => runBulk('archive')} className="text-red-600 hover:text-red-700 disabled:opacity-50">Archive</button>
          </div>
        )}
      </div>

      {/* Batches table */}
      {batches.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-500">No batches yet.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                <th className="py-2.5 px-3 w-8"></th>
                <th className="py-2.5 px-3">Batch</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">Seats</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => toggleSelect(b.id)}
                      className="w-4 h-4 accent-[#578f82]"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-gray-900">{b.batch_name || 'Untitled batch'}</p>
                    {b.instructor && (
                      <p className="text-xs text-gray-500">{b.instructor}</p>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">
                    ₹{(b.price || 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">
                    {(b.booked_seats || 0)} / {b.total_seats ?? '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                        STATUS_STYLES[b.status] || STATUS_STYLES.draft
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && batches[0] && (
        <AddBatchModal
          fromBatchName={batches[0].batch_name || 'Batch #1'}
          fromBatch={batches[0]}
          onClose={() => setShowAddModal(false)}
          onProceed={(diffKeys) => {
            setShowAddModal(false);
            openAddBatch(diffKeys);
          }}
        />
      )}
    </div>
  );
};

/* ---- Add Another Batch — diff modal ---- */
const AddBatchModal: React.FC<{
  fromBatchName: string;
  fromBatch: Batch;
  onClose: () => void;
  onProceed: (diffKeys: string[]) => void;
}> = ({ fromBatchName, fromBatch, onClose, onProceed }) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const currentValue: Record<string, string> = {
    mode: `Currently: ${fromBatch.mode || '—'}`,
    age: `Currently: ${fromBatch.age_min ?? '?'}–${fromBatch.age_max ?? '?'} yrs`,
    pricing: `Currently: ₹${(fromBatch.price || 0).toLocaleString()}`,
    timing: 'Currently: as configured',
    instructor: `Currently: ${fromBatch.instructor || '—'}`,
  };

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-900">
            What's different from{' '}
            <span className="text-[#578f82]">'{fromBatchName}'</span>?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Tick what changes — Step 2 will pre-fill and unlock only those fields.
          </p>

          <div className="space-y-2 mt-4">
            {BATCH_DIFF_FIELDS.map((f) => (
              <label
                key={f.key}
                className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checked.has(f.key)
                    ? 'border-[#578f82] bg-[#578f82]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked.has(f.key)}
                  onChange={() => toggle(f.key)}
                  className="w-4 h-4 mt-0.5 accent-[#578f82]"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-500">{currentValue[f.key]}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 bg-amber-50 border-l-4 border-amber-300 rounded px-3 py-2">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Locked:</span> {SERVICE_LOCKED_FIELDS.join(', ')} —
              these belong to the Service, not the Batch.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 bg-gray-50 px-5 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onProceed([...checked])}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[#578f82] text-white hover:bg-[#467063]"
          >
            Open wizard at Step 2 ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageServicePage;
