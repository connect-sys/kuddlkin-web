import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Book, MessageCircle, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import ContactModal from '../components/ContactModal';

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const faqs = [
    {
      category: 'Getting Started',
      icon: <Book className="w-6 h-6" />,
      questions: [
        {
          q: 'How do I create my partner profile?',
          a: 'After signing up, complete your profile by adding your services, availability, qualifications, and uploading required documents. Our verification team will review and approve your profile within 24-48 hours.'
        },
        {
          q: 'What documents do I need to submit?',
          a: 'You need to submit a government-issued ID proof, address proof, relevant certifications or qualifications for your services, and complete a background verification check.'
        },
        {
          q: 'How long does verification take?',
          a: 'Verification typically takes 24-48 hours. You will receive an email notification once your profile is approved and you can start receiving bookings.'
        }
      ]
    },
    {
      category: 'Bookings & Payments',
      icon: <MessageCircle className="w-6 h-6" />,
      questions: [
        {
          q: 'How do I receive bookings?',
          a: 'Once your profile is approved, customers can discover and book your services. You will receive instant notifications via SMS and push notifications for new booking requests.'
        },
        {
          q: 'When do I get paid?',
          a: 'Payments are settled within 24 hours of service completion. For Professional plan subscribers, settlements happen daily. Free plan users receive payments within 3-5 business days.'
        },
        {
          q: 'What is the commission structure?',
          a: 'Free plan: 0% commission for first 30 days. Professional plan (₹499/month): Flat 10% commission per booking with next-day settlements and priority support.'
        },
        {
          q: 'Can I cancel a booking?',
          a: 'Yes, you can cancel bookings from your dashboard. However, frequent cancellations may affect your profile rating. Please update your availability regularly to avoid booking conflicts.'
        }
      ]
    },
    {
      category: 'Managing Services',
      icon: <FileText className="w-6 h-6" />,
      questions: [
        {
          q: 'How do I update my services?',
          a: 'Go to the Services section in your dashboard. You can add new services, update pricing, modify descriptions, and upload photos of your work.'
        },
        {
          q: 'Can I offer services in multiple categories?',
          a: 'Yes! You can list services across multiple categories (Adventure, Bloom, Care, Discover) from a single account and manage everything from one dashboard.'
        },
        {
          q: 'How do I set my availability?',
          a: 'Navigate to the Availability section to set your working hours, block dates, and manage your calendar. You can set different availability for different services.'
        }
      ]
    },
    {
      category: 'Account & Settings',
      icon: <HelpCircle className="w-6 h-6" />,
      questions: [
        {
          q: 'How do I change my subscription plan?',
          a: 'Go to Settings > Subscription to upgrade or downgrade your plan. Changes take effect immediately, and you will be charged pro-rata for the remaining period.'
        },
        {
          q: 'How do I update my bank details?',
          a: 'Navigate to Settings > Banking Information. Update your bank account details and verify them using the micro-deposit verification process.'
        },
        {
          q: 'Can I pause my account temporarily?',
          a: 'Yes, you can pause your account from Settings. Your profile will not be visible to customers during this period, and you will not receive any bookings.'
        }
      ]
    }
  ];

  const quickLinks = [
    { title: 'Partner Guidelines', icon: <Book className="w-5 h-5" />, link: '/guidelines' },
    { title: 'Contact Support', icon: <MessageCircle className="w-5 h-5" />, link: '/contact' },
    { title: 'Video Tutorials', icon: <FileText className="w-5 h-5" />, link: '/tutorials' },
    { title: 'Community Forum', icon: <HelpCircle className="w-5 h-5" />, link: '/forum' }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq =>
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-white/90 mb-8">Find answers to your questions and get support.</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="container mx-auto px-6 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {quickLinks.map((link, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="text-[#578f82]">{link.icon}</div>
                <span className="font-semibold text-gray-800">{link.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="container mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8"> FAQs</h2>
        
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-[#578f82] hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFaqs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-[#578f82]/10 px-6 py-4 flex items-center space-x-3">
                  <div className="text-[#578f82]">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    return (
                      <div key={faqIndex} className="p-6">
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                          {expandedFaq === globalIndex ? (
                            <ChevronUp className="w-5 h-5 text-[#578f82] flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFaq === globalIndex && (
                          <div className="mt-4 text-gray-600 leading-relaxed">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Support CTA */}
      <div className="bg-[#578f82] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl text-white/90 mb-6">Our support team is here to assist you.</p>
          <button
            onClick={() => {
              navigate('/contact');
              window.scrollTo(0, 0);
            }}
            className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
      <PublicFooter />
      <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </div>
  );
};

export default HelpCenter;
