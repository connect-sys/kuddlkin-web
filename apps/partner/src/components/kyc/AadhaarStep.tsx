
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { kycApi } from '../../api/kyc';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface AadhaarStepProps {
  onComplete: () => void;
  isCompleted?: boolean;
}

export default function AadhaarStep({ onComplete, isCompleted }: AadhaarStepProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [aadhaarNumber, setAadhaarNumber] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<{ aadhaar: string; otp: string }>();

  const onSendOtp = async (data: { aadhaar: string }) => {
    try {
      setLoading(true);
      const res = await kycApi.sendAadhaarOtp(data.aadhaar);
      if (res.success) {
        setRequestId(res.request_id);
        setAadhaarNumber(data.aadhaar);
        setStep('otp');
        toast.success('OTP sent to your Aadhaar-linked mobile');
      } else {
        toast.error(res.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: { otp: string }) => {
    if (!requestId) return;
    try {
      setLoading(true);
      const res = await kycApi.verifyAadhaarOtp(requestId, data.otp);
      if (res.success) {
        toast.success('Aadhaar verified successfully');
        onComplete();
      } else {
        toast.error(res.message || 'Verification failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
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
        <h3 className="text-lg font-medium text-green-800">Aadhaar Verified</h3>
        <p className="text-green-600 text-sm mt-1">Your identity has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Aadhaar Verification</h3>
      
      {step === 'input' ? (
        <form onSubmit={handleSubmit(onSendOtp)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aadhaar Number
            </label>
            <input
              type="text"
              maxLength={12}
              {...register('aadhaar', { 
                required: 'Aadhaar number is required',
                pattern: { value: /^\d{12}$/, message: 'Enter a valid 12-digit Aadhaar number' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 12-digit Aadhaar number"
            />
            {errors.aadhaar && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.aadhaar.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-700">
            OTP sent to mobile linked with Aadhaar ending in <strong>{aadhaarNumber.slice(-4)}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter OTP
            </label>
            <input
              type="text"
              maxLength={6}
              {...register('otp', { 
                required: 'OTP is required',
                pattern: { value: /^\d{6}$/, message: 'Enter a valid 6-digit OTP' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter 6-digit OTP"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.otp.message}
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('input')}
              disabled={loading}
              className="flex-1 bg-white text-gray-700 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
            >
              Change Aadhaar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
