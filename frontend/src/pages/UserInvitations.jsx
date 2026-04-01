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
  Shield
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useWorkspace } from '../context/WorkspaceContext';
import WorkspaceGuard from '../components/WorkspaceGuard';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function UserInvitations() {
  const { apiFetch } = useApi();
  const { currentWorkspace } = useWorkspace();

  const [activeTab, setActiveTab] = useState('invitations');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [invitations, setInvitations] = useState([]);
  const [inviteLinks, setInviteLinks] = useState([]);
  const [inviteLinksLoading, setInviteLinksLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'caller',
    workspaceId: currentWorkspace?.id || '',
  });

  // Settings state
  const [settings, setSettings] = useState({
    defaultExpiryDays: 7,
    autoReminders: true,
    requireApproval: false,
    defaultRole: 'caller',
    maxUsesPerLink: 10,
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await apiFetch('/invitations/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          defaultExpiryDays: data.defaultExpiryDays || 7,
          autoReminders: data.autoReminders ?? true,
          requireApproval: data.requireApproval ?? false,
          defaultRole: data.defaultRole || 'caller',
          maxUsesPerLink: data.maxUsesPerLink || 10,
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const res = await apiFetch('/invitations/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  // Load settings when settings tab is active
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/invitations/pending');
      const data = await res.json();
      setInvitations(data.data || data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteLinks = async () => {
    setInviteLinksLoading(true);
    try {
      const res = await apiFetch('/invitations/links');
      if (res.ok) {
        const data = await res.json();
        // Handle both direct array response and wrapped response (e.g., { data: [...] } or { links: [...] })
        let links = [];
        if (Array.isArray(data)) {
          links = data;
        } else if (data && typeof data === 'object') {
          // Check for common wrapped response patterns
          if (Array.isArray(data.data)) {
            links = data.data;
          } else if (Array.isArray(data.links)) {
            links = data.links;
          } else if (Array.isArray(data.inviteLinks)) {
            links = data.inviteLinks;
          }
        }
        setInviteLinks(links);
      }
    } catch (error) {
      console.error('Error fetching invite links:', error);
    } finally {
      setInviteLinksLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    fetchInviteLinks();
  }, []);

  const handleSendInvitation = async () => {
    if (!inviteForm.email) {
      toast.error('Email is required');
      return;
    }

    try {
      const res = await apiFetch('/invitations', {
        method: 'POST',
        body: JSON.stringify(inviteForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to send invitation');
      }

      const result = await res.json();
      setInvitations([result, ...invitations]);
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        name: '',
        role: 'caller',
        workspaceId: currentWorkspace?.id || '',
      });

      toast.success('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const deleteInvitation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invitation?')) return;

    try {
      const res = await apiFetch(`/invitations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setInvitations(invitations.filter(inv => inv.id !== id));
        toast.success('Invitation cancelled');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to cancel invitation');
      }
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const [linkForm, setLinkForm] = useState({
    name: '',
    role: 'caller',
    workspaceId: currentWorkspace?.id || '',
    maxUses: 10,
    expiresAt: '',
  });

  const tabs = [
    { id: 'invitations', label: 'Email Invitations', icon: Mail, count: invitations.length },
    { id: 'links', label: 'Invite Links', icon: Link, count: inviteLinks.length },
    { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
  ];

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to all features' },
    { value: 'manager', label: 'Manager', description: 'Manage team and view reports' },
    { value: 'caller', label: 'Caller', description: 'Standard telecaller access' },
    { value: 'agent', label: 'Agent', description: 'Basic lead management' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access' }
  ];

  const handleCreateInviteLink = async () => {
    try {
      const res = await apiFetch('/invitations/links', {
        method: 'POST',
        body: JSON.stringify({
          name: linkForm.name || 'Team Invitation',
          role: linkForm.role,
          maxUses: linkForm.maxUses || null,
          expiresAt: linkForm.expiresAt || null,
        }),
      });
      if (res.ok) {
        toast.success('Invite link created successfully!');
        setShowLinkModal(false);
        fetchInviteLinks();
        setLinkForm({
          name: '',
          role: 'caller',
          workspaceId: currentWorkspace?.id || '',
          maxUses: 10,
          expiresAt: '',
        });
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to create invite link');
      }
    } catch (error) {
      console.error('Error creating invite link:', error);
      toast.error('Failed to create invite link');
    }
  };

  const deleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this invite link?')) return;
    try {
      const res = await apiFetch(`/invitations/links/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Invite link deleted');
        fetchInviteLinks();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to delete invite link');
      }
    } catch (error) {
      console.error('Error deleting invite link:', error);
      toast.error('Failed to delete invite link');
    }
  };

  const toggleLinkActive = async (id) => {
    try {
      const res = await apiFetch(`/invitations/links/${id}/toggle`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Invite link status updated');
        fetchInviteLinks();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to update link');
      }
    } catch (error) {
      console.error('Error toggling link:', error);
      toast.error('Failed to update link');
    }
  };

  const toggleLinkStatus = (linkId) => {
    setInviteLinks(inviteLinks.map(link =>
      link.id === linkId ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const resendInvitation = async (id) => {
    try {
      const res = await apiFetch(`/invitations/${id}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Invitation email resent successfully!');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Failed to resend invitation');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast.error('Failed to resend invitation');
    }
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

  const renderLinksTab = () => {
    // Ensure inviteLinks is always an array for safety
    const safeInviteLinks = Array.isArray(inviteLinks) ? inviteLinks : [];
    
    return (
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

      {inviteLinksLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : safeInviteLinks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Link className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No invite links created yet</p>
          <p className="text-sm">Create your first invite link to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeInviteLinks.map((link) => {
            const frontendUrl = window.location.origin;
            const linkUrl = `${frontendUrl}/invite/link/${link.token}`;
            return (
              <div key={link.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{link.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${link.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {link.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{getRoleBadge(link.role)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uses:</span>
                    <span className="font-medium">{link.uses_count}/{link.max_uses || '∞'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(link.created_at).toLocaleDateString()}</span>
                  </div>
                  {link.expires_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">{new Date(link.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                    {linkUrl}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(linkUrl)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={() => toggleLinkActive(link.id)}
                      className="px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                    >
                      {link.is_active ? 'Deactivate' : 'Activate'}
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
            );
          })}
        </div>
      )}
    </div>
  );
  };

  const renderSettingsTab = () => (
    <div className="p-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Invitation Settings</h2>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Default Role for Invitations</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Role
                </label>
                <select
                  value={settings.defaultRole}
                  onChange={(e) => setSettings({ ...settings, defaultRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-500">
                New invitations will use this role by default. You can change the role for individual invitations.
              </p>
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
                  value={settings.defaultExpiryDays}
                  onChange={(e) => setSettings({ ...settings, defaultExpiryDays: parseInt(e.target.value) || 7 })}
                  min="1"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Invitations will expire after this many days.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Uses per Invite Link
                </label>
                <input
                  type="number"
                  value={settings.maxUsesPerLink}
                  onChange={(e) => setSettings({ ...settings, maxUsesPerLink: parseInt(e.target.value) || 10 })}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum number of times an invite link can be used.</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-reminders"
                  checked={settings.autoReminders}
                  onChange={(e) => setSettings({ ...settings, autoReminders: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="auto-reminders" className="text-sm text-gray-700">
                  Send automatic reminders for pending invitations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="require-approval"
                  checked={settings.requireApproval}
                  onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                  className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="require-approval" className="text-sm text-gray-700">
                  Require admin approval for new user registrations via invite links
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={settingsLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {settingsLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
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
    <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col h-full min-w-0">
        <Header setIsSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-hidden">
          <WorkspaceGuard>
            <div className="flex h-full bg-gray-50">
              {/* Inner Management Sidebar */}
              <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-500" />
                    Invitations
                  </h1>
                </div>

                <nav className="px-4 pb-6 flex-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-xl transition-all ${activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-100/50'
                          : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4.5 h-4.5" />
                          <span className="text-sm">{tab.label}</span>
                        </div>
                        {tab.count > 0 && (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {renderTabContent()}
                </div>
              </div>
            </div>
          </WorkspaceGuard>
        </main>
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
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
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
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
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
                  onChange={(e) => setLinkForm({ ...linkForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sales Team Invitation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={linkForm.role}
                  onChange={(e) => setLinkForm({ ...linkForm, role: e.target.value })}
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
                  onChange={(e) => setLinkForm({ ...linkForm, maxUses: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input
                  type="date"
                  value={linkForm.expiresAt}
                  onChange={(e) => setLinkForm({ ...linkForm, expiresAt: e.target.value })}
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
    </div>
  );
}
