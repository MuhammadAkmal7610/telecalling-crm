import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Eye,
  Filter,
  Search,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Save,
  Upload,
  Download,
  Settings,
  Zap,
  Target,
  MessageSquare,
  FileText,
  ArrowRight,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function EmailCampaigns() {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    fetchEmailData();
  }, [activeTab, currentWorkspace]);

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'campaigns') {
        await fetchCampaigns();
      } else if (activeTab === 'templates') {
        await fetchTemplates();
      } else if (activeTab === 'automation') {
        await fetchAutomations();
      } else if (activeTab === 'analytics') {
        await fetchAnalytics();
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await apiFetch('/email/campaigns' + (statusFilter ? `?status=${statusFilter}` : ''));
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await apiFetch('/email/templates');
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    }
  };

  const fetchAutomations = async () => {
    try {
      const res = await apiFetch('/email/automation');
      const data = await res.json();
      setAutomations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      setAutomations([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await apiFetch('/email/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(null);
    }
  };

  const CampaignModal = () => {
    const [campaignData, setCampaignData] = useState({
      name: '',
      description: '',
      template_id: '',
      schedule_type: 'immediate',
      scheduled_at: '',
      target_audience: {
        leads: [],
        filters: {},
      },
      sender_email: '',
      sender_name: '',
      reply_to_email: '',
      track_opens: true,
      track_clicks: true,
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await apiFetch('/email/campaigns', {
          method: 'POST',
          body: JSON.stringify(campaignData),
        });
        
        if (res.ok) {
          setShowCampaignModal(false);
          fetchCampaigns();
          alert('Campaign created successfully!');
        }
      } catch (error) {
        alert('Failed to create campaign');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
              </h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={campaignData.name}
                onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => setCampaignData({...campaignData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe your campaign"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={campaignData.template_id}
                  onChange={(e) => setCampaignData({...campaignData, template_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <select
                  value={campaignData.schedule_type}
                  onChange={(e) => setCampaignData({...campaignData, schedule_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="immediate">Send Immediately</option>
                  <option value="scheduled">Schedule Later</option>
                  <option value="recurring">Recurring</option>
                </select>
              </div>
            </div>

            {campaignData.schedule_type === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={campaignData.scheduled_at}
                  onChange={(e) => setCampaignData({...campaignData, scheduled_at: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Email
                </label>
                <input
                  type="email"
                  required
                  value={campaignData.sender_email}
                  onChange={(e) => setCampaignData({...campaignData, sender_email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sender@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Name
                </label>
                <input
                  type="text"
                  required
                  value={campaignData.sender_name}
                  onChange={(e) => setCampaignData({...campaignData, sender_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reply-to Email
              </label>
              <input
                type="email"
                value={campaignData.reply_to_email}
                onChange={(e) => setCampaignData({...campaignData, reply_to_email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="replies@company.com"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={campaignData.track_opens}
                  onChange={(e) => setCampaignData({...campaignData, track_opens: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Track opens</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={campaignData.track_clicks}
                  onChange={(e) => setCampaignData({...campaignData, track_clicks: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Track clicks</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedCampaign ? 'Update Campaign' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TemplateModal = () => {
    const [templateData, setTemplateData] = useState({
      name: '',
      subject: '',
      content: '',
      html_content: '',
      category: 'marketing',
      variables: [],
      status: 'draft',
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const res = await apiFetch('/email/templates', {
          method: 'POST',
          body: JSON.stringify(templateData),
        });
        
        if (res.ok) {
          setShowTemplateModal(false);
          fetchTemplates();
          alert('Template created successfully!');
        }
      } catch (error) {
        alert('Failed to create template');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  value={templateData.name}
                  onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Welcome Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={templateData.category}
                  onChange={(e) => setTemplateData({...templateData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="marketing">Marketing</option>
                  <option value="transactional">Transactional</option>
                  <option value="automation">Automation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                required
                value={templateData.subject}
                onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Welcome to our platform!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <textarea
                value={templateData.content}
                onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={8}
                placeholder="Dear {{name}},&#10;&#10;Welcome to our platform!&#10;&#10;Best regards,&#10;The Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content (Optional)
              </label>
              <textarea
                value={templateData.html_content}
                onChange={(e) => setTemplateData({...templateData, html_content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
                placeholder="<h1>Dear {{name}}</h1><p>Welcome to our platform!</p>"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Variables</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Use variables like {'{{name}}'}, {'{{email}}'}, {'{{company}}'} in your subject and content. 
                    These will be replaced with actual data when sending emails.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderCampaigns = () => {
    // Ensure campaigns is an array before filtering
    const campaignsArray = Array.isArray(campaigns) ? campaigns : [];
    const filteredCampaigns = campaignsArray.filter(campaign =>
      campaign.name && campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
      switch (status) {
        case 'draft': return 'bg-gray-100 text-gray-800';
        case 'scheduled': return 'bg-blue-100 text-blue-800';
        case 'running': return 'bg-yellow-100 text-yellow-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'paused': return 'bg-orange-100 text-orange-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case 'draft': return <FileText className="w-4 h-4" />;
        case 'scheduled': return <Calendar className="w-4 h-4" />;
        case 'running': return <Clock className="w-4 h-4" />;
        case 'completed': return <CheckCircle className="w-4 h-4" />;
        case 'paused': return <Pause className="w-4 h-4" />;
        case 'cancelled': return <X className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
            <p className="text-gray-600">Create and manage your email campaigns</p>
          </div>
          <button
            onClick={() => setShowCampaignModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-lg border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-600 mb-4">Create your first email campaign to get started</p>
              <button
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          {campaign.description && (
                            <div className="text-sm text-gray-500">{campaign.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          <span className="ml-1">{campaign.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {campaign.sent_count || 0} / {campaign.total_recipients || 0}
                        </div>
                        <div className="text-xs text-gray-500">sent / total</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                            {campaign.delivered_count || 0}
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-blue-500 mr-1" />
                            {campaign.opened_count || 0}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-4 h-4 text-purple-500 mr-1" />
                            {campaign.clicked_count || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowAnalyticsModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="View Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (campaign.status === 'draft' || campaign.status === 'paused') {
                                // Execute campaign
                                apiFetch(`/email/campaigns/${campaign.id}/execute`, { method: 'POST' })
                                  .then(() => fetchCampaigns());
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title={campaign.status === 'draft' || campaign.status === 'paused' ? 'Execute' : 'View'}
                          >
                            {campaign.status === 'draft' || campaign.status === 'paused' ? (
                              <Play className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600" title="More">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTemplates = () => {
    const filteredTemplates = templates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
            <p className="text-gray-600">Create and manage reusable email templates</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Create your first email template to get started</p>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.subject}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    template.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {template.content || 'No content'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize">{template.category}</span>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAutomation = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
            <p className="text-gray-600">Set up automated email sequences and triggers</p>
          </div>
          <button
            onClick={() => setShowAutomationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Automation
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Email Automation</h3>
          <p className="text-gray-600 mb-4">Create powerful automation workflows for your email campaigns</p>
          <button
            onClick={() => setShowAutomationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Automation
          </button>
        </div>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Analytics</h2>
          <p className="text-gray-600">Monitor your email performance and engagement</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Emails</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalEmails}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.deliveryRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.openRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.clickRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <BarChart3 className="w-12 h-12 mr-4" />
            <span>Performance charts will be displayed here</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>Email Marketing</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'automation' && renderAutomation()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Modals */}
      {showCampaignModal && <CampaignModal />}
      {showTemplateModal && <TemplateModal />}
    </div>
  );
}
