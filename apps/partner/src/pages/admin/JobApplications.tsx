import React, { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Mail, Phone, Linkedin, Globe, Briefcase, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface JobApplication {
  id: string;
  job_id: string;
  job_title: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string;
  resume_url: string;
  cover_letter: string;
  linkedin_url: string;
  portfolio_url: string;
  experience_years: number;
  current_company: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  created_at: string;
  updated_at: string;
}

const JobApplications: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const url = statusFilter === 'all' 
        ? `${API_BASE_URL}/api/admin/job-applications`
        : `${API_BASE_URL}/api/admin/job-applications?status=${statusFilter}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/job-applications/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, status })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Application ${status}`);
        fetchApplications();
        setShowDetailModal(false);
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      hired: 'bg-purple-100 text-purple-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600 mt-2">Review and manage job applications</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              statusFilter === status
                ? 'bg-[#578f82] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#578f82] mx-auto"></div>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{application.applicant_name}</h3>
                        <p className="text-gray-600">{application.job_title}</p>
                      </div>
                      <Badge className={getStatusBadge(application.status)}>
                        {application.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {application.applicant_email}
                      </div>
                      {application.applicant_phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {application.applicant_phone}
                        </div>
                      )}
                      {application.experience_years > 0 && (
                        <div className="flex items-center text-gray-600">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {application.experience_years} years exp.
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.applicant_name}</h2>
                <p className="text-gray-600 mt-1">{selectedApplication.job_title}</p>
              </div>
              <Badge className={getStatusBadge(selectedApplication.status)}>
                {selectedApplication.status}
              </Badge>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedApplication.applicant_email}</p>
                  </div>
                  {selectedApplication.applicant_phone && (
                    <div>
                      <label className="text-sm text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedApplication.applicant_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Experience</label>
                    <p className="text-gray-900">{selectedApplication.experience_years} years</p>
                  </div>
                  {selectedApplication.current_company && (
                    <div>
                      <label className="text-sm text-gray-600">Current Company</label>
                      <p className="text-gray-900">{selectedApplication.current_company}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Links */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Links</h3>
                <div className="space-y-2">
                  {selectedApplication.resume_url && (
                    <a
                      href={selectedApplication.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#578f82] hover:underline"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      View Resume
                    </a>
                  )}
                  {selectedApplication.linkedin_url && (
                    <a
                      href={selectedApplication.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#578f82] hover:underline"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  )}
                  {selectedApplication.portfolio_url && (
                    <a
                      href={selectedApplication.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-[#578f82] hover:underline"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cover Letter</h3>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedApplication.cover_letter}
                  </p>
                </div>
              )}

              {/* Application Date */}
              <div>
                <label className="text-sm text-gray-600">Applied on</label>
                <p className="text-gray-900">{new Date(selectedApplication.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <div className="flex gap-3">
                {selectedApplication.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-blue-600 hover:bg-blue-50 border-blue-300"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Mark Reviewed
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Shortlist
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-600 hover:bg-red-50 border-red-300"
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'shortlisted' && (
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Hired
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplications;
