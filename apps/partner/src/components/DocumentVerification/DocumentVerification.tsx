import React, { useState } from 'react';

interface Props {
  partnerId?: string;
}

type DocType = 'aadhaar' | 'pan';

type ExtractedData = {
  type: DocType;
  number?: string;
  name?: string;
  dob?: string;
  gender?: string;
  address?: string;
  fatherName?: string;
};

type Status = 'idle'|'uploading'|'confirming'|'done'|'error';

const DocumentVerification: React.FC<Props> = ({ partnerId }) => {
  const [docType, setDocType] = useState<DocType>('pan');
  const [side, setSide] = useState<'single'|'front'|'back'>('single');
  const [fileFront, setFileFront] = useState<File | null>(null);
  const [fileBack, setFileBack] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [extracted, setExtracted] = useState<ExtractedData>({ type: 'pan' });

  const urlBase = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.VITE_API_BASE_URL;

  const readAsDataURL = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const simpleExtract = (text: string): ExtractedData => {
    const data: ExtractedData = { type: docType };
    if (docType === 'aadhaar') {
      const match = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
      if (match) data.number = match[0].replace(/\s/g, '');
      const dob = text.match(/\b\d{2}[\/-]\d{2}[\/-]\d{4}\b/);
      if (dob) data.dob = dob[0];
      if (/male/i.test(text)) data.gender = 'Male';
      else if (/female/i.test(text)) data.gender = 'Female';
      const nameLine = text.split('\n').find(l => /name|नाम/i.test(l));
      if (nameLine) {
        const parts = nameLine.split(/:|\s+-\s+/);
        data.name = (parts[1] || parts[0]).trim();
      }
      data.address = undefined; // optional manual fill
    } else {
      const pan = text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/);
      if (pan) data.number = pan[0];
      const dob = text.match(/\b\d{2}[\/-]\d{2}[\/-]\d{4}\b/);
      if (dob) data.dob = dob[0];
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      // Heuristic: pick first UPPERCASE long line as name
      const nameCand = lines.find(l => /^[A-Z ]{3,}$/.test(l) && l.length >= 5);
      if (nameCand) data.name = nameCand;
    }
    return data;
  };

  // OCR disabled by request; users will enter details manually.

  const uploadDoc = async (file: File, sideLabel: 'single'|'front'|'back') => {
    const fd = new FormData();
    fd.append('documentType', docType);
    fd.append('documentSide', sideLabel);
    if (partnerId) fd.append('partnerId', partnerId);
    fd.append('file', file);
    const resp = await fetch(`${urlBase}/api/verify/document/upload`, { method: 'POST', body: fd });
    const data = await resp.json();
    if (!resp.ok || !data?.success) throw new Error(data?.message || 'Upload failed');
    return data as { success: boolean; documentId: string; documentKey: string; documentUrl: string };
  };

  const handleProcess = async () => {
    try {
      setStatus('uploading');
      setError('');
      let mainFile: File | null = null;
      let backFile: File | null = null;
      if (docType === 'aadhaar') {
        if (!fileFront || !fileBack) throw new Error('Please upload both front and back images for Aadhaar');
        mainFile = fileFront; backFile = fileBack;
      } else {
        if (!fileFront) throw new Error('Please upload PAN image');
        mainFile = fileFront;
      }
      // Upload files
      const mainRes = await uploadDoc(mainFile, docType === 'aadhaar' ? 'front' : 'single');
      let backRes: any = null;
      if (backFile) backRes = await uploadDoc(backFile, 'back');
      setStatus('confirming');
      // Confirm with extracted data (editable by user before confirm)
      const confirmBody = {
        documentId: mainRes.documentId,
        confirmedData: extracted,
        partnerId: partnerId || 'anonymous'
      };
      const resp = await fetch(`${urlBase}/api/verify/document/confirm`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(confirmBody)
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) throw new Error(data?.message || 'Confirmation failed');
      setStatus('done');
    } catch (e: any) {
      setError(e?.message || 'Processing failed');
      setStatus('error');
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Identity Document Verification</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <select className="w-full px-3 py-2 border rounded-lg" value={docType} onChange={(e) => {
            const v = e.target.value as DocType; setDocType(v); setSide(v === 'aadhaar' ? 'front' : 'single');
            setFileFront(null); setFileBack(null);
            setExtracted({ type: v });
          }}>
            <option value="pan">PAN</option>
            <option value="aadhaar">Aadhaar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
          <select className="w-full px-3 py-2 border rounded-lg" disabled={docType==='pan'} value={side} onChange={(e)=>setSide(e.target.value as any)}>
            <option value="single">Single</option>
            <option value="front">Front</option>
            <option value="back">Back</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{docType==='aadhaar' ? 'Front Image' : 'PAN Image'}</label>
          <input type="file" accept="image/*" onChange={(e)=> {
            const f = e.target.files?.[0] || null;
            setFileFront(f);
          }} />
          {fileFront && <img src={URL.createObjectURL(fileFront)} className="mt-2 w-48 h-32 object-cover rounded" />}
        </div>
        {docType==='aadhaar' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Back Image</label>
            <input type="file" accept="image/*" onChange={(e)=> setFileBack(e.target.files?.[0] || null)} />
            {fileBack && <img src={URL.createObjectURL(fileBack)} className="mt-2 w-48 h-32 object-cover rounded" />}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number</label>
          <input className="w-full px-3 py-2 border rounded" value={extracted.number || ''} onChange={e=> setExtracted(prev=>({ ...prev, number: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input className="w-full px-3 py-2 border rounded" value={extracted.name || ''} onChange={e=> setExtracted(prev=>({ ...prev, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input className="w-full px-3 py-2 border rounded" placeholder="DD/MM/YYYY" value={extracted.dob || ''} onChange={e=> setExtracted(prev=>({ ...prev, dob: e.target.value }))} />
        </div>
        {docType==='aadhaar' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <input className="w-full px-3 py-2 border rounded" value={extracted.gender || ''} onChange={e=> setExtracted(prev=>({ ...prev, gender: e.target.value }))} />
          </div>
        )}
        {docType==='aadhaar' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="w-full px-3 py-2 border rounded" rows={3} value={extracted.address || ''} onChange={e=> setExtracted(prev=>({ ...prev, address: e.target.value }))} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleProcess} disabled={status==='uploading'||status==='confirming'} className="px-4 py-2 bg-[#578f82] text-white rounded disabled:opacity-50">
          {status==='uploading'||status==='confirming' ? 'Processing...' : 'Save & Verify'}
        </button>
        {status==='done' && <span className="text-green-600 text-sm">Verified and saved!</span>}
      </div>
    </div>
  );
};

export default DocumentVerification;
