import React, { useState, useEffect } from 'react';
import { FileText, Briefcase, Newspaper, Plus, Edit, Trash2, Eye, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featured_image: string;
  tags: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  responsibilities: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
  updated_at: string;
}

interface PressRelease {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  link: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

const ContentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'blogs' | 'jobs' | 'press'>('blogs');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [press, setPress] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'blogs') {
        const response = await fetch(`${API_BASE_URL}/api/blogs?status=published`);
        const data = await response.json();
        if (data.success) setBlogs(data.posts || []);
        
        const draftResponse = await fetch(`${API_BASE_URL}/api/blogs?status=draft`);
        const draftData = await draftResponse.json();
        if (draftData.success) setBlogs(prev => [...prev, ...(draftData.posts || [])]);
      } else if (activeTab === 'jobs') {
        const response = await fetch(`${API_BASE_URL}/api/jobs?status=active`);
        const data = await response.json();
        if (data.success) setJobs(data.jobs || []);
        
        const draftResponse = await fetch(`${API_BASE_URL}/api/jobs?status=draft`);
        const draftData = await draftResponse.json();
        if (draftData.success) setJobs(prev => [...prev, ...(draftData.jobs || [])]);
      } else if (activeTab === 'press') {
        const response = await fetch(`${API_BASE_URL}/api/press?status=published`);
        const data = await response.json();
        if (data.success) setPress(data.releases || []);
        
        const draftResponse = await fetch(`${API_BASE_URL}/api/press?status=draft`);
        const draftData = await draftResponse.json();
        if (draftData.success) setPress(prev => [...prev, ...(draftData.releases || [])]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    }
    setLoading(false);
  };

  const handleSaveBlog = async (blog: Partial<BlogPost>) => {
    try {
      const token = localStorage.getItem('token');
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/api/admin/blog`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blog)
      });
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        loadContent();
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleSaveJob = async (job: Partial<JobPosting>) => {
    try {
      const token = localStorage.getItem('token');
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/api/admin/job`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(job)
      });
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        loadContent();
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleSavePress = async (pressRelease: Partial<PressRelease>) => {
    try {
      const token = localStorage.getItem('token');
      const method = editingItem ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE_URL}/api/admin/press`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pressRelease)
      });
      const data = await response.json();
      if (data.success) {
        setShowForm(false);
        setEditingItem(null);
        loadContent();
      }
    } catch (error) {
      console.error('Error saving press release:', error);
    }
  };

  const handleDelete = async (id: string, type: 'blog' | 'job' | 'press') => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/${type}?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        loadContent();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Content Management</h1>
        <p className="text-gray-600">Manage blogs, job postings, and press releases</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition ${
            activeTab === 'blogs' ? 'border-[#578f82] text-[#578f82]' : 'border-transparent text-gray-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span>Blog Posts</span>
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition ${
            activeTab === 'jobs' ? 'border-[#578f82] text-[#578f82]' : 'border-transparent text-gray-600'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span>Job Postings</span>
        </button>
        <button
          onClick={() => setActiveTab('press')}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition ${
            activeTab === 'press' ? 'border-[#578f82] text-[#578f82]' : 'border-transparent text-gray-600'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span>Press Releases</span>
        </button>
      </div>

      {/* Add New Button */}
      <div className="mb-6">
        <Button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="bg-[#578f82] hover:bg-[#4a7c70]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New {activeTab === 'blogs' ? 'Blog Post' : activeTab === 'jobs' ? 'Job Posting' : 'Press Release'}
        </Button>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {activeTab === 'blogs' && <BlogList blogs={blogs} onView={(blog) => { setViewingItem(blog); setShowViewModal(true); }} onEdit={(blog) => { setEditingItem(blog); setShowForm(true); }} onDelete={(id) => handleDelete(id, 'blog')} />}
          {activeTab === 'jobs' && <JobList jobs={jobs} onView={(job) => { setViewingItem(job); setShowViewModal(true); }} onEdit={(job) => { setEditingItem(job); setShowForm(true); }} onDelete={(id) => handleDelete(id, 'job')} />}
          {activeTab === 'press' && <PressList press={press} onView={(pressRelease) => { setViewingItem(pressRelease); setShowViewModal(true); }} onEdit={(pressRelease) => { setEditingItem(pressRelease); setShowForm(true); }} onDelete={(id) => handleDelete(id, 'press')} />}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            {activeTab === 'blogs' && <BlogForm blog={editingItem} onSave={handleSaveBlog} onCancel={() => { setShowForm(false); setEditingItem(null); }} />}
            {activeTab === 'jobs' && <JobForm job={editingItem} onSave={handleSaveJob} onCancel={() => { setShowForm(false); setEditingItem(null); }} />}
            {activeTab === 'press' && <PressForm pressRelease={editingItem} onSave={handleSavePress} onCancel={() => { setShowForm(false); setEditingItem(null); }} />}
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{viewingItem.title}</h2>
              <Button variant="ghost" size="sm" onClick={() => { setShowViewModal(false); setViewingItem(null); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {activeTab === 'blogs' && (
              <div className="space-y-4">
                {viewingItem.featured_image && (
                  <img src={viewingItem.featured_image} alt={viewingItem.title} className="w-full h-64 object-cover rounded-lg" />
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>By {viewingItem.author}</span>
                  <span>•</span>
                  <span>{viewingItem.category}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded ${viewingItem.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {viewingItem.status}
                  </span>
                </div>
                {viewingItem.excerpt && (
                  <p className="text-lg text-gray-600 italic">{viewingItem.excerpt}</p>
                )}
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewingItem.content }} />
                {viewingItem.tags && (
                  <div className="flex flex-wrap gap-2">
                    {viewingItem.tags.split(',').map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-semibold">Department:</span> {viewingItem.department}</div>
                  <div><span className="font-semibold">Location:</span> {viewingItem.location}</div>
                  <div><span className="font-semibold">Type:</span> {viewingItem.type}</div>
                  <div><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded ${viewingItem.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{viewingItem.status}</span></div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{viewingItem.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-gray-700">{viewingItem.requirements}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Responsibilities</h3>
                  <p className="text-gray-700">{viewingItem.responsibilities}</p>
                </div>
              </div>
            )}

            {activeTab === 'press' && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <span>{new Date(viewingItem.date).toLocaleDateString()}</span>
                  <span> • </span>
                  <span className={`px-2 py-1 rounded ${viewingItem.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {viewingItem.status}
                  </span>
                </div>
                {viewingItem.excerpt && (
                  <p className="text-lg text-gray-600 italic">{viewingItem.excerpt}</p>
                )}
                <div className="prose max-w-none">
                  <p>{viewingItem.content}</p>
                </div>
                {viewingItem.link && (
                  <div>
                    <a href={viewingItem.link} target="_blank" rel="noopener noreferrer" className="text-[#578f82] hover:underline">
                      Read more →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Blog List Component
const BlogList: React.FC<{ blogs: BlogPost[]; onView: (blog: BlogPost) => void; onEdit: (blog: BlogPost) => void; onDelete: (id: string) => void }> = ({ blogs, onView, onEdit, onDelete }) => (
  <>
    {blogs.map((blog) => (
      <Card key={blog.id}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
              <p className="text-gray-600 mb-2">{blog.excerpt}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>By {blog.author}</span>
                <span>•</span>
                <span>{blog.category}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {blog.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onView(blog)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(blog)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(blog.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

// Job List Component
const JobList: React.FC<{ jobs: JobPosting[]; onView: (job: JobPosting) => void; onEdit: (job: JobPosting) => void; onDelete: (id: string) => void }> = ({ jobs, onView, onEdit, onDelete }) => (
  <>
    {jobs.map((job) => (
      <Card key={job.id}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                <span>{job.department}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {job.status}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onView(job)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(job)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(job.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

// Press List Component
const PressList: React.FC<{ press: PressRelease[]; onView: (press: PressRelease) => void; onEdit: (press: PressRelease) => void; onDelete: (id: string) => void }> = ({ press, onView, onEdit, onDelete }) => (
  <>
    {press.map((item) => (
      <Card key={item.id}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-2">{item.excerpt}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded ${item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => onView(item)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </>
);

// Blog Form Component
const BlogForm: React.FC<{ blog: BlogPost | null; onSave: (blog: Partial<BlogPost>) => void; onCancel: () => void }> = ({ blog, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: blog?.id || '',
    title: blog?.title || '',
    slug: blog?.slug || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    category: blog?.category || 'General',
    author: blog?.author || '',
    featured_image: blog?.featured_image || '',
    tags: blog?.tags || '',
    status: blog?.status || 'draft' as 'draft' | 'published' | 'archived'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{blog ? 'Edit' : 'Create'} Blog Post</h2>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="auto-generated-from-title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={10}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Author *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Featured Image URL</label>
          <input
            type="text"
            value={formData.featured_image}
            onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="parenting, tips, education"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#578f82] hover:bg-[#4a7c70]">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
};

// Job Form Component
const JobForm: React.FC<{ job: JobPosting | null; onSave: (job: Partial<JobPosting>) => void; onCancel: () => void }> = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: job?.id || '',
    title: job?.title || '',
    department: job?.department || '',
    location: job?.location || 'Remote',
    type: job?.type || 'Full-time',
    description: job?.description || '',
    requirements: job?.requirements || '',
    responsibilities: job?.responsibilities || '',
    status: job?.status || 'draft' as 'active' | 'closed' | 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{job ? 'Edit' : 'Create'} Job Posting</h2>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-1">Job Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Requirements</label>
          <textarea
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
            placeholder="List requirements (one per line or comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Responsibilities</label>
          <textarea
            value={formData.responsibilities}
            onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={4}
            placeholder="List responsibilities (one per line or comma-separated)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'closed' | 'draft' })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#578f82] hover:bg-[#4a7c70]">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
};

// Press Form Component
const PressForm: React.FC<{ pressRelease: PressRelease | null; onSave: (press: Partial<PressRelease>) => void; onCancel: () => void }> = ({ pressRelease, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: pressRelease?.id || '',
    title: pressRelease?.title || '',
    date: pressRelease?.date || new Date().toISOString().split('T')[0],
    excerpt: pressRelease?.excerpt || '',
    content: pressRelease?.content || '',
    link: pressRelease?.link || '',
    status: pressRelease?.status || 'draft' as 'published' | 'draft' | 'archived'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{pressRelease ? 'Edit' : 'Create'} Press Release</h2>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">External Link</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' | 'archived' })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-[#578f82] hover:bg-[#4a7c70]">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
};

export default ContentManagement;
