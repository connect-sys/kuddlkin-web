
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { kycApi } from '../../api/kyc';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

interface BankStepProps {
  onComplete: () => void;
  isCompleted?: boolean;
}

export default function BankStep({ onComplete, isCompleted }: BankStepProps) {
  const [loading, setLoading] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<{ account_number: string; ifsc: string; account_holder_name: string; phone: string }>();

  const onVerify = async (data: { account_number: string; ifsc: string; account_holder_name: string; phone: string }) => {
    try {
      setLoading(true);
      const res = await kycApi.verifyBank(data.account_number, data.ifsc, data.account_holder_name, data.phone);
      if (res.success) {
        setBeneficiaryName(res.beneficiary_name || res.data?.name_at_bank || data.account_holder_name);
        toast.success('Bank account verified successfully');
        onComplete();
      } else {
        toast.error(res.message || 'Bank verification failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bank verification failed');
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
        <h3 className="text-lg font-medium text-green-800">Bank Account Verified</h3>
        {beneficiaryName && <p className="text-green-700 text-sm mt-1">Beneficiary: {beneficiaryName}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <Building2 className="h-5 w-5 mr-2 text-purple-600" />
        Bank Account Verification
      </h3>
      
      <form onSubmit={handleSubmit(onVerify)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <input
            type="text"
            {...register('account_holder_name', { 
              required: 'Account holder name is required' 
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter account holder name"
          />
          {errors.account_holder_name && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.account_holder_name.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Linked to Bank)
          </label>
          <input
            type="tel"
            maxLength={10}
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit phone number' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.phone.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            type="text"
            {...register('account_number', { 
              required: 'Account number is required',
              minLength: { value: 9, message: 'Account number seems too short' }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter bank account number"
          />
          {errors.account_number && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.account_number.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IFSC Code
          </label>
          <input
            type="text"
            maxLength={11}
            style={{ textTransform: 'uppercase' }}
            {...register('ifsc', { 
              required: 'IFSC code is required',
              pattern: { 
                value: /^[A-Z]{4}0[A-Z0-9]{6}$/, 
                message: 'Enter a valid IFSC code' 
              }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
            placeholder="SBIN0001234"
          />
          {errors.ifsc && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.ifsc.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Bank Account'}
        </button>
      </form>
    </div>
  );
}
