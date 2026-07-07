import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRight, Mail, Phone, User, Building2, FileText, Upload, X } from 'lucide-react';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

interface FormState {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  description: string;
  photos: File[];
  documents: File[];
}

const initial: FormState = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  description: '',
  photos: [],
  documents: [],
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const BecomePartner: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const addFiles = (key: 'photos' | 'documents', files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const max = 5;
    const next = [...form[key], ...list].slice(0, max);
    update(key, next as any);
  };

  const removeFile = (key: 'photos' | 'documents', idx: number) => {
    update(key, form[key].filter((_, i) => i !== idx) as any);
  };

  const isValid = () =>
    form.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
    /^[+]?\d[\d\s-]{7,14}$/.test(form.phone.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid()) {
      toast.error('Please fill name, valid email and phone');
      return;
    }
    try {
      setSubmitting(true);

      const [photoPayload, docPayload] = await Promise.all([
        Promise.all(form.photos.map(async (f) => ({
          name: f.name, type: f.type, size: f.size, data: await fileToBase64(f),
        }))),
        Promise.all(form.documents.map(async (f) => ({
          name: f.name, type: f.type, size: f.size, data: await fileToBase64(f),
        }))),
      ]);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/partner-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          companyName: form.companyName.trim(),
          description: form.description.trim(),
          photos: photoPayload,
          documents: docPayload,
          source: 'become_partner_form',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');
      setSubmitted(true);
      toast.success("Thanks! We'll be in touch shortly.");
    } catch (err: any) {
      toast.error(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <PublicHeader />

      <main className="pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#CF956D] mb-2">
              Become a partner
            </span>
            <h1
              className="text-4xl md:text-5xl font-bold text-[#312B4C] leading-tight"
              style={{ fontFamily: '"adineue PRO", sans-serif' }}
            >
              Tell us about your <span className="text-[#578F82]">work</span>
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Share a few details and our team will reach out to onboard you. Prefer to do it
              yourself? You can also{' '}
              <button
                onClick={() => navigate('/mobile-verification')}
                className="text-[#578F82] font-semibold underline-offset-2 hover:underline"
              >
                create your partner account now
              </button>
              .
            </p>
          </div>

          {submitted ? (
            <div className="bg-white rounded-3xl ring-1 ring-gray-200/70 shadow-sm p-10 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application received</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Thanks {form.name.split(' ')[0]}! Our partnerships team will reach out to{' '}
                <span className="font-semibold">{form.email}</span> shortly.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2.5 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Back to home
                </button>
                <button
                  onClick={() => navigate('/mobile-verification')}
                  className="px-6 py-2.5 rounded-full bg-[#578F82] text-white font-semibold hover:opacity-90 inline-flex items-center gap-2"
                >
                  Create your account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              className="bg-white rounded-3xl ring-1 ring-gray-200/70 shadow-sm p-6 sm:p-10 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-3 py-3 bg-white rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578F82]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-3 bg-white rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578F82]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full pl-9 pr-3 py-3 bg-white rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578F82]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Company / Business name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => update('companyName', e.target.value)}
                      placeholder="Optional"
                      className="w-full pl-9 pr-3 py-3 bg-white rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578F82]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe your services
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    rows={5}
                    placeholder="What do you offer? Age groups you work with, areas you cover, experience, etc."
                    className="w-full pl-9 pr-3 py-3 bg-white rounded-xl ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-[#578F82] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileDropzone
                  label="Photos (optional)"
                  accept="image/*"
                  files={form.photos}
                  onAdd={(fs) => addFiles('photos', fs)}
                  onRemove={(i) => removeFile('photos', i)}
                  hint="Up to 5 images of your work"
                />
                <FileDropzone
                  label="Documents (optional)"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  files={form.documents}
                  onAdd={(fs) => addFiles('documents', fs)}
                  onRemove={(i) => removeFile('documents', i)}
                  hint="PDFs, certifications, brochures"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-xs text-gray-500">
                  By submitting, you agree to be contacted by the Kuddl partnerships team.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/mobile-verification')}
                    className="px-5 py-2.5 rounded-full text-[#578F82] font-semibold hover:bg-[#578F82]/10"
                  >
                    Create account instead
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid() || submitting}
                    className="px-7 py-3 rounded-full bg-[#578F82] text-white font-semibold shadow-md hover:opacity-90 inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting…' : 'Submit application'}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

interface DropzoneProps {
  label: string;
  accept: string;
  files: File[];
  onAdd: (fs: FileList | null) => void;
  onRemove: (idx: number) => void;
  hint?: string;
}

const FileDropzone: React.FC<DropzoneProps> = ({ label, accept, files, onAdd, onRemove, hint }) => {
  const inputId = React.useId();
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <label
        htmlFor={inputId}
        className="block border-2 border-dashed border-gray-200 hover:border-[#578F82] bg-gray-50/60 rounded-xl p-5 text-center cursor-pointer transition-colors"
      >
        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
        <p className="text-sm font-medium text-gray-700">Click to upload</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => onAdd(e.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 bg-white ring-1 ring-gray-200/70 rounded-lg px-3 py-2 text-sm"
            >
              <span className="truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-1 rounded hover:bg-rose-50 text-rose-600"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BecomePartner;
