
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { kycApi } from '../../api/kyc';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, AlertCircle, Building } from 'lucide-react';

interface GstStepProps {
  onComplete: () => void;
  isCompleted?: boolean;
}

export default function GstStep({ onComplete, isCompleted }: GstStepProps) {
  const [loading, setLoading] = useState(false);
  const [legalName, setLegalName] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<{ gst: string }>();

  const onVerify = async (data: { gst: string }) => {
    try {
      setLoading(true);
      const res = await kycApi.verifyGst(data.gst);
      if (res.success) {
        setLegalName(res.data?.legal_name || res.data?.trade_name);
        toast.success('GST verified successfully');
        onComplete();
      } else {
        toast.error(res.message || 'GST verification failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'GST verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-100 flex items-center justify-center flex-col text-center">
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-green-800">GST Verified</h3>
        {legalName && <p className="text-green-700 text-sm mt-1">Legal Name: {legalName}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Building className="h-5 w-5 mr-2 text-purple-600" />
        GST Verification
      </h3>
      
      <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST Number
          </label>
          <input
            type="text"
            maxLength={15}
            style={{ textTransform: 'uppercase' }}
            {...register('gst', { 
              required: 'GST number is required',
              pattern: { 
                value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
                message: 'Enter a valid GST format' 
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
            placeholder="22AAAAA0000A1Z5"
          />
          {errors.gst && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.gst.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify GST'}
        </button>
      </form>
    </div>
  );
}
