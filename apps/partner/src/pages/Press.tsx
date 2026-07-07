import React, { useState, useEffect } from 'react';
import { Newspaper, Download, Mail, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  link: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Press: React.FC = () => {
  const navigate = useNavigate();
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPressReleases();
  }, []);

  const fetchPressReleases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/press?status=published`);
      const data = await response.json();
      if (data.success) {
        setPressReleases(data.releases || []);
      }
    } catch (error) {
      console.error('Error fetching press releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const mediaKit = [
    { name: 'Company Logo (PNG)', size: '2.5 MB' },
    { name: 'Company Logo (SVG)', size: '156 KB' },
    { name: 'Brand Guidelines', size: '4.8 MB' },
    { name: 'Product Screenshots', size: '12.3 MB' },
    { name: 'Founder Photos', size: '8.7 MB' }
  ];

  const coverage = [
    {
      outlet: 'TechCrunch',
      title: 'Kuddl is revolutionizing childcare services in India',
      date: 'March 2024',
      link: '#'
    },
    {
      outlet: 'YourStory',
      title: 'How Kuddl is empowering childcare service providers',
      date: 'February 2024',
      link: '#'
    },
    {
      outlet: 'Inc42',
      title: 'Kuddl raises funding to expand childcare marketplace',
      date: 'January 2024',
      link: '#'
    }
  ];

  const facts = [
    { label: 'Founded', value: '2024' },
    { label: 'Headquarters', value: 'Delhi, India' },
    { label: 'Active Partners', value: '10,000+' },
    { label: 'Cities Covered', value: '25+' },
    { label: 'Services Completed', value: '53+' },
    { label: 'Average Rating', value: '4.8★' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 mb-4">
            <Newspaper className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Press & Media</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Latest news, press releases, and media resources about Kuddl
          </p>
        </div>
      </div>

      {/* Press Contact */}
      <div className="container mx-auto px-6 -mt-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Media Inquiries</h3>
              <p className="text-gray-600">For press and media inquiries, please contact:</p>
            </div>
            <Mail className="w-8 h-8 text-[#578f82]" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-900 font-medium">connect@tendernest.world</p>
            <p className="text-gray-600 text-sm mt-1">We typically respond within 24 hours</p>
          </div>
        </div>
      </div>

      {/* Quick Facts */}
      {/* <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Quick Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {facts.map((fact, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-[#578f82] mb-2">{fact.value}</div>
                <div className="text-gray-600 text-sm">{fact.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Press Releases */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Press Releases</h2>
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82]"></div>
              <p className="mt-4 text-gray-600">Loading press releases...</p>
            </div>
          ) : pressReleases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No press releases available at this time</p>
            </div>
          ) : (
            pressReleases.map((release, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-500 mb-2">{release.date}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{release.title}</h3>
              <p className="text-gray-600 mb-4">{release.excerpt}</p>
              <a
                href={release.link}
                className="inline-flex items-center text-[#578f82] font-medium hover:underline"
              >
                Read full release
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          )))}
        </div>
      </div>

      {/* Media Coverage */}
      <div className="bg-[#578f82]/5 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">In the News</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {coverage.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="text-sm font-medium text-[#578f82] mb-1">{item.outlet}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <div className="text-sm text-gray-500">{item.date}</div>
                </div>
                <a
                  href={item.link}
                  className="text-[#578f82] hover:text-[#4a7c70] transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Media Kit</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Download our brand assets, logos, and other media resources
        </p>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {mediaKit.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.size}</div>
                </div>
                <button className="text-[#578f82] hover:text-[#4a7c70] transition-colors">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="bg-[#578f82] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#4a7c70] transition-colors inline-flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Download Complete Media Kit
            </button>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#578f82] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Feature Kuddl?</h2>
          <p className="text-xl text-white/90 mb-6">
            We'd love to share our story and insights with your audience
          </p>
          <button
            onClick={() => window.location.href = 'mailto:press@kuddl.co'}
            className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Press Team
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Press;
