import React from 'react';
import { Shield, Lock, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
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
              Tendernest Private Limited ("Kuddl", "we", "us", or "our") is committed to protecting the privacy and security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using the Kuddl Platform, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our Platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect information that you voluntarily provide when using our Platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li><strong>Account Information:</strong> Name, email address, phone number, date of birth</li>
              <li><strong>Profile Information:</strong> Professional qualifications, certifications, service descriptions, photos, availability</li>
              <li><strong>Verification Documents:</strong> Government-issued ID, address proof, background check results</li>
              <li><strong>Financial Information:</strong> Bank account details, tax information (PAN, GST)</li>
              <li><strong>Communication Data:</strong> Messages, reviews, ratings, customer support interactions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Information Collected Automatically</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you use our Platform, we automatically collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
              <li><strong>Location Data:</strong> GPS coordinates, city, region (with your permission)</li>
              <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.3 Information from Third Parties</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Background verification agencies</li>
              <li>Payment processors</li>
              <li>Social media platforms (if you choose to link accounts)</li>
              <li>Public databases and government records</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information for the following purposes:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Platform Operations</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Create and manage your Partner account</li>
              <li>Verify your identity and conduct background checks</li>
              <li>Process bookings and facilitate payments</li>
              <li>Enable communication between Partners and Customers</li>
              <li>Provide customer support</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Service Improvement</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Analyze usage patterns and improve Platform features</li>
              <li>Personalize your experience</li>
              <li>Develop new services and features</li>
              <li>Conduct research and analytics</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Safety and Security</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Detect and prevent fraud, abuse, and illegal activities</li>
              <li>Enforce our Terms of Service</li>
              <li>Protect the safety of our community</li>
              <li>Resolve disputes and investigate complaints</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Marketing and Communications</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Send booking confirmations and updates</li>
              <li>Provide promotional offers and updates (with your consent)</li>
              <li>Send administrative messages and policy updates</li>
              <li>Conduct surveys and gather feedback</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may share your information in the following circumstances:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 With Customers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your profile information, including name, photo, services, ratings, and reviews, is visible to Customers browsing the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 With Service Providers</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We share information with third-party service providers who help us operate the Platform:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Payment processors (Razorpay, Sandbox)</li>
              <li>Background verification agencies</li>
              <li>SMS and email service providers (Twilio, SendGrid)</li>
              <li>Cloud hosting providers (Cloudflare)</li>
              <li>Analytics providers</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may disclose your information if required by law or in response to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-6">
              <li>Legal processes (court orders, subpoenas)</li>
              <li>Government or regulatory requests</li>
              <li>Protection of our rights and property</li>
              <li>Emergency situations involving safety</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
            <p className="text-gray-700 leading-relaxed">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
            </p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Encryption of data in transit and at rest (SSL/TLS)</li>
              <li>Secure payment processing (PCI-DSS compliant)</li>
              <li>Regular security audits and penetration testing</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your information for as long as necessary to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
              <li>Provide our services and maintain your account</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Maintain business records</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              After account deletion, we may retain certain information for legal, regulatory, or legitimate business purposes.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Access and Correction</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can access and update your account information through your Partner dashboard.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 Data Portability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can request a copy of your personal data in a structured, machine-readable format.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Deletion</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can request deletion of your account and personal information, subject to legal retention requirements.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.4 Marketing Communications</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can opt out of marketing emails by clicking the "unsubscribe" link or updating your preferences in your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.5 Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              You can control cookies through your browser settings. Note that disabling cookies may affect Platform functionality.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our Platform is not intended for children under 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than India. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Platform. Your continued use of the Platform after such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Data Protection Officer</strong></p>
              <p className="text-gray-700 mb-2">Tendernest Private Limited</p>
              <p className="text-gray-700 mb-2">400-A, 4th Floor, 12 Ajit Singh House</p>
              <p className="text-gray-700 mb-2">Yusuf Sarai, Green Park</p>
              <p className="text-gray-700 mb-2">New Delhi, South West Delhi – 110016, Delhi</p>
              <p className="text-gray-700 mb-2">Email: privacy@kuddl.co</p>
              <p className="text-gray-700">Phone: +91 80-4567-8900</p>
            </div>
          </section>

          {/* Consent */}
          <div className="bg-[#578f82]/10 border-l-4 border-[#578f82] p-6 rounded">
            <div className="flex items-start space-x-3">
              <Lock className="w-6 h-6 text-[#578f82] flex-shrink-0 mt-1" />
              <div>
                <p className="text-gray-800 font-semibold mb-2">Your Consent</p>
                <p className="text-gray-700">
                  By using the Kuddl Platform, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
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

export default PrivacyPolicy;
