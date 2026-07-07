
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { KycStatus as KycStatusType } from '../../api/kyc';

interface KycStatusProps {
  status: KycStatusType;
}

export default function KycStatus({ status }: KycStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
      case 'completed':
        return <span className="text-green-700 font-medium">Verified</span>;
      case 'failed':
      case 'rejected':
        return <span className="text-red-700 font-medium">Failed</span>;
      default:
        return <span className="text-yellow-700 font-medium">Pending</span>;
    }
  };

  const isFullyVerified = status.overall_status === 'completed' || 
    (status.aadhaar.status === 'verified' && 
     status.pan.status === 'verified' && 
     status.bank.status === 'verified' && 
     status.face_liveness.status === 'verified');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">KYC Verification Status</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFullyVerified ? 'bg-green-100 text-green-800' : 
            status.overall_status === 'rejected' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {isFullyVerified ? 'Completed' : 
             status.overall_status === 'rejected' ? 'Rejected' : 
             'In Progress'}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Your identity verification status for Kuddl Partner programme.
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Aadhaar */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Aadhaar Verification</p>
            {status.aadhaar.number_masked && (
              <p className="text-sm text-gray-500">Linked to: {status.aadhaar.number_masked}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusText(status.aadhaar.status)}
            {getStatusIcon(status.aadhaar.status)}
          </div>
        </div>

        {/* PAN */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">PAN Verification</p>
            {status.pan.number && (
              <p className="text-sm text-gray-500">{status.pan.number}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusText(status.pan.status)}
            {getStatusIcon(status.pan.status)}
          </div>
        </div>

        {/* GST */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">GST Verification</p>
            {status.gst?.number && (
              <p className="text-sm text-gray-500">{status.gst.number}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusText(status.gst?.status || 'pending')}
            {getStatusIcon(status.gst?.status || 'pending')}
          </div>
        </div>

        {/* Bank */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Bank Account</p>
            {status.bank.account_masked && (
              <p className="text-sm text-gray-500">{status.bank.account_masked}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getStatusText(status.bank.status)}
            {getStatusIcon(status.bank.status)}
          </div>
        </div>

        {/* Face Liveness */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Face Liveness</p>
            <p className="text-sm text-gray-500">Selfie verification</p>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusText(status.face_liveness.status)}
            {getStatusIcon(status.face_liveness.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
