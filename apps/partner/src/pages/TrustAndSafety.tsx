import React from 'react';
import { Shield, Lock, Eye, FileCheck, Users, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const TrustAndSafety: React.FC = () => {
  const navigate = useNavigate();

  const trustPillars = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: 'Verified Partners',
      description: 'Every partner undergoes comprehensive background verification including identity checks, address verification, and professional credential validation before joining the platform.',
      stats: '100% Verified'
    },
    {
      icon: <Lock className="w-12 h-12" />,
      title: 'Secure Platform',
      description: 'End-to-end encryption for all communications, secure payment processing with PCI-DSS compliance, and data protection following industry best practices.',
      stats: 'Bank-level Security'
    },
    {
      icon: <Eye className="w-12 h-12" />,
      title: 'Transparent Reviews',
      description: 'Authentic customer reviews and ratings help maintain accountability. All reviews are verified and partners cannot delete or modify customer feedback.',
      stats: '53+ Reviews'
    },
    {
      icon: <Award className="w-12 h-12" />,
      title: 'Quality Standards',
      description: 'Continuous monitoring of service quality through customer feedback, compliance checks, and regular audits to ensure partners maintain high standards.',
      stats: '4.8★ Average Rating'
    }
  ];

  const verificationProcess = [
    {
      step: 1,
      title: 'Identity Verification',
      items: [
        'Government-issued ID verification',
        'Facial recognition and liveness check',
        'Address proof validation',
        'Phone number verification'
      ]
    },
    {
      step: 2,
      title: 'Background Checks',
      items: [
        'Criminal record verification',
        'Court record checks',
        'Previous employment verification',
        'Reference checks'
      ]
    },
    {
      step: 3,
      title: 'Professional Validation',
      items: [
        'Qualification and certification verification',
        'License validation (where applicable)',
        'Skills assessment',
        'Experience verification'
      ]
    },
    {
      step: 4,
      title: 'Ongoing Monitoring',
      items: [
        'Regular compliance checks',
        'Customer feedback monitoring',
        'Performance tracking',
        'Periodic re-verification'
      ]
    }
  ];

  const trustCommitments = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Privacy Protection',
      description: 'We never share your personal information without consent. All data is encrypted and stored securely following GDPR and data protection regulations.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Fair Practices',
      description: 'Transparent pricing, no hidden fees, and fair commission structure. Partners receive timely payments and customers get value for money.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Dispute Resolution',
      description: 'Fair and impartial dispute resolution process with dedicated support team to address concerns and resolve issues promptly.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Insurance Coverage',
      description: 'All bookings are covered under our insurance policy to protect both partners and customers against unforeseen circumstances.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Community Standards',
      description: 'Clear community guidelines and code of conduct that all partners must follow. Violations result in immediate action.'
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: 'Continuous Improvement',
      description: 'Regular updates to safety protocols based on feedback, industry best practices, and emerging security standards.'
    }
  ];

  const safetyStats = [
    { number: '100%', label: 'Partners Verified' },
    { number: '50K+', label: 'Background Checks' },
    { number: '24x7', label: 'Safety Support' },
    { number: '99.9%', label: 'Platform Uptime' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Trust & Safety</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Building a trusted community through comprehensive verification, transparent practices, and unwavering commitment to safety.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 -mt-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {safetyStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-[#578f82] mb-2">{stat.number}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Pillars */}
      <div className="container mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Trust Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {trustPillars.map((pillar, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-[#578f82] flex-shrink-0">{pillar.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{pillar.title}</h3>
                    <span className="text-sm font-semibold text-[#578f82] bg-[#578f82]/10 px-3 py-1 rounded-full">
                      {pillar.stats}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Process */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Verification Process</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Every partner goes through a rigorous multi-step verification process before they can offer services on Kuddl.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationProcess.map((process, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="w-12 h-12 bg-[#578f82] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {process.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{process.title}</h3>
                <ul className="space-y-2">
                  {process.items.map((item, iIndex) => (
                    <li key={iIndex} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#578f82] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Commitments */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Commitments to You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustCommitments.map((commitment, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-start space-x-3">
                <div className="text-[#578f82] flex-shrink-0">{commitment.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{commitment.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{commitment.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Issues */}
      <div className="bg-orange-50 border-t-4 border-orange-500 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-start space-x-4 max-w-3xl mx-auto">
            <AlertCircle className="w-8 h-8 text-orange-500 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Report Trust & Safety Issues</h3>
              <p className="text-gray-700 mb-4">
                If you encounter any behavior that violates our trust and safety standards, or have concerns about a partner or customer, please report it immediately.
              </p>
              <button
                onClick={() => {
                  navigate('/contact');
                  window.scrollTo(0, 0);
                }}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#578f82] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Learn More About Our Safety Measures</h2>
          <p className="text-xl text-white/90 mb-6">Explore our comprehensive safety guidelines and protocols.</p>
          <button
            onClick={() => {
              navigate('/child-safety-guidelines');
              window.scrollTo(0, 0);
            }}
            className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            View Safety Guidelines
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default TrustAndSafety;
