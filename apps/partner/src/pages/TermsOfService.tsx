import React from 'react';
import { FileText, Shield, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <FileText className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-xl text-white/90">
            Last updated: April 18, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 md:p-12">
          
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Kuddl, operated by Tendernest Private Limited ("Company", "we", "us", or "our"). These Terms of Service ("Terms") govern your access to and use of the Kuddl platform, including our website, mobile applications, and related services (collectively, the "Platform").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Platform.
            </p>
          </section>

          {/* Definitions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
            <ul className="space-y-3 text-gray-700">
              <li><strong>"Partner"</strong> refers to service providers who offer childcare, education, wellness, or event services through the Platform.</li>
              <li><strong>"Customer"</strong> refers to parents or guardians who book services through the Platform.</li>
              <li><strong>"Services"</strong> refers to the childcare, education, wellness, and event services offered by Partners.</li>
              <li><strong>"Booking"</strong> refers to a confirmed reservation for Services made through the Platform.</li>
              <li><strong>"Commission"</strong> refers to the fee charged by Kuddl for facilitating bookings between Customers and Partners.</li>
            </ul>
          </section>

          {/* Eligibility */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use the Platform as a Partner, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* Partner Obligations */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partner Obligations</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Verification and Documentation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Partners must complete our verification process, which includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Identity verification (government-issued ID)</li>
              <li>Address proof verification</li>
              <li>Background checks and police verification</li>
              <li>Professional qualifications and certifications (where applicable)</li>
              <li>Bank account details for payment processing</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Service Quality</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Partners agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Provide services professionally and competently</li>
              <li>Maintain high standards of safety and care</li>
              <li>Arrive on time for scheduled bookings</li>
              <li>Communicate promptly with Customers</li>
              <li>Honor confirmed bookings unless exceptional circumstances arise</li>
              <li>Maintain valid certifications and licenses required for their services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Prohibited Conduct</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Partners must not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Engage in any form of discrimination</li>
              <li>Request or accept payments outside the Platform</li>
              <li>Share Customer contact information with third parties</li>
              <li>Provide false or misleading information</li>
              <li>Engage in any illegal or harmful activities</li>
              <li>Circumvent the Platform to avoid commission fees</li>
            </ul>
          </section>

          {/* Commission and Payments */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Commission and Payments</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Commission Structure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kuddl charges a commission on each completed booking. The commission rate varies by service category:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li><strong>Adventure (Events & Entertainment):</strong> 15% per booking</li>
              <li><strong>Bloom (Education & Classes):</strong> 12% per booking</li>
              <li><strong>Care (Therapy & Wellness):</strong> 10% per booking</li>
              <li><strong>Discover (Childcare Services):</strong> 12% per booking</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Founding Partner Programme:</strong> Partners who join during the pilot programme receive 0% commission for the duration of the pilot period.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Payment Processing</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Payments are processed through secure payment gateways</li>
              <li>Founding Partners receive payouts within 3 days of service completion</li>
              <li>Standard Partners receive payouts within 7 days of service completion</li>
              <li>Partners must maintain valid bank account information</li>
              <li>Kuddl is not responsible for delays caused by banking institutions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.3 Refunds and Cancellations</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cancellation policies vary by service type. Partners agree to honor the cancellation policy displayed on their service listings. Refunds for cancelled bookings will be processed according to the applicable cancellation policy.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Platform, including all content, features, and functionality, is owned by Tendernest Private Limited and is protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Partners grant Kuddl a non-exclusive, worldwide, royalty-free license to use, display, and distribute content they upload to the Platform for the purpose of providing and promoting the Services.
            </p>
          </section>

          {/* Liability and Indemnification */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Liability and Indemnification</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Kuddl acts as a platform connecting Partners and Customers. We do not provide the Services directly. To the maximum extent permitted by law, Kuddl shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>The quality, safety, or legality of Services provided by Partners</li>
              <li>The accuracy of Partner profiles or service descriptions</li>
              <li>Disputes between Partners and Customers</li>
              <li>Any indirect, incidental, or consequential damages</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Indemnification</h3>
            <p className="text-gray-700 leading-relaxed">
              Partners agree to indemnify and hold harmless Kuddl, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
              <li>Provision of Services by the Partner</li>
              <li>Violation of these Terms</li>
              <li>Violation of any applicable laws or regulations</li>
              <li>Infringement of third-party rights</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Either party may terminate this agreement at any time with written notice. Kuddl reserves the right to suspend or terminate Partner accounts immediately for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activities</li>
              <li>Consistent poor service quality or customer complaints</li>
              <li>Failure to maintain required certifications or verifications</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Any disputes arising from these Terms shall be resolved through:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
              <li>Good faith negotiation between the parties</li>
              <li>Mediation, if negotiation fails</li>
              <li>Arbitration in New Delhi, India, under the Arbitration and Conciliation Act, 1996</li>
            </ol>
          </section>

          {/* Governing Law */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. The courts of New Delhi shall have exclusive jurisdiction over any disputes.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify Partners of material changes via email or through the Platform. Continued use of the Platform after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Tendernest Private Limited</strong></p>
              <p className="text-gray-700 mb-2">400-A, 4th Floor, 12 Ajit Singh House</p>
              <p className="text-gray-700 mb-2">Yusuf Sarai, Green Park</p>
              <p className="text-gray-700 mb-2">New Delhi, South West Delhi – 110016, Delhi</p>
              <p className="text-gray-700 mb-2">Email: connect@tendernest.world</p>
              <p className="text-gray-700">Phone: +91 80-4567-8900</p>
            </div>
          </section>

          {/* Acceptance */}
          <div className="bg-[#578f82]/10 border-l-4 border-[#578f82] p-6 rounded">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-[#578f82] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-800 font-semibold mb-2">Acceptance of Terms</p>
                <p className="text-gray-700">
                  By using the Kuddl Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default TermsOfService;
