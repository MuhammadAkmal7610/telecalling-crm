import React, { useState } from 'react';
import { 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  Filter, 
  UserCog, 
  ToggleLeft, 
  ToggleRight, 
  Ghost, 
  Plus, 
  Lock, 
  History, 
  Link as LinkIcon 
} from 'lucide-react';
import UiModal from './UiModal';

export default function UsersTab({ users, onUpdateUser, onCreateUser, onImpersonate, searchQuery }) {
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterWorkspace, setFilterWorkspace] = useState('ALL');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);

  // Invite user form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Agent');
  const [inviteWorkspace, setInviteWorkspace] = useState(users[0]?.currentWorkspace || 'Nexus Corp Solutions');

  // Role permissions matrix state - fully interactive!
  const [permissions, setPermissions] = useState({
    'Super Admin': { read: true, tenants: true, billing: true, gateways: true, templates: true, logs: true },
    'Audit Manager': { read: true, tenants: false, billing: false, gateways: false, templates: false, logs: true },
    'Tenant Owner': { read: true, tenants: false, billing: true, gateways: true, templates: true, logs: false },
    'Support Agent': { read: true, tenants: true, billing: false, gateways: false, templates: false, logs: false },
    'Agent': { read: true, tenants: false, billing: false, gateways: false, templates: false, logs: false },
  });

  // Simulated Login History Trails
  const loginHistories = {
    'usr-1': [
      { timestamp: 'May 10, 2026 - 23:12', ip: '192.168.1.14', browser: 'Chrome on Win11', status: 'Success' },
      { timestamp: 'May 09, 2026 - 11:05', ip: '192.168.1.14', browser: 'Chrome on Win11', status: 'Success' },
      { timestamp: 'May 05, 2026 - 08:30', ip: '192.168.1.14', browser: 'Chrome on Win11', status: 'Success' },
    ],
    'usr-2': [
      { timestamp: 'May 10, 2026 - 18:44', ip: '10.0.4.12', browser: 'Safari on macOS', status: 'Success' },
      { timestamp: 'May 08, 2026 - 09:12', ip: '10.0.4.12', browser: 'Safari on macOS', status: 'Success' },
    ],
    'usr-3': [
      { timestamp: 'May 10, 2026 - 14:15', ip: '10.0.4.120', browser: 'Firefox on Linux', status: 'Success' },
    ],
    'usr-4': [
      { timestamp: 'May 10, 2026 - 21:04', ip: '192.168.1.52', browser: 'Chrome on Win10', status: 'Success' },
      { timestamp: 'May 07, 2026 - 14:22', ip: '192.168.1.52', browser: 'Chrome on Win10', status: 'Success' },
    ],
    'usr-5': [
      { timestamp: 'May 09, 2026 - 08:12', ip: '172.16.20.14', browser: 'Chrome on Android', status: 'Blocked (Suspended)' },
    ]
  };

  const togglePermission = (role, permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: !prev[role][permissionKey]
      }
    }));
  };

  // Get unique workspaces from users
  const uniqueWorkspaces = Array.from(new Set(users.map(u => u.currentWorkspace)));

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'ALL' || u.globalRole === filterRole;
    const matchesWorkspace = filterWorkspace === 'ALL' || u.currentWorkspace === filterWorkspace;

    return matchesSearch && matchesRole && matchesWorkspace;
  });

  const handleRoleChange = (userId, newRole) => {
    onUpdateUser(userId, { globalRole: newRole });
  };

  const handleStatusToggle = (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    onUpdateUser(userId, { status: nextStatus });
  };

  const handlePasswordReset = (user) => {
    const mockResetLink = `https://telecrm.io/auth/reset-password?token=sec_tok_${Math.floor(100000 + Math.random() * 900000)}`;
    navigator.clipboard.writeText(mockResetLink);
    alert(`Secure password reset token generated for ${user.name}!\n\nLink copied to clipboard:\n${mockResetLink}`);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;
    
    onCreateUser({
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      globalRole: inviteRole,
      status: 'Active',
      currentWorkspace: inviteWorkspace,
      createdAt: new Date().toISOString().split('T')[0]
    });

    setInviteEmail('');
    setInviteName('');
    setIsInviteModalOpen(false);
    alert(`Invitation sent to ${inviteEmail}! User node will appear once registered.`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Super Admin':
        return <ShieldCheck size={14} className="text-indigo-400" />;
      case 'Audit Manager':
        return <ShieldAlert size={14} className="text-amber-400" />;
      case 'Tenant Owner':
        return <Shield size={14} className="text-cyan-400" />;
      default:
        return <Shield size={14} className="text-brand-text/50" />;
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Search and Filters panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel border-brand-border/60 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Role Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Shield size={12} className="text-indigo-400" />
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Audit Manager">Audit Manager</option>
              <option value="Tenant Owner">Tenant Owner</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Agent">Agent</option>
            </select>
          </div>

          {/* Workspace Filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Filter size={12} className="text-cyan-400" />
            <select 
              value={filterWorkspace} 
              onChange={(e) => setFilterWorkspace(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL">All Workspaces</option>
              {uniqueWorkspaces.map(ws => (
                <option key={ws} value={ws}>{ws}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Invite User Button */}
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
        >
          <Plus size={14} />
          <span>Invite Team Node</span>
        </button>
      </div>

      {/* Main Split Screen */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Global Users List */}
        <div className="xl:col-span-2 glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40">
            <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
              Global Accounts Directory
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                  <th className="px-6 py-4">User Contact</th>
                  <th className="px-6 py-4">Assigned Workspace</th>
                  <th className="px-6 py-4">Global Security Clearance</th>
                  <th className="px-6 py-4">State</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#1b2030] border border-brand-border/80 flex items-center justify-center font-bold text-indigo-400">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-brand-text-bright">{u.name}</div>
                          <div className="text-[10px] text-brand-text/50 font-mono mt-0.5">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-cyan-400 font-medium">
                      {u.currentWorkspace}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(u.globalRole)}
                        <select
                          value={u.globalRole}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-[#131722] border border-brand-border/60 rounded px-2 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500 font-sans cursor-pointer"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Audit Manager">Audit Manager</option>
                          <option value="Tenant Owner">Tenant Owner</option>
                          <option value="Support Agent">Support Agent</option>
                          <option value="Agent">Agent</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5 flex-nowrap whitespace-nowrap">
                      {/* Password Reset */}
                      <button
                        type="button"
                        onClick={() => handlePasswordReset(u)}
                        className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-brand-primary/40 transition-all duration-150"
                        title="Generate Reset Link"
                      >
                        <Lock size={12} />
                      </button>

                      {/* Login History */}
                      <button
                        type="button"
                        onClick={() => setSelectedUserHistory(u)}
                        className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-brand-primary/40 transition-all duration-150"
                        title="Audit Login Logs"
                      >
                        <History size={12} />
                      </button>

                      {/* Impersonate (Ghost mode) */}
                      <button
                        type="button"
                        onClick={() => onImpersonate(u)}
                        disabled={u.status !== 'Active'}
                        className={`p-1.5 rounded border transition-all duration-150 ${
                          u.status === 'Active'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-brand-border/30 border-brand-border/40 text-brand-text/30 cursor-not-allowed'
                        }`}
                        title={u.status === 'Active' ? `Impersonate (Ghost) as ${u.name}` : 'Cannot impersonate suspended nodes'}
                      >
                        <Ghost size={12} />
                      </button>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        className={`p-1.5 rounded border transition-all duration-150 ${
                          u.status === 'Active'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                        title={u.status === 'Active' ? 'Revoke permissions' : 'Restore permissions'}
                      >
                        {u.status === 'Active' ? <X size={12} /> : <Check size={12} />}
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Permissions Grid & Audit Side Panel */}
        <div className="space-y-6">
          {/* Global Permissions Grid */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center mb-1">
                <UserCog size={16} className="text-indigo-400 mr-2" /> Global Security clearance
              </h4>
              <p className="text-xs text-brand-text/50 border-b border-brand-border/40 pb-3 mb-4">
                Toggle default RBAC access permissions assigned globally.
              </p>

              <div className="space-y-4">
                {Object.keys(permissions).map((role) => (
                  <div key={role} className="p-3 bg-[#131722]/50 border border-brand-border/40 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-brand-border/30 pb-1.5">
                      <span className="text-xs font-bold text-brand-text-bright flex items-center gap-1.5">
                        {getRoleIcon(role)}
                        {role}
                      </span>
                      <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded font-mono font-bold">
                        RBAC_NODE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Read View</span>
                        <button type="button" onClick={() => togglePermission(role, 'read')} className="text-brand-text-bright">
                          {permissions[role].read ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Tenants</span>
                        <button type="button" onClick={() => togglePermission(role, 'tenants')} className="text-brand-text-bright">
                          {permissions[role].tenants ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Billing</span>
                        <button type="button" onClick={() => togglePermission(role, 'billing')} className="text-brand-text-bright">
                          {permissions[role].billing ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Gateways</span>
                        <button type="button" onClick={() => togglePermission(role, 'gateways')} className="text-brand-text-bright">
                          {permissions[role].gateways ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Templates</span>
                        <button type="button" onClick={() => togglePermission(role, 'templates')} className="text-brand-text-bright">
                          {permissions[role].templates ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1 rounded">
                        <span className="text-brand-text/80 truncate">Logs</span>
                        <button type="button" onClick={() => togglePermission(role, 'logs')} className="text-brand-text-bright">
                          {permissions[role].logs ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Account Modal */}
      <UiModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite User Node to Organization">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="E.g. Sarah Connor"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="sarah@nexuscorp.io"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">RBAC Security Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Audit Manager">Audit Manager</option>
                <option value="Tenant Owner">Tenant Owner</option>
                <option value="Support Agent">Support Agent</option>
                <option value="Agent">Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Target Workspace</label>
              <select
                value={inviteWorkspace}
                onChange={(e) => setInviteWorkspace(e.target.value)}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-sans"
              >
                {uniqueWorkspaces.map(ws => (
                  <option key={ws} value={ws}>{ws}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer"
            >
              Send Invite Link
            </button>
          </div>
        </form>
      </UiModal>

      {/* Login History Drawer Modal */}
      {selectedUserHistory && (
        <UiModal isOpen={!!selectedUserHistory} onClose={() => setSelectedUserHistory(null)} title={`Security Connection History: ${selectedUserHistory.name}`}>
          <div className="space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-2">
              <span className="text-xs text-brand-text/60">Registered Account:</span>
              <span className="text-xs font-bold font-mono text-cyan-400">{selectedUserHistory.email}</span>
            </div>

            <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
              {loginHistories[selectedUserHistory.id]?.map((lh, idx) => (
                <div key={idx} className="p-3 bg-[#131722]/55 border border-brand-border/40 rounded-lg space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand-text-bright font-semibold flex items-center">
                      <History size={11} className="mr-1.5 text-cyan-400" /> {lh.timestamp}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      lh.status === 'Success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {lh.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-text/50 font-mono">
                    <span>IP Address: {lh.ip}</span>
                    <span>Client: {lh.browser}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => setSelectedUserHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </UiModal>
      )}
    </div>
  );
}
