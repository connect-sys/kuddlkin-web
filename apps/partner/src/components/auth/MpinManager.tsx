import React, { useEffect, useState } from 'react';
import { Lock, Shield, ChevronRight, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Partner-side MPIN setup tile. Mirrors the customer-web component but uses
 * the partner endpoints (`/api/partner/mpin/...`) and the `token` localStorage key.
 */
interface MpinManagerProps {
  /** Partner profile must be verified before MPIN can be set. */
  profileComplete: boolean;
  /** Partner's phone — used only for the status lookup. */
  phone?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'token';

const MpinManager: React.FC<MpinManagerProps> = ({ profileComplete, phone }) => {
  const [hasMpin, setHasMpin] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!phone) { setLoadingStatus(false); return; }
      try {
        const url = `${API_BASE}/api/auth/mpin/status?phone=${encodeURIComponent(phone)}&role=partner`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && data.success) setHasMpin(!!data.hasMpin);
      } catch { /* ignore */ } finally {
        if (!cancelled) setLoadingStatus(false);
      }
    })();
    return () => { cancelled = true; };
  }, [phone]);

  const closeModal = () => {
    setOpen(false);
    setStep('enter');
    setMpin('');
    setConfirmMpin('');
  };

  const handleSave = async () => {
    if (mpin !== confirmMpin) { toast.error("MPINs don't match"); return; }
    if (!/^\d{4,6}$/.test(mpin)) { toast.error('Use 4–6 digits'); return; }
    try {
      setSaving(true);
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/partner/mpin/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ mpin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to set MPIN');
      toast.success(hasMpin ? 'MPIN updated' : 'MPIN set — log in faster next time');
      setHasMpin(true);
      closeModal();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set MPIN');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove MPIN? You will need to use OTP to log in.')) return;
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_BASE}/api/partner/mpin`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to remove MPIN');
      toast.success('MPIN removed');
      setHasMpin(false);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove MPIN');
    }
  };

  return (
    <>
      <div className={`flex items-start gap-4 p-5 rounded-xl border ${profileComplete ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/50'}`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${profileComplete ? 'bg-[#578f82]/10 text-[#578f82]' : 'bg-gray-100 text-gray-400'}`}>
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">Login MPIN</h3>
            {hasMpin && !loadingStatus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {profileComplete
              ? 'Set a 4–6 digit MPIN to skip OTP on future logins. You can change or remove it anytime.'
              : 'Finish KYC verification before setting an MPIN.'}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => profileComplete && setOpen(true)}
              disabled={!profileComplete}
              className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition ${
                profileComplete
                  ? 'bg-[#578f82] text-white hover:bg-[#4a7c70] shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              {hasMpin ? 'Change MPIN' : 'Set MPIN'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {hasMpin && profileComplete && (
              <button
                onClick={handleRemove}
                className="text-sm font-semibold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-lg transition"
              >
                Remove MPIN
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur flex items-center justify-center p-4" onClick={closeModal}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{hasMpin ? 'Change MPIN' : 'Set up your MPIN'}</h2>
                <p className="text-sm text-gray-500 mt-1">Use 4–6 digits. Avoid 1234, 0000 or your DOB.</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {step === 'enter' ? (
              <>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter new MPIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  autoFocus
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] py-3 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578f82]"
                  placeholder="••••"
                />
                <button
                  onClick={() => {
                    if (!/^\d{4,6}$/.test(mpin)) { toast.error('Use 4–6 digits'); return; }
                    setStep('confirm');
                  }}
                  className="w-full mt-5 py-3 rounded-xl bg-[#578f82] hover:bg-[#4a7c70] text-white font-semibold shadow-md transition-colors"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Re-enter MPIN to confirm</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  autoFocus
                  value={confirmMpin}
                  onChange={(e) => setConfirmMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-3xl tracking-[0.5em] py-3 bg-gray-50 rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578f82]"
                  placeholder="••••"
                />
                <div className="flex items-center gap-2 mt-5">
                  <button
                    onClick={() => { setStep('enter'); setConfirmMpin(''); }}
                    className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-[#578f82] hover:bg-[#4a7c70] text-white font-semibold shadow-md transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : 'Save MPIN'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MpinManager;
