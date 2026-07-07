import React, { useState, useEffect } from 'react';
import { Target, Heart, Users, TrendingUp, Award, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';
import { getPublicStats } from '../api/publicStats';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { number: '10,000+', label: 'Active Partners' },
    { number: '53+', label: 'Bookings Completed' },
    { number: '25+', label: 'Cities Covered' },
    { number: '4.8★', label: 'Average Rating' }
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchStats = async () => {
      try {
        const data = await getPublicStats();
        setStats([
          { number: data.activeProviders.display, label: data.activeProviders.label },
          { number: data.bookingsCompleted.display, label: data.bookingsCompleted.label },
          { number: '25+', label: 'Cities Covered' },
          { number: data.averageRating.display, label: data.averageRating.label }
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Trust & Safety',
      description: 'Building a trusted community through comprehensive verification and transparent practices'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Community First',
      description: 'Empowering service providers and families to connect, grow, and thrive together'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality Excellence',
      description: 'Maintaining the highest standards of service quality and customer satisfaction'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology and features'
    }
  ];


  const team = [
    {
      role: 'Leadership',
      description: 'Experienced leaders from top tech companies and childcare industry, committed to transforming how families access quality services.'
    },
    {
      role: 'Technology',
      description: 'World-class engineers building secure, scalable, and user-friendly platform to connect service providers with families.'
    },
    {
      role: 'Operations',
      description: 'Dedicated team ensuring smooth operations, partner support, and maintaining high quality standards across the platform.'
    },
    {
      role: 'Safety & Trust',
      description: 'Specialists focused on verification, background checks, and maintaining the highest safety standards for our community.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Kuddl</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Connecting families with trusted, verified service providers for childcare, early learning, wellbeing support, and fun experiences.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#578f82] text-white rounded-full mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            To create a trusted ecosystem where service providers can build sustainable businesses, while families get access to verified, quality services for their child's growth, care, and development.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            We believe every child deserves access to quality care, education, and enriching experiences. By empowering service providers with technology and connecting them with families who need their expertise, we're making this vision a reality across India.
          </p>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#578f82] mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Values */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#578f82]/10 text-[#578f82] rounded-full mb-4">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="bg-[#578f82]/5 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Story</h2>
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Kuddl was born from a simple observation - parents struggle to find trusted, verified service providers for their children's needs, while talented professionals lack a platform to showcase their skills and build sustainable businesses.
              </p>
              <p>
                Founded in 2025, we set out to solve this problem by creating a comprehensive platform that brings together service providers across childcare, early learning, wellbeing support, and fun experiences. 
              </p>
              <p>
                Today, we're proud to serve thousands of families across Delhi NCR, helping them access quality services while empowering service providers to grow their businesses. From birthday party planners to child therapists, from music teachers to nannies - Kuddl is building a trusted community that puts children's development first.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Team</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
        We are a team of caring, passionate individuals working together to transform childcare services in India.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {team.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.role}</h3>
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Join Us CTA */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <Globe className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Whether you're a service provider looking to grow your business or a family seeking quality services, Kuddl is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/mobile-verification')}
              className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Become a Partner
            </button>
            <button 
              onClick={() => { window.scrollTo(0, 0); navigate('/careers'); }}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Careers
            </button>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default AboutUs;
