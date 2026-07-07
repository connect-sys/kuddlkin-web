
import client from './client';

export interface KycStatus {
  overall_status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  aadhaar: {
    status: 'pending' | 'verified' | 'failed';
    number_masked?: string;
    verified_at?: string;
  };
  pan: {
    status: 'pending' | 'verified' | 'failed';
    number?: string;
    name?: string;
    verified_at?: string;
  };
  gst: {
    status: 'pending' | 'verified' | 'failed';
    number?: string;
    legal_name?: string;
    verified_at?: string;
  };
  bank: {
    status: 'pending' | 'verified' | 'failed';
    account_masked?: string;
    ifsc?: string;
    beneficiary_name?: string;
    verified_at?: string;
  };
  face_liveness: {
    status: 'pending' | 'verified' | 'failed';
    score?: number;
    verified_at?: string;
  };
}

export interface AadhaarOtpResponse {
  success: boolean;
  message: string;
  request_id: string;
}

export const kycApi = {
  // Get current KYC status
  getStatus: async (): Promise<KycStatus> => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
    
    const response = await fetch(`${API_BASE_URL}/api/kyc/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform simplified backend response to expected format
    return {
      overall_status: data.kyc_status || 'pending',
      aadhaar: { status: 'pending' },
      pan: { status: 'pending' },
      gst: { status: 'pending' },
      bank: { status: 'pending' },
      face_liveness: { status: 'pending' }
    };
  },

  // Step 1: Send Aadhaar OTP
  sendAadhaarOtp: async (aadhaarNumber: string): Promise<AadhaarOtpResponse> => {
    const response = await client.post('/api/kyc/aadhaar/send-otp', { aadhaar_number: aadhaarNumber });
    return response.data;
  },

  // Step 1: Verify Aadhaar OTP
  verifyAadhaarOtp: async (requestId: string, otp: string) => {
    const response = await client.post('/api/kyc/aadhaar/verify-otp', { request_id: requestId, otp });
    return response.data;
  },

  // Step 2: Verify PAN
  verifyPan: async (panNumber: string, name?: string) => {
    const response = await client.post('/api/kyc/pan/verify', { pan_number: panNumber, name });
    return response.data;
  },

  // Step 3: Verify GST
  verifyGst: async (gstNumber: string) => {
    const response = await client.post('/api/kyc/gst/verify', { gst_number: gstNumber });
    return response.data;
  },

  // Step 4: Verify Bank Account
  verifyBank: async (accountNumber: string, ifscCode: string, accountHolderName: string, phone: string) => {
    const response = await client.post('/api/kyc/bank/verify-account', { 
      account_number: accountNumber, 
      ifsc_code: ifscCode,
      account_holder_name: accountHolderName,
      phone: phone
    });
    return response.data;
  },

  // Helper: Lookup IFSC
  lookupIfsc: async (ifscCode: string) => {
    const response = await client.get(`/api/kyc/bank/ifsc/${ifscCode}`);
    return response.data;
  },

  // Step 5: Check Face Liveness
  checkFaceLiveness: async (imageBase64: string) => {
    const response = await client.post('/api/kyc/face/liveness', { image_base64: imageBase64 });
    return response.data;
  },

  // DigiLocker Methods
  initiateDigiLocker: async (aadhaarNumber: string) => {
    const response = await client.post('/api/kyc/digilocker/initiate', { aadhaar_number: aadhaarNumber });
    return response.data;
  },

  checkDigiLockerStatus: async (verificationId: string) => {
    const response = await client.post('/api/kyc/digilocker/status', { verification_id: verificationId });
    return response.data;
  },

  getDigiLockerDocument: async (verificationId: string) => {
    const response = await client.post('/api/kyc/digilocker/document', { verification_id: verificationId });
    return response.data;
  }
};
