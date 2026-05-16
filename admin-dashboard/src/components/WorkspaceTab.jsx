import React, { useState } from 'react';
import { Search, Plus, Ban, CheckCircle, RefreshCw, Key, Filter, Edit, BarChart, ArrowRight, Trash2 } from 'lucide-react';
import UiModal from './UiModal';

export default function WorkspaceTab({ 
  workspaces, 
  organizations,
  onUpdateWorkspace, 
  onCreateWorkspace, 
  onDeleteWorkspace,
  onUpdateOrganization,
  onCreateOrganization,
  onDeleteOrganization,
  searchQuery 
}) {
  const [filterPlan, setFilterPlan] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  
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

  // Edit workspace state
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Filter workspaces based on search query, plan, and status
  const filteredWorkspaces = workspaces.filter(ws => {
    const parentOrg = organizations.find(o => o.id === ws.orgId);
    const orgName = parentOrg ? parentOrg.name : '';
    
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ws.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ws.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          orgName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || ws.plan === filterPlan;
    const matchesStatus = filterStatus === 'ALL' || ws.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
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
    <div className="space-y-6 animate-slide-up">
      
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel border-brand-border/60 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Plan Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Filter size={12} className="text-indigo-400" />
            <select 
              value={filterPlan} 
              onChange={(e) => setFilterPlan(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <CheckCircle size={12} className="text-emerald-400" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Trial">Trial</option>
            </select>
          </div>
        </div>

        {/* Create Operations Buttons */}
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsNewOrgModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Create Organization</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Provision Workspace</span>
          </button>
        </div>
      </div>

      {/* 1. Organizations Directory (Multi-Tenant Governance) */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
            Client Organizations & Resource Quota Controls
          </h4>
          <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
            GOVERNANCE_ENGINE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Organization Name</th>
                <th className="px-6 py-4">Subscription Package</th>
                <th className="px-6 py-4">Workspace Resource Quotas</th>
                <th className="px-6 py-4">User Seats Quotas</th>
                <th className="px-6 py-4">Stripe Billing Link</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-sans">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
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
                      <span className={`w-1 h-1 rounded-full ${org.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1.5">
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Workspaces Mapping List (God-view Mapping) */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
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
                <th className="px-6 py-4 text-right">Administrative Settings</th>
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
                      <td className="px-6 py-4 text-right space-x-1">
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

      {/* 3. Create Organization Modal */}
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

      {/* 5. Edit Workspace Modal (Contains Workspace Moving / Re-assignment) */}
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
