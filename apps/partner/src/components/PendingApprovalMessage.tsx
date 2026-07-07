import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PendingApprovalMessage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Pending Admin Approval</h2>
                <p className="text-white/90 text-sm mt-1">Your account is under review</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Status Message */}
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-[#578f82] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-teal-900 mb-2">Access Restricted</h3>
                  <p className="text-sm text-teal-800 leading-relaxed">
                    This section is currently locked. Your profile has been submitted for admin review. 
                    Once approved, you'll have full access to all features including services, bookings, earnings, and more.
                  </p>
                </div>
              </div>
            </div>

            {/* What You Can Do */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg">What you can do now:</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">View Dashboard</p>
                    <p className="text-sm text-green-700 mt-1">Check your profile completion status and overview</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Update Profile</p>
                    <p className="text-sm text-blue-700 mt-1">Complete or update your profile information to speed up approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>Email: <a href="mailto:connect@tendernest.world" className="text-[#578f82] hover:underline">connect@tendernest.world</a></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>Phone: <a href="tel:+919876543210" className="text-[#578f82] hover:underline">+91 98765 43210</a></span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Approval Timeline</h4>
                  <p className="text-sm text-blue-800">
                    Most profiles are reviewed within 24-48 hours. You'll receive an email notification once your account is approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a
                href="/dashboard"
                className="flex-1 px-6 py-3 bg-[#578f82] text-white rounded-lg font-medium text-center hover:bg-[#4a7c70] transition-colors"
              >
                Go to Dashboard
              </a>
              <a
                href="/profile"
                className="flex-1 px-6 py-3 bg-white border-2 border-[#578f82] text-[#578f82] rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
              >
                Update Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalMessage;
