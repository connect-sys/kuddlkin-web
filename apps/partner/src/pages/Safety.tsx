import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Eye, FileCheck, Users, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const Safety: React.FC = () => {
  const navigate = useNavigate();

  const safetyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Background Verification',
      description: 'All partners undergo thorough background checks including identity verification, address verification, and criminal record checks before being approved on the platform.'
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: 'Document Verification',
      description: 'We verify all professional certifications, qualifications, and licenses to ensure partners have the necessary credentials to provide their services.'
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: 'Continuous Monitoring',
      description: 'Partner profiles are continuously monitored for compliance with our safety standards. Any violations result in immediate action including suspension or removal.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Customer Reviews',
      description: 'Transparent review system allows customers to rate and review services, helping maintain high quality standards and accountability across the platform.'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Secure Payments',
      description: 'All transactions are processed through secure payment gateways with PCI-DSS compliance, ensuring financial data protection for both partners and customers.'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock support team available to address safety concerns, handle disputes, and provide assistance in emergency situations.'
    }
  ];

  const safetyGuidelines = [
    {
      title: 'For Partners',
      guidelines: [
        'Always verify customer identity before providing services',
        'Maintain professional boundaries and conduct',
        'Report any suspicious behavior or safety concerns immediately',
        'Keep your profile information and availability updated',
        'Follow all service-specific safety protocols',
        'Never share personal contact information outside the platform',
        'Document any incidents or concerns for record-keeping'
      ]
    },
    {
      title: 'For Customers',
      guidelines: [
        'Book services only through the Kuddl platform',
        'Verify partner credentials and reviews before booking',
        'Communicate service requirements clearly',
        'Be present during service delivery when required',
        'Report any concerns or inappropriate behavior',
        'Provide honest feedback and reviews',
        'Keep payment transactions within the platform'
      ]
    }
  ];

  const reportingProcess = [
    {
      step: '1',
      title: 'Identify the Issue',
      description: 'Recognize any safety concern, policy violation, or inappropriate behavior'
    },
    {
      step: '2',
      title: 'Document Details',
      description: 'Note down specific details, dates, times, and any evidence related to the incident'
    },
    {
      step: '3',
      title: 'Report Immediately',
      description: 'Contact our safety team through the app, email, or emergency hotline'
    },
    {
      step: '4',
      title: 'Investigation',
      description: 'Our team reviews the report and takes appropriate action within 24 hours'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Safety at Kuddl</h1>
          </div>
          <p className="text-xl text-white/90">Your safety and security are our top priorities</p>
        </div>
      </div>

      {/* Safety Features */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Safety Measures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safetyFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-[#578f82] mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Safety Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {safetyGuidelines.map((section, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">{section.title}</h3>
                <ul className="space-y-4">
                  {section.guidelines.map((guideline, gIndex) => (
                    <li key={gIndex} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-[#578f82] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reporting Process */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">How to Report Safety Concerns</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          If you encounter any safety issues or concerns, follow these steps to report them to our team
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {reportingProcess.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-[#578f82] text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
              {index < reportingProcess.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <div className="w-6 h-0.5 bg-[#578f82]"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border-t-4 border-red-500 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-start space-x-4 max-w-3xl mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Emergency Situations</h3>
              <p className="text-gray-700 mb-4">
                If you are in immediate danger or facing an emergency situation, please contact local emergency services first (Police: 100, Ambulance: 108).
              </p>
              <p className="text-gray-700">
                For urgent platform-related safety concerns, contact our 24/7 safety hotline: <strong className="text-red-600">+91 80-4567-8900</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#578f82] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions about Safety?</h2>
          <p className="text-xl text-white/90 mb-6">Our team is here to help and address your concerns</p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Safety Team
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Safety;
