import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, Users, TrendingUp, Heart, Zap, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicHeader from '../components/layout/PublicHeader';
import PublicFooter from '../components/layout/PublicFooter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Careers: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [openPositions, setOpenPositions] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobPostings();
  }, []);

  const fetchJobPostings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs?status=active`);
      const data = await response.json();
      if (data.success) {
        setOpenPositions(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching job postings:', error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance for you and your family, mental health support, and wellness programmes.'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Growth & Learning',
      description: 'Learning budget, conference attendance, mentorship programmes, and career development opportunities.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Work-Life Balance',
      description: 'Flexible working hours, remote work options, generous leave policy, and parental leave.'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Competitive Compensation',
      description: 'Market-leading salaries, performance bonuses, and equity participation in company growth.'
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      title: 'Great Culture',
      description: 'Collaborative environment, team outings, celebration of wins, and inclusive workplace.'
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: 'Impact & Ownership',
      description: 'meaningful problem-solving work, ownership of projects, and high-impact value creation.'
    }
  ];

  const departments = ['All', 'Engineering', 'Product', 'Operations', 'Trust & Safety', 'Marketing', 'Design'];

  const filteredPositions = selectedDepartment === 'all' 
    ? openPositions 
    : openPositions.filter(pos => pos.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#578f82] to-[#4a7c70] text-white py-16 pt-28">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Careers at Kuddl</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Join us in transforming childcare services and empowering service providers across India.
          </p>
        </div>
      </div>

      {/* Why Join Us */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Why Join Kuddl?</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Be part of a mission-driven team building technology that makes a real difference in families' lives.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="text-[#578f82] mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
          
          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-[#578f82] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82]"></div>
                <p className="mt-4 text-gray-600">Loading job postings...</p>
              </div>
            ) : filteredPositions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No positions available in this department</p>
              </div>
            ) : (
              filteredPositions.map((position, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {position.department}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {position.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {position.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{position.description}</p>
                  <button className="bg-[#578f82] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4a7c70] transition-colors">
                    Apply Now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Culture */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Culture</h2>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mission-Driven</h3>
              <p className="text-gray-600">
                Every day, we work towards making quality childcare services accessible to families across India. Your work directly impacts children's lives.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Collaborative</h3>
              <p className="text-gray-600">
                We believe in the power of teamwork. Cross-functional collaboration, open communication, and shared success define our work style.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation-Focused</h3>
              <p className="text-gray-600">
                We encourage experimentation, embrace new ideas, and constantly push boundaries to build better solutions for our community.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Inclusive</h3>
              <p className="text-gray-600">
                Diversity makes us stronger. We're committed to building an inclusive workplace where everyone feels valued and empowered.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#578f82] text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Don't See the Right Role?</h2>
          <p className="text-xl text-white/90 mb-6">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <button
            onClick={() => {
              navigate('/contact');
              window.scrollTo(0, 0);
            }}
            className="bg-white text-[#578f82] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get in Touch
          </button>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default Careers;
