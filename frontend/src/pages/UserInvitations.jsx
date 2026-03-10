import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Link, 
  Copy, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Edit,
  Calendar,
  Shield,
  BuildingOffice,
  UserGroup
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import WorkspaceGuard from '../components/WorkspaceGuard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function UserInvitations() {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();
  
  const [activeTab, setActiveTab] = useState('invitations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Mock data - in real app, fetch from API
  const [invitations, setInvitations] = useState([
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'sales',
      status: 'pending',
      invitedBy: 'Admin User',
      invitedAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-01-22T10:30:00Z',
      message: 'Join our sales team to help grow the business!',
      workspace: 'Main Workspace',
      permissions: {
        canManageUsers: false,
        canManageSettings: false,
        canViewReports: true,
        canManageLeads: true,
        canManageCampaigns: false
      }
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'manager',
      status: 'accepted',
      invitedBy: 'Admin User',
      invitedAt: '2024-01-10T14:20:00Z',
      acceptedAt: '2024-01-11T09:15:00Z',
      workspace: 'Main Workspace',
      permissions: {
        canManageUsers: true,
        canManageSettings: false,
        canViewReports: true,
        canManageLeads: true,
        canManageCampaigns: true
      }
    },
    {
      id: '3',
      email: 'mike.wilson@example.com',
      name: 'Mike Wilson',
      role: 'agent',
      status: 'expired',
      invitedBy: 'Admin User',
      invitedAt: '2024-01-05T11:00:00Z',
      expiresAt: '2024-01-12T11:00:00Z',
      workspace: 'Main Workspace',
      permissions: {
        canManageUsers: false,
        canManageSettings: false,
        canViewReports: false,
        canManageLeads: true,
        canManageCampaigns: false
      }
    }
  ]);

  const [inviteLinks, setInviteLinks] = useState([
    {
      id: '1',
      name: 'Sales Team Invitation',
      role: 'sales',
      workspace: 'Main Workspace',
      link: 'https://your-crm.app/invite/abc123def456',
      isActive: true,
      uses: 5,
      maxUses: 10,
      expiresAt: '2024-02-15T23:59:59Z',
      createdAt: '2024-01-15T10:30:00Z',
      createdBy: 'Admin User'
    },
    {
      id: '2',
      name: 'Manager Access Link',
      role: 'manager',
      workspace: 'Main Workspace',
      link: 'https://your-crm.app/invite/xyz789uvw012',
      isActive: false,
      uses: 2,
      maxUses: 5,
      expiresAt: '2024-01-31T23:59:59Z',
      createdAt: '2024-01-10T14:20:00Z',
      createdBy: 'Admin User'
    }
  ]);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'sales',
    message: '',
    workspace: currentWorkspace?.id || '',
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canViewReports: true,
      canManageLeads: true,
      canManageCampaigns: false
    }
  });

  const [linkForm, setLinkForm] = useState({
    name: '',
    role: 'sales',
    workspace: currentWorkspace?.id || '',
    maxUses: 10,
    expiresAt: '',
    permissions: {
      canManageUsers: false,
      canManageSettings: false,
      canViewReports: true,
      canManageLeads: true,
      canManageCampaigns: false
    }
  });

  const tabs = [
    { id: 'invitations', label: 'Email Invitations', icon: Mail, count: invitations.length },
    { id: 'links', label: 'Invite Links', icon: Link, count: inviteLinks.length },
    { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
  ];

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'manager', label: 'Manager', description: 'Manage team and view reports' },
    { value: 'sales', label: 'Sales', description: 'Manage leads and campaigns' },
    { value: 'agent', label: 'Agent', description: 'Basic lead management' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' }
  ];

  const handleSendInvitation = async () => {
    try {
      // API call to send invitation
      const newInvitation = {
        id: Date.now().toString(),
        ...inviteForm,
        status: 'pending',
        invitedBy: 'Current User',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        workspace: currentWorkspace?.name || 'Main Workspace'
      };

      setInvitations([...invitations, newInvitation]);
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        name: '',
        role: 'sales',
        message: '',
        workspace: currentWorkspace?.id || '',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        }
      });

      // Show success message
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation');
    }
  };

  const handleCreateInviteLink = async () => {
    try {
      const token = Math.random().toString(36).substring(2, 15);
      const newLink = {
        id: Date.now().toString(),
        ...linkForm,
        link: `https://your-crm.app/invite/${token}`,
        isActive: true,
        uses: 0,
        createdAt: new Date().toISOString(),
        createdBy: 'Current User'
      };

      setInviteLinks([...inviteLinks, newLink]);
      setShowLinkModal(false);
      setLinkForm({
        name: '',
        role: 'sales',
        workspace: currentWorkspace?.id || '',
        maxUses: 10,
        expiresAt: '',
        permissions: {
          canManageUsers: false,
          canManageSettings: false,
          canViewReports: true,
          canManageLeads: true,
          canManageCampaigns: false
        }
      });

      alert('Invite link created successfully!');
    } catch (error) {
      console.error('Error creating invite link:', error);
      alert('Failed to create invite link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleLinkStatus = (linkId) => {
    setInviteLinks(inviteLinks.map(link =>
      link.id === linkId ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const deleteInvitation = (id) => {
    if (confirm('Are you sure you want to delete this invitation?')) {
      setInvitations(invitations.filter(inv => inv.id !== id));
    }
  };

  const deleteLink = (id) => {
    if (confirm('Are you sure you want to delete this invite link?')) {
      setInviteLinks(inviteLinks.filter(link => link.id !== id));
    }
  };

  const resendInvitation = (id) => {
    // API call to resend invitation
    alert('Invitation resent successfully!');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      agent: 'bg-orange-100 text-orange-800',
      viewer: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        <Shield className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const renderInvitationsTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Invitations</h2>
          <p className="text-sm text-gray-500">Manage email invitations sent to team members</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Send Invitation
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search invitations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invited By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invitation.name || invitation.email}</div>
                      <div className="text-sm text-gray-500">{invitation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(invitation.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invitation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invitation.invitedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(invitation.invitedAt).toLocaleDateString()}</div>
                    {invitation.status === 'pending' && (
                      <div className="text-xs text-gray-400">
                        Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {invitation.status === 'pending' && (
                        <button
                          onClick={() => resendInvitation(invitation.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Resend"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteInvitation(invitation.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLinksTab = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Invite Links</h2>
          <p className="text-sm text-gray-500">Create shareable links for team members to join</p>
        </div>
        <button
          onClick={() => setShowLinkModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Link className="w-4 h-4" />
          Create Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inviteLinks.map((link) => (
          <div key={link.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{link.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleLinkStatus(link.id)}
                  className={`p-1 rounded ${link.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  title={link.isActive ? 'Active' : 'Inactive'}
                >
                  {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium">{getRoleBadge(link.role)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uses:</span>
                <span className="font-medium">{link.uses}/{link.maxUses || '∞'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{new Date(link.createdAt).toLocaleDateString()}</span>
              </div>
              {link.expiresAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-medium">{new Date(link.expiresAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                {link.link}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(link.link)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Invitation Settings</h2>
        
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Permissions</h3>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{role.label}</h4>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    {getRoleBadge(role.value)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Manage Users
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Manage Settings
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      View Reports
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Manage Leads
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Manage Campaigns
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      View Analytics
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Invitation Expiry (days)
                </label>
                <input
                  type="number"
                  defaultValue="7"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses per Invite Link
                </label>
                <input
                  type="number"
                  defaultValue="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="auto-reminders" className="mr-2" />
                <label htmlFor="auto-reminders" className="text-sm text-gray-700">
                  Send automatic reminders for pending invitations
                </label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="require-approval" className="mr-2" />
                <label htmlFor="require-approval" className="text-sm text-gray-700">
                  Require admin approval for new user registrations
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'invitations':
        return renderInvitationsTab();
      case 'links':
        return renderLinksTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderInvitationsTab();
    }
  };

  return (
    <WorkspaceGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-500" />
              User Invitations
            </h1>
          </div>

          <nav className="px-4 pb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  Manage team invitations and access control
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-y-auto">
            {renderTabContent()}
          </main>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Invitation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({...inviteForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({...inviteForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Welcome to our team! We're excited to have you on board."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitation}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Invite Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Name *</label>
                <input
                  type="text"
                  value={linkForm.name}
                  onChange={(e) => setLinkForm({...linkForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sales Team Invitation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={linkForm.role}
                  onChange={(e) => setLinkForm({...linkForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input
                  type="number"
                  value={linkForm.maxUses}
                  onChange={(e) => setLinkForm({...linkForm, maxUses: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input
                  type="date"
                  value={linkForm.expiresAt}
                  onChange={(e) => setLinkForm({...linkForm, expiresAt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInviteLink}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceGuard>
  );
}
