import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Ban, 
  CheckCircle, 
  RefreshCw, 
  Key, 
  Filter, 
  Edit, 
  BarChart, 
  ArrowRight, 
  Trash2, 
  Share2, 
  Building, 
  Globe, 
  Users,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Activity,
  Check
} from 'lucide-react';
import UiModal from './UiModal';

export default function WorkspaceTab({ 
  workspaces = [], 
  organizations = [],
  users = [],
  workspaceShares = [],
  onShareWorkspace,
  onRevokeShare,
  selectedOrgId = 'ALL',
  setSelectedOrgId,
  selectedWorkspaceId = 'ALL',
  setSelectedWorkspaceId,
  onUpdateWorkspace, 
  onCreateWorkspace, 
  onDeleteWorkspace,
  onUpdateOrganization,
  onCreateOrganization,
  onDeleteOrganization,
  searchQuery = '',
  authToken = null,
  apiBaseUrl = 'http://localhost:3000/api/v1/admin'
}) {
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [isEditOrgModalOpen, setIsEditOrgModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Live users per-workspace fetched from backend
  const [liveUsers, setLiveUsers] = useState([]);
  const [wsUsersLoading, setWsUsersLoading] = useState(false);
  const [wsUsersError, setWsUsersError] = useState(null);
  const [expandedWsUsers, setExpandedWsUsers] = useState({});

  useEffect(() => {
    if (!authToken) return;
    setWsUsersLoading(true);
    fetch(`${apiBaseUrl}/super-users`, {
      headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' }
    })
      .then(r => r.json())
      .then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) setLiveUsers(data);
        setWsUsersLoading(false);
      })
      .catch(() => {
        setWsUsersError('Using offline user data');
        setWsUsersLoading(false);
      });
  }, [authToken, apiBaseUrl]);

  // Prefer live backend users; fall back to prop users
  const allUsers = liveUsers.length > 0 ? liveUsers : users;

  const toggleWsUsers = (wsId) => {
    setExpandedWsUsers(prev => ({ ...prev, [wsId]: !prev[wsId] }));
  };

  // Subgrid row expansion state
  const [expandedOrgRows, setExpandedOrgRows] = useState({});

  const toggleOrgRow = (orgId) => {
    setExpandedOrgRows(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  // New workspace form state
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    subdomain: '',
    owner: '',
    plan: 'Growth',
    status: 'Active',
    callingMinutes: 0,
    whatsappMessages: 0,
    orgId: organizations[0]?.id || 'org-1'
  });

  // New Organization form state
  const [newOrg, setNewOrg] = useState({
    name: '',
    tier: 'Growth',
    status: 'Active',
    workspacesQuota: 5,
    usersQuota: 20
  });

  // Edit Organization state
  const [editingOrg, setEditingOrg] = useState(null);

  // Share Workspace form state
  const [newShare, setNewShare] = useState({
    workspaceId: workspaces[0]?.id || 'ws-1',
    userId: users[0]?.id || 'usr-1',
    role: 'Viewer'
  });

  // Edit workspace state
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Filter workspaces based on search query, plan, status, org, and workspace
  const filteredWorkspaces = workspaces.filter(ws => {
    const parentOrg = organizations.find(o => o.id === ws.orgId);
    const orgName = parentOrg ? parentOrg.name : '';
    
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ws.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ws.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          orgName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || ws.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || ws.status === filterStatus;
    const matchesOrg = selectedOrgId === 'ALL' || ws.orgId === selectedOrgId;
    const matchesWorkspace = selectedWorkspaceId === 'ALL' || ws.id === selectedWorkspaceId;
    
    return matchesSearch && matchesPlan && matchesStatus && matchesOrg && matchesWorkspace;
  });

  // Filter shared workspaces mappings
  const filteredShares = workspaceShares.filter(share => {
    const ws = workspaces.find(w => w.id === share.workspaceId);
    const user = users.find(u => u.id === share.userId);
    if (!ws) return false;

    const matchesOrg = selectedOrgId === 'ALL' || ws.orgId === selectedOrgId;
    const matchesWorkspace = selectedWorkspaceId === 'ALL' || ws.id === selectedWorkspaceId;
    const matchesPlan = filterPlan === 'ALL' || ws.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || ws.status === filterStatus;
    
    let matchesSearch = true;
    if (searchQuery) {
      const parentOrg = organizations.find(o => o.id === ws.orgId);
      const orgName = parentOrg ? parentOrg.name : '';
      const userName = user ? user.name : '';
      matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      orgName.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesOrg && matchesWorkspace && matchesPlan && matchesStatus && matchesSearch;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newWorkspace.name || !newWorkspace.subdomain || !newWorkspace.owner) {
      alert('Please fill out all required fields.');
      return;
    }

    // Check resource limits
    const targetOrg = organizations.find(o => o.id === newWorkspace.orgId);
    if (targetOrg && targetOrg.workspacesCount >= targetOrg.workspacesQuota) {
      alert(`Resource limit exceeded! Organization ${targetOrg.name} has exhausted its workspaces quota (${targetOrg.workspacesCount}/${targetOrg.workspacesQuota}). Please upgrade tier or delete workspaces first.`);
      return;
    }

    onCreateWorkspace({
      ...newWorkspace,
      id: `ws-${Date.now()}`,
      created_at: new Date().toISOString().split('T')[0]
    });

    setNewWorkspace({
      name: '',
      subdomain: '',
      owner: '',
      plan: 'Growth',
      status: 'Active',
      callingMinutes: 0,
      whatsappMessages: 0,
      orgId: organizations[0]?.id || 'org-1'
    });
    setIsNewModalOpen(false);
  };

  const handleCreateOrgSubmit = (e) => {
    e.preventDefault();
    if (!newOrg.name) return;

    onCreateOrganization({
      ...newOrg,
      id: `org-${Date.now()}`,
      workspacesCount: 0,
      usersCount: 0,
      stripeCustomerId: `cus_${newOrg.name.replace(/\s+/g, '').substring(0, 8)}${Math.floor(100 + Math.random() * 900)}`,
      stripeSync: 'Synced',
      primaryColor: '#6366f1',
      customTitle: `${newOrg.name} CRM Node`
    });

    setNewOrg({
      name: '',
      tier: 'Growth',
      status: 'Active',
      workspacesQuota: 5,
      usersQuota: 20
    });
    setIsNewOrgModalOpen(false);
  };

  const handleEditOrgSubmit = (e) => {
    e.preventDefault();
    if (!editingOrg) return;

    onUpdateOrganization(editingOrg.id, editingOrg);
    setIsEditOrgModalOpen(false);
    setEditingOrg(null);
    alert(`Organization "${editingOrg.name}" successfully updated!`);
  };

  const handleShareSubmit = (e) => {
    e.preventDefault();
    if (!newShare.workspaceId || !newShare.userId) return;

    onShareWorkspace(newShare);
    setIsShareModalOpen(false);
    alert('Workspace access granted successfully!');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdateWorkspace(editingWorkspace.id, editingWorkspace);
    setIsEditModalOpen(false);
    setEditingWorkspace(null);
  };

  const toggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    onUpdateWorkspace(id, { status: nextStatus });
  };

  const toggleOrgStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    onUpdateOrganization(id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      
      {/* Search and Quick Filters */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4 p-4 glass-panel border-brand-border/60 rounded-xl bg-gradient-to-r from-[#161c2c]/30 to-[#111522]/30">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Org Filter (Dynamic Selection) */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Building size={12} className="text-indigo-400" />
            <span className="font-bold text-[10px] text-brand-text/50 uppercase mr-1">Org:</span>
            <select 
              value={selectedOrgId} 
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                setSelectedWorkspaceId('ALL'); // Reset workspace filter
              }}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4 cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Organizations</option>
              {organizations.map(o => (
                <option key={o.id} value={o.id} style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>{o.name}</option>
              ))}
            </select>
          </div>

          {/* Workspace Filter (Dynamic Selection) */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Globe size={12} className="text-cyan-400" />
            <span className="font-bold text-[10px] text-brand-text/50 uppercase mr-1">WS:</span>
            <select 
              value={selectedWorkspaceId} 
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4 cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Workspaces</option>
              {workspaces
                .filter(w => selectedOrgId === 'ALL' || w.orgId === selectedOrgId)
                .map(w => (
                  <option key={w.id} value={w.id} style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>{w.name}</option>
                ))}
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Filter size={12} className="text-indigo-400" />
            <select 
              value={filterPlan} 
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4 cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Plans</option>
              <option value="Starter" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Starter</option>
              <option value="Growth" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Growth</option>
              <option value="Enterprise" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Enterprise</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <CheckCircle size={12} className="text-emerald-400" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4 cursor-pointer"
              style={{ backgroundColor: 'transparent' }}
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Status</option>
              <option value="Active" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Active</option>
              <option value="Suspended" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Suspended</option>
              <option value="Trial" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Trial</option>
            </select>
          </div>
        </div>

        {/* Create Operations Buttons */}
        <div className="flex flex-wrap gap-2.5 w-full xl:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            disabled={workspaces.length === 0 || users.length === 0}
            className="flex-1 xl:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Share2 size={14} />
            <span>Share Workspace</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewOrgModalOpen(true)}
            className="flex-1 xl:flex-none flex items-center justify-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Organization</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="flex-1 xl:flex-none flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Provision Workspace</span>
          </button>
        </div>
      </div>

      {/* 1. Organizations Directory (Multi-Tenant Governance) */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl bg-[#0c0f17]/40">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
            Client Organizations Directory
          </h4>
          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
            GOVERNANCE_ENGINE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-3 py-4 w-10"></th>
                <th className="px-6 py-4">Organization Name</th>
                <th className="px-6 py-4">Subscription Package</th>
                <th className="px-6 py-4">Workspace Resource Quotas</th>
                <th className="px-6 py-4">User Seats Quotas</th>
                <th className="px-6 py-4">Stripe Billing Link</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-sans">
              {organizations
                .filter(org => {
                  const matchesSearch = !searchQuery || org.name.toLowerCase().includes(searchQuery.toLowerCase()) || org.id.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesOrg = selectedOrgId === 'ALL' || org.id === selectedOrgId;
                  const matchesPlan = filterPlan === 'ALL' || org.tier === filterPlan;
                  const matchesStatus = filterStatus === 'ALL' || org.status === filterStatus;
                  return matchesSearch && matchesOrg && matchesPlan && matchesStatus;
                })
                .map((org) => {
                  const isExpanded = !!expandedOrgRows[org.id];
                  const orgWorkspaces = workspaces.filter(ws => ws.orgId === org.id);
                  
                  // Users related to this Organization (directly assigned or shared)
                  const orgWorkspaceNames = orgWorkspaces.map(ws => ws.name);
                  const orgWorkspaceIds = orgWorkspaces.map(ws => ws.id);
                  const relatedUsers = users.filter(u => {
                    const isPrimary = orgWorkspaceNames.includes(u.currentWorkspace);
                    const isShared = workspaceShares.some(share => 
                      orgWorkspaceIds.includes(share.workspaceId) && share.userId === u.id
                    );
                    return isPrimary || isShared;
                  });

                  return (
                    <React.Fragment key={org.id}>
                      <tr className={`hover:bg-[#131722]/50 transition-colors duration-150 ${isExpanded ? 'bg-[#161c2c]/20' : ''}`}>
                        <td className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleOrgRow(org.id)}
                            className="p-1 rounded bg-[#1b2030] border border-brand-border/60 hover:border-brand-primary/40 text-brand-text hover:text-brand-text-bright transition-all"
                            title={isExpanded ? "Collapse Details" : "Expand Workspaces & Users Subgrid"}
                          >
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-bold text-brand-text-bright">
                          {org.name}
                          <div className="text-[10px] text-brand-text/50 font-normal font-mono mt-0.5">{org.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold text-[10px]">
                            {org.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span>Workspaces:</span>
                              <span className="font-bold text-brand-text-bright">{org.workspacesCount} / {org.workspacesQuota}</span>
                            </div>
                            <div className="w-full bg-[#1b2030] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-cyan-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, (org.workspacesCount / org.workspacesQuota) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 w-28">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span>Seats:</span>
                              <span className="font-bold text-brand-text-bright">{org.usersCount} / {org.usersQuota}</span>
                            </div>
                            <div className="w-full bg-[#1b2030] h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-full rounded-full" 
                                style={{ width: `${Math.min(100, (org.usersCount / org.usersQuota) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-cyan-400 font-mono">
                          {org.stripeCustomerId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                            org.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {org.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center space-x-1">
                          {/* Edit Organization Modal Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOrg(org);
                              setIsEditOrgModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-indigo-500/50 transition-all"
                            title="Edit Organization Details & Status"
                          >
                            <Edit size={12} />
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            onClick={() => toggleOrgStatus(org.id, org.status)}
                            className={`p-1.5 rounded border transition-all ${
                              org.status === 'Active'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={org.status === 'Active' ? 'Suspend Organization' : 'Activate Organization'}
                          >
                            <Ban size={12} />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onDeleteOrganization(org.id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                            title="De-provision Organization"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>

                      {/* WORKSPACES & USERS SUBGRID */}
                      {isExpanded && (
                        <tr className="bg-[#0b0e16]/80 border-t border-b border-brand-border/40">
                          <td colSpan="8" className="px-8 py-5">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-slide-down">
                              
                              {/* Left Sub-table: Workspaces */}
                              <div className="bg-[#121625]/60 border border-brand-border/40 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                                  <span className="text-xs font-bold text-brand-text-bright flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                    <Globe size={12} className="text-cyan-400" />
                                    Active Workspaces ({orgWorkspaces.length})
                                  </span>
                                  <span className="text-[10px] text-brand-text/40">PROVISIONED_NODES</span>
                                </div>

                                {orgWorkspaces.length === 0 ? (
                                  <p className="text-xs text-brand-text/50 text-center py-4">No workspaces mapped to this organization.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="text-[9px] uppercase font-mono font-bold text-brand-text/40 border-b border-brand-border/30">
                                          <th className="pb-2">Workspace Name</th>
                                          <th className="pb-2">Subdomain</th>
                                          <th className="pb-2">Owner</th>
                                          <th className="pb-2">Plan</th>
                                          <th className="pb-2 text-right">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-brand-border/20 text-[11px]">
                                        {orgWorkspaces.map(ws => (
                                          <tr key={ws.id} className="hover:bg-[#1b2032]/40">
                                            <td className="py-2 text-brand-text-bright font-semibold">{ws.name}</td>
                                            <td className="py-2 font-mono text-cyan-400">{ws.subdomain}.telecrm.io</td>
                                            <td className="py-2 text-brand-text/80">{ws.owner}</td>
                                            <td className="py-2 text-brand-text/70">{ws.plan}</td>
                                            <td className="py-2 text-right">
                                              <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                ws.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                              }`}>
                                                {ws.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Right Sub-table: Relevant Users */}
                              <div className="bg-[#121625]/60 border border-brand-border/40 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
                                  <span className="text-xs font-bold text-brand-text-bright flex items-center gap-1.5 uppercase font-mono tracking-wider">
                                    <Users size={12} className="text-indigo-400" />
                                    Assigned & Shared Users ({relatedUsers.length})
                                  </span>
                                  <span className="text-[10px] text-brand-text/40">USER_MAPPINGS</span>
                                </div>

                                {relatedUsers.length === 0 ? (
                                  <p className="text-xs text-brand-text/50 text-center py-4">No users mapped to these workspaces.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                      <thead>
                                        <tr className="text-[9px] uppercase font-mono font-bold text-brand-text/40 border-b border-brand-border/30">
                                          <th className="pb-2">User Profile</th>
                                          <th className="pb-2">Workspace context</th>
                                          <th className="pb-2">Primary Role</th>
                                          <th className="pb-2">Access Type</th>
                                          <th className="pb-2 text-right">State</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-brand-border/20 text-[11px]">
                                        {relatedUsers.map(u => {
                                          const isDirect = orgWorkspaceNames.includes(u.currentWorkspace);
                                          const userShares = workspaceShares.filter(s => orgWorkspaceIds.includes(s.workspaceId) && s.userId === u.id);
                                          
                                          return (
                                            <tr key={u.id} className="hover:bg-[#1b2032]/40">
                                              <td className="py-2">
                                                <span className="font-semibold text-brand-text-bright block">{u.name}</span>
                                                <span className="text-[9px] text-brand-text/40 font-mono block">{u.email}</span>
                                              </td>
                                              <td className="py-2 text-cyan-400">
                                                {isDirect ? u.currentWorkspace : (
                                                  <span>
                                                    {workspaces.find(w => w.id === userShares[0]?.workspaceId)?.name || 'Multiple'}
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2 text-brand-text/80">
                                                {isDirect ? u.globalRole : (
                                                  <span className="flex items-center gap-1">
                                                    <Shield size={10} className="text-indigo-400" />
                                                    {userShares[0]?.role} (Shared)
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-2">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                  isDirect ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                                                }`}>
                                                  {isDirect ? 'Direct seat' : 'Cross-Tenant share'}
                                                </span>
                                              </td>
                                              <td className="py-2 text-right">
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                  u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                                }`}>
                                                  {u.status}
                                                </span>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Workspaces Mapping List (God-view Mapping) */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl bg-[#0c0f17]/40">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
            Workspace Domain Mapping (God-View Mapper)
          </h4>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 font-mono font-bold">
            TENANCY_ROUTER
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Workspace Node</th>
                <th className="px-6 py-4">Parent Organization</th>
                <th className="px-6 py-4">Virtual Host Prefix</th>
                <th className="px-6 py-4">Owner Profile</th>
                <th className="px-6 py-4">Assigned Service Level</th>
                <th className="px-6 py-4">State</th>
                <th className="px-6 py-4 text-center">Administrative Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {filteredWorkspaces.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-brand-text/50">
                    No matching workspace records found in this sandbox.
                  </td>
                </tr>
              ) : (
                filteredWorkspaces.map((ws) => {
                  const wsOrg = organizations.find(o => o.id === ws.orgId);
                  
                  return (
                    <tr key={ws.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-brand-text-bright">
                        {ws.name}
                        <div className="text-[10px] text-brand-text/50 font-normal font-mono mt-0.5">{ws.id}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-400">
                        {wsOrg ? wsOrg.name : 'Unmapped Node'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-cyan-400 font-mono select-all">
                          {ws.subdomain}.telecrm.io
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-brand-text/80">
                        {ws.owner}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ws.plan === 'Enterprise' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' :
                          ws.plan === 'Growth' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ws.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                          ws.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          ws.status === 'Trial' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            ws.status === 'Active' ? 'bg-emerald-400' :
                            ws.status === 'Trial' ? 'bg-cyan-400' :
                            'bg-rose-400'
                          }`} />
                          {ws.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-1">
                        {/* Edit Plan / Parent Org */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWorkspace(ws);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-brand-primary/40 transition-all duration-150"
                          title="Modify Workspace Mapper & Details"
                        >
                          <Edit size={12} />
                        </button>
                        
                        {/* Toggle Suspend */}
                        <button
                          type="button"
                          onClick={() => toggleStatus(ws.id, ws.status)}
                          className={`p-1.5 rounded border transition-all duration-150 ${
                            ws.status === 'Active'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          }`}
                          title={ws.status === 'Active' ? 'Suspend Workspace Access' : 'Reactivate Workspace Access'}
                        >
                          {ws.status === 'Active' ? <Ban size={12} /> : <CheckCircle size={12} />}
                        </button>

                        {/* Delete Workspace */}
                        <button
                          type="button"
                          onClick={() => onDeleteWorkspace(ws.id)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-150"
                          title="De-provision Workspace"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Workspace Sharing & Access Control Matrix */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl bg-[#0c0f17]/40">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="text-emerald-400" size={16} />
            <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
              Cross-Tenant Workspace Sharing & RBAC Access Matrix
            </h4>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-mono font-bold">
            CROSS_TENANT_SHARING
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Shared Workspace</th>
                <th className="px-6 py-4">Parent Organization</th>
                <th className="px-6 py-4">Shared User Profile</th>
                <th className="px-6 py-4">Clearance Role</th>
                <th className="px-6 py-4">Granted At</th>
                <th className="px-6 py-4 text-center">Revoke Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {filteredShares.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-brand-text/50 font-sans">
                    No shared workspace mapping assignments found for the current selection.
                  </td>
                </tr>
              ) : (
                filteredShares.map((share) => {
                  const ws = workspaces.find(w => w.id === share.workspaceId);
                  const wsOrg = ws ? organizations.find(o => o.id === ws.orgId) : null;
                  const user = users.find(u => u.id === share.userId);

                  return (
                    <tr key={share.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-brand-text-bright flex items-center gap-1.5">
                        <Globe size={11} className="text-cyan-400" />
                        {ws ? ws.name : 'Unknown Workspace'}
                      </td>
                      <td className="px-6 py-4 font-bold text-indigo-400">
                        {wsOrg ? wsOrg.name : 'Unmapped Node'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded-full bg-[#1b2030] flex items-center justify-center font-bold text-[9px] text-cyan-400">
                            {user ? user.name[0] : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-brand-text-bright block">{user ? user.name : 'Unknown User'}</span>
                            <span className="text-[9px] text-brand-text/40 font-mono block">{user ? user.email : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          share.role === 'Admin' ? 'bg-indigo-500/15 text-indigo-400' :
                          share.role === 'Editor' ? 'bg-cyan-500/15 text-cyan-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {share.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-brand-text/60 font-mono">
                        {share.grantedAt}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => onRevokeShare(share.id)}
                          className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-150"
                          title="Revoke Workspace Share Assignment"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Users Under Each Workspace — Live Directory */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl bg-[#0c0f17]/40">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="text-indigo-400" size={16} />
            <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
              Users Under Each Workspace
            </h4>
          </div>
          <div className="flex items-center gap-3">
            {wsUsersLoading && (
              <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 animate-pulse">
                <RefreshCw size={10} className="animate-spin" /> Loading live users...
              </span>
            )}
            {wsUsersError && (
              <span className="text-[10px] text-amber-400 font-mono">{wsUsersError}</span>
            )}
            <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 font-mono font-bold">
              USER_DIRECTORY
            </span>
          </div>
        </div>

        <div className="divide-y divide-brand-border/30">
          {workspaces
            .filter(ws => selectedOrgId === 'ALL' || ws.orgId === selectedOrgId)
            .filter(ws => selectedWorkspaceId === 'ALL' || ws.id === selectedWorkspaceId)
            .map(ws => {
              const wsOrg = organizations.find(o => o.id === ws.orgId);
              const wsUsers = allUsers.filter(u =>
                u.orgId === ws.orgId || u.currentWorkspace === ws.name
              );
              const isOpen = !!expandedWsUsers[ws.id];

              return (
                <div key={ws.id} className="bg-[#0d1017]/20">
                  <button
                    type="button"
                    onClick={() => toggleWsUsers(ws.id)}
                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-[#131722]/50 transition-colors duration-150 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                        <Globe size={12} className="text-cyan-400" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-brand-text-bright">{ws.name}</span>
                        <span className="ml-2 text-[10px] font-mono text-cyan-400">{ws.subdomain}.telecrm.io</span>
                        {wsOrg && (
                          <span className="ml-2 text-[10px] text-indigo-400 font-semibold">· {wsOrg.name}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ws.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ws.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {ws.status}
                      </span>
                      <span className="text-[10px] bg-[#1b2030] border border-brand-border/60 px-2 py-0.5 rounded font-mono text-brand-text/70">
                        {wsUsers.length} user{wsUsers.length !== 1 ? 's' : ''}
                      </span>
                      {isOpen ? <ChevronUp size={14} className="text-brand-text/50" /> : <ChevronDown size={14} className="text-brand-text/50" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 bg-[#0b0e16]/60 animate-slide-down">
                      {wsUsers.length === 0 ? (
                        <div className="flex items-center gap-2 py-4 text-xs text-brand-text/40 font-mono">
                          <Users size={14} />
                          <span>No users assigned to this workspace yet.</span>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-brand-border/40 mt-2">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[9px] uppercase font-mono font-bold text-brand-text/40 bg-[#0d111b]/60 border-b border-brand-border/30">
                                <th className="px-4 py-2.5">User</th>
                                <th className="px-4 py-2.5">Email</th>
                                <th className="px-4 py-2.5">Role</th>
                                <th className="px-4 py-2.5">Status</th>
                                <th className="px-4 py-2.5">Joined</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/20 text-[11px]">
                              {wsUsers.map(u => (
                                <tr key={u.id} className="hover:bg-[#131722]/50 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                        {(u.name || u.email || '?')[0].toUpperCase()}
                                      </div>
                                      <span className="font-semibold text-brand-text-bright">{u.name || u.email?.split('@')[0]}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-2.5 font-mono text-brand-text/60 text-[10px]">{u.email}</td>
                                  <td className="px-4 py-2.5">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      (u.globalRole || u.role) === 'root' || (u.globalRole || u.role) === 'Super Admin'
                                        ? 'bg-indigo-500/15 text-indigo-400'
                                        : (u.globalRole || u.role) === 'admin' || (u.globalRole || u.role) === 'Tenant Owner'
                                        ? 'bg-cyan-500/15 text-cyan-400'
                                        : 'bg-brand-border/40 text-brand-text/60'
                                    }`}>
                                      <Shield size={9} />
                                      {u.globalRole || u.role || 'caller'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                      u.status === 'Active' || !u.status ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      <span className={`w-1 h-1 rounded-full ${u.status === 'Active' || !u.status ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                      {u.status || 'Active'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-brand-text/50 font-mono text-[10px]">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          {workspaces.filter(ws => selectedOrgId === 'ALL' || ws.orgId === selectedOrgId).length === 0 && (
            <div className="px-6 py-12 text-center text-brand-text/40 text-xs font-mono">
              No workspaces found for the current filter selection.
            </div>
          )}
        </div>
      </div>

      {/* 5. Create Organization Modal */}
      <UiModal isOpen={isNewOrgModalOpen} onClose={() => setIsNewOrgModalOpen(false)} title="Register Client Organization">
        <form onSubmit={handleCreateOrgSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Organization Name *</label>
            <input
              type="text"
              required
              value={newOrg.name}
              onChange={(e) => setNewOrg({...newOrg, name: e.target.value})}
              placeholder="E.g. Nexus Enterprises"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Subscription Tier</label>
              <select
                value={newOrg.tier}
                onChange={(e) => setNewOrg({...newOrg, tier: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Max Workspaces</label>
              <input
                type="number"
                value={newOrg.workspacesQuota}
                onChange={(e) => setNewOrg({...newOrg, workspacesQuota: parseInt(e.target.value) || 1})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Max User Seats</label>
              <input
                type="number"
                value={newOrg.usersQuota}
                onChange={(e) => setNewOrg({...newOrg, usersQuota: parseInt(e.target.value) || 1})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>
          </div>

          <p className="text-xs text-brand-text/50">
            Provisioning registers a billing profile in Stripe and prepares workspace allocations instantly.
          </p>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => setIsNewOrgModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg transition-all cursor-pointer"
            >
              Initialize Organization
            </button>
          </div>
        </form>
      </UiModal>

      {/* EDIT ORGANIZATION MODAL */}
      {editingOrg && (
        <UiModal isOpen={isEditOrgModalOpen} onClose={() => { setIsEditOrgModalOpen(false); setEditingOrg(null); }} title="Modify Client Organization Profile">
          <form onSubmit={handleEditOrgSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Organization Name *</label>
              <input
                type="text"
                required
                value={editingOrg.name}
                onChange={(e) => setEditingOrg({...editingOrg, name: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Subscription Package Tier</label>
                <select
                  value={editingOrg.tier}
                  onChange={(e) => setEditingOrg({...editingOrg, tier: e.target.value})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Billing State & Status</label>
                <select
                  value={editingOrg.status}
                  onChange={(e) => setEditingOrg({...editingOrg, status: e.target.value})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-bold text-cyan-400"
                >
                  <option value="Active">Active (Unrestricted)</option>
                  <option value="Suspended">Suspended (Access Blocked)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Max Provisioned Workspaces</label>
                <input
                  type="number"
                  value={editingOrg.workspacesQuota}
                  onChange={(e) => setEditingOrg({...editingOrg, workspacesQuota: parseInt(e.target.value) || 1})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Max User Seats allocation</label>
                <input
                  type="number"
                  value={editingOrg.usersQuota}
                  onChange={(e) => setEditingOrg({...editingOrg, usersQuota: parseInt(e.target.value) || 1})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => { setIsEditOrgModalOpen(false); setEditingOrg(null); }}
                className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </form>
        </UiModal>
      )}

      {/* 4. Provision Workspace Modal */}
      <UiModal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Provision New Workspace Domain">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Parent Client Organization *</label>
            <select
              value={newWorkspace.orgId}
              onChange={(e) => setNewWorkspace({...newWorkspace, orgId: e.target.value})}
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {organizations.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Workspace Node Name *</label>
            <input
              type="text"
              required
              value={newWorkspace.name}
              onChange={(e) => setNewWorkspace({...newWorkspace, name: e.target.value})}
              placeholder="E.g. Nexus Support, Apex Freight Center"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Subdomain Prefix *</label>
            <div className="flex rounded-lg overflow-hidden border border-brand-border/80 focus-within:border-indigo-500 transition-colors">
              <input
                type="text"
                required
                value={newWorkspace.subdomain}
                onChange={(e) => setNewWorkspace({...newWorkspace, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                placeholder="nexus"
                className="flex-1 bg-[#090b11] px-3 py-2 text-sm text-brand-text-bright focus:outline-none border-none font-mono"
              />
              <span className="bg-[#1b2030] px-3 py-2 text-xs font-mono font-bold text-brand-text/70 border-l border-brand-border/60 flex items-center">
                .telecrm.io
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Owner Contact Full Name *</label>
            <input
              type="text"
              required
              value={newWorkspace.owner}
              onChange={(e) => setNewWorkspace({...newWorkspace, owner: e.target.value})}
              placeholder="E.g. Sarah Connor"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Service Level Plan</label>
              <select
                value={newWorkspace.plan}
                onChange={(e) => setNewWorkspace({...newWorkspace, plan: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Initial Status</label>
              <select
                value={newWorkspace.status}
                onChange={(e) => setNewWorkspace({...newWorkspace, status: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Trial">Trial</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer"
            >
              Initialize Node
            </button>
          </div>
        </form>
      </UiModal>

      {/* 5. Share Workspace Access Modal */}
      <UiModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} title="Grant Cross-Tenant Workspace Access">
        <form onSubmit={handleShareSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Select Target Workspace *</label>
            <select
              value={newShare.workspaceId}
              onChange={(e) => setNewShare({...newShare, workspaceId: e.target.value})}
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {workspaces.map(w => (
                <option key={w.id} value={w.id}>{w.name} ({w.subdomain}.telecrm.io)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Select Recipient User *</label>
            <select
              value={newShare.userId}
              onChange={(e) => setNewShare({...newShare, userId: e.target.value})}
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Access Role Level</label>
            <select
              value={newShare.role}
              onChange={(e) => setNewShare({...newShare, role: e.target.value})}
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
            >
              <option value="Viewer">Viewer (Read-Only access to dashboard)</option>
              <option value="Editor">Editor (Full permissions to edit leads & campaigns)</option>
              <option value="Admin">Admin (Full administrative & deletion clearance)</option>
            </select>
          </div>

          <p className="text-xs text-brand-text/50">
            Granting workspace access allows cross-tenant collaboration. The user can switch to this workspace directly in their active dashboard view.
          </p>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => setIsShareModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg transition-all cursor-pointer"
            >
              Grant Access Permission
            </button>
          </div>
        </form>
      </UiModal>

      {/* 6. Edit Workspace Modal (Contains Workspace Moving / Re-assignment) */}
      {editingWorkspace && (
        <UiModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingWorkspace(null); }} title="Modify Workspace Domain Mapping">
          <form onSubmit={handleEditSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Move Parent Organization (Re-assignment)</label>
              <select
                value={editingWorkspace.orgId}
                onChange={(e) => setEditingWorkspace({...editingWorkspace, orgId: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-xs text-cyan-400 font-bold focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {organizations.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <span className="text-[10px] text-brand-text/40 block mt-1">
                Moving this node updates resource tallies and maps credentials under the target organization instantly.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Company/Workspace Name</label>
              <input
                type="text"
                required
                value={editingWorkspace.name}
                onChange={(e) => setEditingWorkspace({...editingWorkspace, name: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Owner Contact Profile</label>
              <input
                type="text"
                required
                value={editingWorkspace.owner}
                onChange={(e) => setEditingWorkspace({...editingWorkspace, owner: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Subscription Plan Level</label>
                <select
                  value={editingWorkspace.plan}
                  onChange={(e) => setEditingWorkspace({...editingWorkspace, plan: e.target.value})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Workspace License State</label>
                <select
                  value={editingWorkspace.status}
                  onChange={(e) => setEditingWorkspace({...editingWorkspace, status: e.target.value})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingWorkspace(null); }}
                className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer"
              >
                Apply Mapping
              </button>
            </div>
          </form>
        </UiModal>
      )}
    </div>
  );
}
