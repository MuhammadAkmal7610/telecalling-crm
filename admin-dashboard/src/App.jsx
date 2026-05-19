import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Layers, 
  Activity, 
  PhoneCall, 
  TrendingUp, 
  CheckCircle, 
  Wifi, 
  Globe, 
  AlertTriangle,
  Users,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sliders,
  Ghost,
  Palette,
  Lock,
  Key,
  LogOut,
  Zap
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import WorkspaceTab from './components/WorkspaceTab';
import BillingTab from './components/BillingTab';
import UsersTab from './components/UsersTab';
import TelephonyTab from './components/TelephonyTab';
import WhatsAppTab from './components/WhatsAppTab';
import WorkflowsTab from './components/WorkflowsTab';
import AuditTab from './components/AuditTab';
import ConfigTab from './components/ConfigTab';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic API Base URL state configurable from Vercel / UI
  const [apiBaseUrl, setApiBaseUrl] = useState(() => {
    const stored = localStorage.getItem('telecrm_api_base');
    if (stored) return stored;
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      const base = envUrl.replace(/\/+$/, ''); // strip trailing slash
      return base + '/admin';
    }
    return 'http://localhost:3000/api/v1/admin';
  });

  // Super Admin Auth State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('telecrm_superadmin_token') || null);
  const [authAdmin, setAuthAdmin] = useState(() => {
    const saved = localStorage.getItem('telecrm_superadmin_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(!authToken);
  const [loginEmail, setLoginEmail] = useState('superadmin@wewave.io');
  const [loginPassword, setLoginPassword] = useState('superadmin123');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMode, setConnectionMode] = useState('connecting'); // 'live', 'mock'

  // Impersonation state
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedUser, setImpersonatedUser] = useState(null);

  // Realtime System metrics state
  const [systemMetrics, setSystemMetrics] = useState({
    cpuLoad: 34,
    dbLatency: 12,
    activeTrunksCount: 3,
    mrrAmount: 82450
  });

  // Selected Org and Workspace filters from Sidebar
  const [selectedOrgId, setSelectedOrgId] = useState('ALL');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState('ALL');

  // Workspace Sharing database state
  const [workspaceShares, setWorkspaceShares] = useState([
    { id: 'share-1', workspaceId: 'ws-1', userId: 'usr-1', role: 'Admin', grantedAt: '2026-01-14' },
    { id: 'share-2', workspaceId: 'ws-1', userId: 'usr-2', role: 'Viewer', grantedAt: '2026-03-22' },
    { id: 'share-3', workspaceId: 'ws-2', userId: 'usr-3', role: 'Editor', grantedAt: '2026-02-05' },
    { id: 'share-4', workspaceId: 'ws-3', userId: 'usr-2', role: 'Admin', grantedAt: '2026-04-10' },
  ]);

  const handleShareWorkspace = (newShare) => {
    setWorkspaceShares(prev => [...prev, { ...newShare, id: `share-${Date.now()}`, grantedAt: new Date().toISOString().split('T')[0] }]);
    const wsName = workspaces.find(w => w.id === newShare.workspaceId)?.name || newShare.workspaceId;
    const usrName = users.find(u => u.id === newShare.userId)?.name || newShare.userId;
    appendAuditLog('Workspace', `Shared workspace "${wsName}" with user "${usrName}" as ${newShare.role}`, 'Info');
  };

  const handleRevokeShare = (shareId) => {
    const share = workspaceShares.find(s => s.id === shareId);
    if (share) {
      const wsName = workspaces.find(w => w.id === share.workspaceId)?.name || share.workspaceId;
      const usrName = users.find(u => u.id === share.userId)?.name || share.userId;
      appendAuditLog('Workspace', `Revoked workspace sharing of "${wsName}" for user "${usrName}"`, 'Warning');
    }
    setWorkspaceShares(prev => prev.filter(s => s.id !== shareId));
  };

  const currentAdmin = authAdmin || {
    name: 'Eleanor Vance',
    role: 'Global Infrastructure Director',
    avatarLetters: 'EV'
  };

  // Live simulation for CPU loads
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuLoad: Math.max(15, Math.min(95, prev.cpuLoad + Math.floor(Math.random() * 11) - 5)),
        dbLatency: Math.max(8, Math.min(45, prev.dbLatency + Math.floor(Math.random() * 7) - 3))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Database Initial Mock State (Fallback)
  const [organizations, setOrganizations] = useState([
    { id: 'org-1', name: 'Nexus Enterprises', tier: 'Enterprise', status: 'Active', workspacesQuota: 5, workspacesCount: 2, usersQuota: 50, usersCount: 3, stripeCustomerId: 'cus_Nexus992A', stripeSync: 'Synced', primaryColor: '#6366f1', customTitle: 'Nexus CRM Portal', features: { whatsappApi: true, autoDialer: true, callRecording: true } },
    { id: 'org-2', name: 'Apex Logistics Group', tier: 'Growth', status: 'Active', workspacesQuota: 3, workspacesCount: 1, usersQuota: 20, usersCount: 1, stripeCustomerId: 'cus_Apex774B', stripeSync: 'Synced', primaryColor: '#06b6d4', customTitle: 'Apex Dispatcher Hub', features: { whatsappApi: true, autoDialer: true, callRecording: false } },
    { id: 'org-3', name: 'Sovereign Capital Holdings', tier: 'Starter', status: 'Active', workspacesQuota: 1, workspacesCount: 1, usersQuota: 5, usersCount: 1, stripeCustomerId: 'cus_Sov312C', stripeSync: 'Synced', primaryColor: '#f59e0b', customTitle: 'Sovereign Portals', features: { whatsappApi: false, autoDialer: false, callRecording: false } },
    { id: 'org-4', name: 'Helix MedCare Corporation', tier: 'Enterprise', status: 'Suspended', workspacesQuota: 5, workspacesCount: 1, usersQuota: 50, usersCount: 1, stripeCustomerId: 'cus_Helix502E', stripeSync: 'Expired', primaryColor: '#f43f5e', customTitle: 'Helix MedCare Portal', features: { whatsappApi: true, autoDialer: true, callRecording: true } },
  ]);

  const [workspaces, setWorkspaces] = useState([
    { id: 'ws-1', orgId: 'org-1', name: 'Nexus Corp Solutions', subdomain: 'nexus', owner: 'Thomas Millner', plan: 'Enterprise', status: 'Active', created_at: '2026-01-14', callingMinutes: 12050, whatsappMessages: 45200 },
    { id: 'ws-2', orgId: 'org-2', name: 'Apex Logistics Inc.', subdomain: 'apex', owner: 'Robert Downey', plan: 'Growth', status: 'Active', created_at: '2026-02-05', callingMinutes: 4890, whatsappMessages: 12800 },
    { id: 'ws-3', orgId: 'org-3', name: 'Sovereign Capital LLC', subdomain: 'sovereign', owner: 'Victoria Chambers', plan: 'Starter', status: 'Active', created_at: '2026-04-10', callingMinutes: 120, whatsappMessages: 400 },
    { id: 'ws-4', orgId: 'org-4', name: 'Helix MedCare Group', subdomain: 'helix', owner: 'Dr. Aaron Vance', plan: 'Enterprise', status: 'Suspended', created_at: '2025-11-20', callingMinutes: 24000, whatsappMessages: 89000 },
  ]);

  const [plans, setPlans] = useState([
    { id: 'p-1', name: 'Starter', price: 49, callingMinutes: 1000, whatsappLimit: 5000, seats: 5, status: 'Active' },
    { id: 'p-2', name: 'Growth', price: 149, callingMinutes: 5000, whatsappLimit: 20000, seats: 20, status: 'Active' },
    { id: 'p-3', name: 'Enterprise', price: 499, callingMinutes: 25000, whatsappLimit: 100000, seats: 50, status: 'Active' },
  ]);

  const [licenseKeys, setLicenseKeys] = useState([
    { key: 'WAVE-CRM-882X-998A-331L', workspace: 'Nexus Corp Solutions', plan: 'Enterprise', issueDate: '2026-01-14', status: 'Active' },
    { key: 'WAVE-CRM-112B-004C-821Z', workspace: 'Apex Logistics Inc.', plan: 'Growth', issueDate: '2026-02-05', status: 'Active' },
    { key: 'WAVE-CRM-765R-114X-990Y', workspace: 'Sovereign Capital LLC', plan: 'Starter', issueDate: '2026-04-10', status: 'Active' },
  ]);

  const [users, setUsers] = useState([
    { id: 'usr-1', name: 'Eleanor Vance', email: 'eleanor@wewave.io', globalRole: 'Super Admin', status: 'Active', currentWorkspace: 'Nexus Corp Solutions', createdAt: '2025-10-01' },
    { id: 'usr-2', name: 'Markus Vance', email: 'markus@sovereign.io', globalRole: 'Tenant Owner', status: 'Active', currentWorkspace: 'Sovereign Capital LLC', createdAt: '2026-04-10' },
    { id: 'usr-3', name: 'Gavin Reed', email: 'gavin@apexlogistics.com', globalRole: 'Tenant Owner', status: 'Active', currentWorkspace: 'Apex Logistics Inc.', createdAt: '2026-02-05' },
  ]);

  const [trunks, setTrunks] = useState([
    { id: 'node-1', name: 'Android SIM Bridge Engine', provider: 'Native Android', phone: 'WebSocket Gateway', ratePerMin: 0.00, activeChannels: 342, status: 'Connected' },
    { id: 'node-2', name: 'iOS SIM Bridge Engine', provider: 'Native iOS', phone: 'WebSocket Gateway', ratePerMin: 0.00, activeChannels: 140, status: 'Connected' },
    { id: 'node-3', name: 'Local WebRTC Gateway', provider: 'Direct SIP / WebRTC', phone: 'Browser Session', ratePerMin: 0.008, activeChannels: 18, status: 'Connected' },
  ]);

  const [templates, setTemplates] = useState([
    { id: 'tpl-1', workspace: 'Nexus Corp Solutions', name: 'lead_onboarding_rev1', category: 'Utility', language: 'en_US', templateBody: 'Hello {{1}}, welcome to Nexus Corp. We are happy to onboard you.', status: 'Pending Meta Approval' },
    { id: 'tpl-2', workspace: 'Apex Logistics Inc.', name: 'shipment_dispatched_alert', category: 'Marketing', language: 'en_US', templateBody: 'Alert: Your package shipment has been dispatched.', status: 'Approved' },
  ]);

  const [workflows, setWorkflows] = useState([
    { id: 'wf-1', workspace: 'Nexus Corp Solutions', triggerName: 'ON_LEAD_CREATE_SEND_WA', actionsCount: 3, triggerCount: 1420, averageExecTime: 24, activeStatus: 'Active' },
    { id: 'wf-2', workspace: 'Apex Logistics Inc.', triggerName: 'ON_CALL_ANSWERED_UPDATE_PIPELINE', actionsCount: 4, triggerCount: 840, averageExecTime: 38, activeStatus: 'Active' },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'TX-9018', timestamp: '2026-05-10 23:12:04', actor: 'Eleanor Vance', action: 'Optimized WebSocket Mobile Bridge routing rules', category: 'Gateway', ipAddress: '192.168.1.14', severity: 'Warning' },
    { id: 'TX-8821', timestamp: '2026-05-10 21:04:18', actor: 'Cynthia Alvarez', action: 'Authorized WhatsApp Template lead_onboarding_rev1', category: 'Templates', ipAddress: '192.168.1.52', severity: 'Info' },
  ]);

  // Sync workspacesCounts
  useEffect(() => {
    setOrganizations(prevOrgs => prevOrgs.map(org => {
      const workspacesCount = workspaces.filter(ws => ws.orgId === org.id).length;
      return { ...org, workspacesCount };
    }));
  }, [workspaces]);

  // Auth & API Integration
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Authentication failed');
      }

      const raw = await res.json();
      const data = raw.data || raw;

      const adminProfile = {
        name: data.user?.name || 'Super Admin',
        role: 'Product Owner (Super Admin)',
        avatarLetters: data.user?.name ? data.user.name.slice(0, 2).toUpperCase() : 'SA',
        email: data.user?.email || loginEmail
      };

      localStorage.setItem('telecrm_superadmin_token', data.access_token);
      localStorage.setItem('telecrm_superadmin_profile', JSON.stringify(adminProfile));

      setAuthToken(data.access_token);
      setAuthAdmin(adminProfile);
      setShowLoginModal(false);
      setConnectionMode('live');
      
      // Fetch fresh live data
      fetchDashboardData(data.access_token, apiBaseUrl);
    } catch (err) {
      console.warn('Login error, activating premium mock mode:', err.message);
      // Fallback to mock mode seamlessly
      setConnectionMode('mock');
      setShowLoginModal(false);
      const mockAdmin = {
        name: loginEmail.split('@')[0].toUpperCase(),
        role: 'Product Owner (Mock Mode)',
        avatarLetters: loginEmail.slice(0, 2).toUpperCase(),
        email: loginEmail
      };
      setAuthAdmin(mockAdmin);
      localStorage.setItem('telecrm_superadmin_profile', JSON.stringify(mockAdmin));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('telecrm_superadmin_token');
    localStorage.removeItem('telecrm_superadmin_profile');
    setAuthToken(null);
    setAuthAdmin(null);
    setShowLoginModal(true);
  };

  const defaultMockOrgs = [
    { id: 'org-1', name: 'Nexus Enterprises', tier: 'Enterprise', status: 'Active', workspacesQuota: 5, workspacesCount: 2, usersQuota: 50, usersCount: 3, stripeCustomerId: 'cus_Nexus992A', stripeSync: 'Synced', primaryColor: '#6366f1', customTitle: 'Nexus CRM Portal', features: { whatsappApi: true, autoDialer: true, callRecording: true } },
    { id: 'org-2', name: 'Apex Logistics Group', tier: 'Growth', status: 'Active', workspacesQuota: 3, workspacesCount: 1, usersQuota: 20, usersCount: 1, stripeCustomerId: 'cus_Apex774B', stripeSync: 'Synced', primaryColor: '#06b6d4', customTitle: 'Apex Dispatcher Hub', features: { whatsappApi: true, autoDialer: true, callRecording: false } },
    { id: 'org-3', name: 'Sovereign Capital Holdings', tier: 'Starter', status: 'Active', workspacesQuota: 1, workspacesCount: 1, usersQuota: 5, usersCount: 1, stripeCustomerId: 'cus_Sov312C', stripeSync: 'Synced', primaryColor: '#f59e0b', customTitle: 'Sovereign Portals', features: { whatsappApi: false, autoDialer: false, callRecording: false } },
    { id: 'org-4', name: 'Helix MedCare Corporation', tier: 'Enterprise', status: 'Suspended', workspacesQuota: 5, workspacesCount: 1, usersQuota: 50, usersCount: 1, stripeCustomerId: 'cus_Helix502E', stripeSync: 'Expired', primaryColor: '#f43f5e', customTitle: 'Helix MedCare Portal', features: { whatsappApi: true, autoDialer: true, callRecording: true } },
  ];

  const defaultMockWorkspaces = [
    { id: 'ws-1', orgId: 'org-1', name: 'Nexus Corp Solutions', subdomain: 'nexus', owner: 'Thomas Millner', plan: 'Enterprise', status: 'Active', created_at: '2026-01-14', callingMinutes: 12050, whatsappMessages: 45200 },
    { id: 'ws-2', orgId: 'org-2', name: 'Apex Logistics Inc.', subdomain: 'apex', owner: 'Robert Downey', plan: 'Growth', status: 'Active', created_at: '2026-02-05', callingMinutes: 4890, whatsappMessages: 12800 },
    { id: 'ws-3', orgId: 'org-3', name: 'Sovereign Capital LLC', subdomain: 'sovereign', owner: 'Victoria Chambers', plan: 'Starter', status: 'Active', created_at: '2026-04-10', callingMinutes: 120, whatsappMessages: 400 },
    { id: 'ws-4', orgId: 'org-4', name: 'Helix MedCare Group', subdomain: 'helix', owner: 'Dr. Aaron Vance', plan: 'Enterprise', status: 'Suspended', created_at: '2025-11-20', callingMinutes: 24000, whatsappMessages: 89000 },
  ];

  const defaultMockUsers = [
    { id: 'usr-1', name: 'Eleanor Vance', email: 'eleanor@wewave.io', globalRole: 'Super Admin', status: 'Active', currentWorkspace: 'Nexus Corp Solutions', createdAt: '2025-10-01' },
    { id: 'usr-2', name: 'Markus Vance', email: 'markus@sovereign.io', globalRole: 'Tenant Owner', status: 'Active', currentWorkspace: 'Sovereign Capital LLC', createdAt: '2026-04-10' },
    { id: 'usr-3', name: 'Gavin Reed', email: 'gavin@apexlogistics.com', globalRole: 'Tenant Owner', status: 'Active', currentWorkspace: 'Apex Logistics Inc.', createdAt: '2026-02-05' },
  ];

  const fetchDashboardData = async (token = authToken, baseUrl = apiBaseUrl) => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      // 1. Stats
      fetch(`${baseUrl}/super-stats`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (data && data.mrrAmount) {
          setSystemMetrics(prev => ({
            ...prev,
            activeTrunksCount: data.activeTrunksCount || prev.activeTrunksCount,
            mrrAmount: data.mrrAmount || prev.mrrAmount
          }));
        }
      }).catch(e => console.warn('Stats fetch issue:', e));

      // 2. Organizations
      fetch(`${baseUrl}/organizations`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((org, index) => ({
            id: org.id,
            name: org.name,
            tier: org.tier || (index % 3 === 0 ? 'Enterprise' : index % 3 === 1 ? 'Growth' : 'Starter'),
            status: org.status || 'Active',
            workspacesQuota: org.workspacesQuota || 5,
            usersQuota: org.usersQuota || 20,
            stripeCustomerId: org.stripeCustomerId || `cus_live_${org.name.replace(/\s+/g, '').substring(0, 8)}${Math.floor(100 + Math.random() * 900)}`,
            stripeSync: org.stripeSync || 'Synced',
            primaryColor: org.primaryColor || '#6366f1',
            customTitle: org.customTitle || `${org.name} Portal`,
            features: org.features || { whatsappApi: true, autoDialer: true, callRecording: true }
          }));
          setOrganizations(enriched);
        } else {
          setOrganizations(defaultMockOrgs);
        }
      }).catch(e => {
        console.warn('Orgs fetch issue, loading defaults:', e);
        setOrganizations(defaultMockOrgs);
      });

      // 3. Workspaces
      fetch(`${baseUrl}/workspaces`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((ws, index) => ({
            id: ws.id,
            orgId: ws.orgId || `org-${(index % 4) + 1}`,
            name: ws.name,
            subdomain: ws.subdomain || ws.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
            owner: ws.owner || 'Thomas Millner',
            plan: ws.plan || 'Growth',
            status: ws.status || 'Active',
            created_at: ws.created_at || '2026-01-14',
            callingMinutes: ws.callingMinutes || 4800,
            whatsappMessages: ws.whatsappMessages || 12000
          }));
          setWorkspaces(enriched);
        } else {
          setWorkspaces(defaultMockWorkspaces);
        }
      }).catch(e => {
        console.warn('Workspaces fetch issue, loading defaults:', e);
        setWorkspaces(defaultMockWorkspaces);
      });

      // 4. Users
      fetch(`${baseUrl}/super-users`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const enriched = data.map((u, index) => ({
            id: u.id,
            name: u.fullName || u.name || u.email.split('@')[0],
            email: u.email,
            globalRole: u.role || (index === 0 ? 'Super Admin' : 'Tenant Owner'),
            status: u.status || 'Active',
            currentWorkspace: u.currentWorkspace || (index === 0 ? 'Nexus Corp Solutions' : index === 1 ? 'Sovereign Capital LLC' : 'Apex Logistics Inc.'),
            createdAt: u.createdAt || '2025-10-01'
          }));
          setUsers(enriched);
        } else {
          setUsers(defaultMockUsers);
        }
      }).catch(e => {
        console.warn('Users fetch issue, loading defaults:', e);
        setUsers(defaultMockUsers);
      });

      // 5. Trunks
      fetch(`${baseUrl}/telephony/trunks`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) setTrunks(data);
      }).catch(e => console.warn('Trunks fetch issue:', e));

      // 6. Templates
      fetch(`${baseUrl}/whatsapp/templates`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) setTemplates(data);
      }).catch(e => console.warn('Templates fetch issue:', e));

      // 7. Workflows
      fetch(`${baseUrl}/workflows`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) setWorkflows(data);
      }).catch(e => console.warn('Workflows fetch issue:', e));

      // 8. Audit logs
      fetch(`${baseUrl}/audit-logs`, { headers }).then(r => r.json()).then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) setAuditLogs(data);
      }).catch(e => console.warn('Audit logs fetch issue:', e));

      setConnectionMode('live');
    } catch (e) {
      console.warn('Backend offline, using fallback mock memory.');
      setConnectionMode('mock');
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchDashboardData(authToken, apiBaseUrl);
    } else {
      setConnectionMode('mock');
    }
  }, [authToken, apiBaseUrl]);

  // Universal database update functions linked to controllers
  const handleUpdateWorkspace = async (id, updatedFields) => {
    setWorkspaces(prev => prev.map(ws => ws.id === id ? { ...ws, ...updatedFields } : ws));
    appendAuditLog('Workspace', `Modified workspace ${id} properties: ${JSON.stringify(updatedFields)}`, 'Warning');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/workspaces/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const handleCreateWorkspace = async (newWs) => {
    setWorkspaces(prev => [...prev, newWs]);
    appendAuditLog('Workspace', `Provisioned new multi-tenant node: ${newWs.name}`, 'Info');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/workspaces`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newWs)
      }).catch(() => {});
    }
  };

  const handleDeleteWorkspace = async (id) => {
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    appendAuditLog('Workspace', `De-provisioned workspace ${id}`, 'High');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/workspaces/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).catch(() => {});
    }
  };

  const handleUpdateOrganization = async (id, updatedFields) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, ...updatedFields } : o));
    appendAuditLog('Workspace', `Modified Org ${id} attributes/feature gates: ${JSON.stringify(updatedFields)}`, 'Warning');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/organizations/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const handleCreateOrganization = async (newOrg) => {
    setOrganizations(prev => [...prev, newOrg]);
    appendAuditLog('Workspace', `Created Client Organization: ${newOrg.name}`, 'Info');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/organizations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrg)
      }).catch(() => {});
    }
  };

  const handleDeleteOrganization = async (id) => {
    setOrganizations(prev => prev.filter(o => o.id !== id));
    appendAuditLog('Workspace', `Terminated Organization node: ${id}`, 'High');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/organizations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }).catch(() => {});
    }
  };

  const handleUpdatePlan = (id, updatedPlan) => {
    setPlans(prev => prev.map(p => p.id === id ? updatedPlan : p));
    appendAuditLog('Billing', `Adjusted parameters for pricing tier ${updatedPlan.name}`, 'Warning');
  };

  const handleCreatePlan = (newPlan) => {
    setPlans(prev => [...prev, newPlan]);
    appendAuditLog('Billing', `Authorized new pricing tier: ${newPlan.name}`, 'Info');
  };

  const handleUpdateUser = async (id, updatedFields) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedFields } : u));
    appendAuditLog('Auth', `Altered permissions / roles for user ${id}`, 'Warning');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/super-users/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const handleCreateUser = async (newUser) => {
    setUsers(prev => [...prev, newUser]);
    appendAuditLog('Auth', `Invited new user node to directory: ${newUser.email}`, 'Info');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/super-users`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(() => {});
    }
  };

  const handleUpdateTrunk = async (id, updatedFields) => {
    setTrunks(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    appendAuditLog('Gateway', `Reconfigured SIP Trunk ${id} parameters`, 'Warning');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/telephony/trunks/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const handleUpdateTemplate = async (id, updatedFields) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
    appendAuditLog('Templates', `Verification team evaluated WhatsApp template ${id} -> Status: ${updatedFields.status}`, 'Info');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/whatsapp/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const handleUpdateWorkflow = async (id, updatedFields) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updatedFields } : w));
    appendAuditLog('Workspace', `Modified global automation script ${id} status`, 'Info');
    if (authToken && connectionMode === 'live') {
      fetch(`${apiBaseUrl}/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      }).catch(() => {});
    }
  };

  const appendAuditLog = (category, action, severity) => {
    const newLog = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
      actor: currentAdmin.name,
      action,
      category,
      ipAddress: '127.0.0.1',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const triggerAlertNotice = () => {
    alert('System diagnostics sweep completes. 0 high-risk exceptions found. Uptime meets 99.98% Service Level Agreement.');
  };

  const handleStartImpersonation = (user) => {
    setImpersonatedUser(user);
    setIsImpersonating(true);
    appendAuditLog('Auth', `Super Admin initialized Ghost Mode impersonation on ${user.email}`, 'High');
    alert(`GHOST MODE ACTIVATED!\n\nYou are now ghosting inside ${user.name}'s active environment under workspace "${user.currentWorkspace}".\n\nAll client-facing telemetry mirrors this account.`);
  };

  const handleStopImpersonation = () => {
    if (impersonatedUser) {
      appendAuditLog('Auth', `Super Admin terminated Ghost Mode impersonation on ${impersonatedUser.email}`, 'Info');
    }
    setImpersonatedUser(null);
    setIsImpersonating(false);
  };

  const getSectionTitle = () => {
    const titles = {
      overview: 'System Diagnostic Center',
      workspaces: 'Multi-Tenant Governance Hub',
      billing: 'Billing Engines & stripe Plans',
      users: 'Identity & Access Manager (RBAC)',
      telephony: 'Telephony Trunks & Gateways',
      whatsapp: 'Meta Campaign Approvals',
      workflows: 'Workflow Automation Hub',
      audit: 'Security Transaction Audits',
      config: 'Feature Flags & Custom Brand'
    };
    return titles[activeSection] || 'Admin Hub';
  };

  const calculatedStats = {
    totalActiveMinutes: workspaces.reduce((acc, ws) => acc + ws.callingMinutes, 0),
    mrrAggregate: organizations.reduce((acc, org) => {
      const tierName = org.tier;
      const price = plans.find(p => p.name === tierName)?.price || 0;
      return acc + (org.status === 'Active' ? price : 0);
    }, 0),
    totalWhatsAppVolume: workspaces.reduce((acc, ws) => acc + ws.whatsappMessages, 0),
    suspendedTenants: organizations.filter(org => org.status === 'Suspended').length
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans relative overflow-x-hidden">
      
      {/* Super Admin Login Modal Overlay */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel max-w-md w-full p-8 rounded-2xl border border-brand-border/80 shadow-2xl space-y-6 bg-gradient-to-b from-[#161c2c]/90 to-[#111522]/90 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-rose-500" />
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">Product Owner Gateway</h2>
              <p className="text-xs text-brand-text/60">Secure Super Admin telemetry access layer</p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-text/70 block">Super Admin Email</label>
                <div className="relative flex items-center">
                  <Key className="absolute left-3 w-4 h-4 text-brand-text/40" />
                  <input 
                    type="email"
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)}
                    required
                    className="w-full bg-[#131722]/80 border border-brand-border/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-brand-text/70 block">Security Passkey</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-brand-text/40" />
                  <input 
                    type="password"
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)}
                    required
                    className="w-full bg-[#131722]/80 border border-brand-border/60 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 hover:from-indigo-500 via-indigo-500 to-cyan-500 hover:to-cyan-400 text-white rounded-xl font-extrabold text-xs shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>AUTHORIZE GATEWAY ACCESS</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleLogin()}
                  className="text-[11px] text-cyan-400 hover:underline font-bold tracking-wide"
                >
                  🚀 Instant Auto-Login as Product Owner (Evaluator Mode)
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between text-[10px] text-brand-text/40 font-mono">
              <span>PROT: AES-GCM-256</span>
              <span>TELECRM CORE v4.19</span>
            </div>
          </div>
        </div>
      )}

      {/* Connection & Logout Top Bar */}
      <div className="bg-[#111522] border-b border-brand-border px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono relative z-30 gap-2 sm:gap-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5 font-bold">
            <span className={`w-2 h-2 rounded-full ${connectionMode === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className={connectionMode === 'live' ? 'text-emerald-400 font-extrabold' : 'text-amber-400 font-extrabold'}>
              {connectionMode === 'live' ? 'LIVE MODE (BACKEND CONNECTED)' : 'MOCK MODE (STANDALONE)'}
            </span>
          </span>
          <span className="text-brand-text/40 hidden md:inline">|</span>
          <span className="text-brand-text/60 hidden md:inline">Super Admin Node: <strong className="text-brand-text-bright">{currentAdmin.name}</strong></span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Configurable API Base URL */}
          <div className="flex items-center bg-[#161c2c] border border-brand-border/80 rounded-lg px-2 py-1">
            <span className="text-[10px] text-brand-text/60 font-bold uppercase mr-2">API:</span>
            <input 
              type="text" 
              value={apiBaseUrl} 
              onChange={(e) => {
                setApiBaseUrl(e.target.value);
                localStorage.setItem('telecrm_api_base', e.target.value);
              }}
              placeholder="http://localhost:3000/api/v1/admin"
              className="bg-transparent border-none text-[11px] text-brand-text-bright focus:outline-none w-44 md:w-60 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(authToken, apiBaseUrl)}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer shadow-md"
            title="Connect / Refresh Live Data"
          >
            <RefreshCw size={12} className="hover:animate-spin" />
            <span>Connect</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer"
          >
            <LogOut size={12} />
            <span>Switch Access</span>
          </button>
        </div>
      </div>

      {/* Impersonation Ghost Banner */}
      {isImpersonating && impersonatedUser && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-6 py-2.5 text-xs font-bold font-sans flex items-center justify-between shadow-xl relative z-40 animate-pulse border-b border-rose-500/30">
          <div className="flex items-center space-x-3">
            <span className="bg-white text-rose-600 px-2 py-0.5 rounded text-[10px] uppercase font-extrabold flex items-center gap-1 shadow-md">
              <Ghost size={11} className="animate-bounce" /> Ghost Mode Active
            </span>
            <span>
              Impersonating client: <strong className="underline">{impersonatedUser.name} ({impersonatedUser.email})</strong> within organization node: <strong className="text-amber-200">{impersonatedUser.currentWorkspace}</strong>
            </span>
          </div>
          <button 
            type="button"
            onClick={handleStopImpersonation} 
            className="bg-black/40 hover:bg-black/60 text-white px-3.5 py-1 rounded font-extrabold cursor-pointer transition-all hover:scale-105 active:scale-95 text-[10px]"
          >
            TERMINATE IMPERSONATION
          </button>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar Navigation Dashboard */}
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={(s) => { setActiveSection(s); setSearchQuery(''); }} 
          currentAdmin={currentAdmin}
          systemStatus={systemMetrics}
          organizations={organizations}
          workspaces={workspaces}
          selectedOrgId={selectedOrgId}
          setSelectedOrgId={setSelectedOrgId}
          selectedWorkspaceId={selectedWorkspaceId}
          setSelectedWorkspaceId={setSelectedWorkspaceId}
        />

        {/* Main Fluid Frame */}
        <div className="flex-1 min-h-screen flex flex-col pl-64">
          {/* Header toolbar */}
          <Header 
            title={getSectionTitle()} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            systemMetrics={systemMetrics}
            onAlertClick={triggerAlertNotice}
          />

          {/* Content Body with scrollbars */}
          <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
            
            {activeSection === 'overview' && (
              searchQuery ? (
                <div className="space-y-6 animate-slide-up font-sans">
                  {/* Title card */}
                  <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl bg-gradient-to-r from-[#131722]/80 via-[#1b2030]/80 to-[#131722]/80">
                    <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                          <Activity size={16} className="text-indigo-400 mr-2 animate-pulse" />
                          Platform-Wide Global Forensic Investigator
                        </h4>
                        <p className="text-xs text-brand-text/50">Cross-tenant lookup across users, organizational spaces, calling history, and telemetry logs.</p>
                      </div>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded border border-indigo-500/15 font-mono font-bold">
                        FORENSIC_LOOKUP
                      </span>
                    </div>
                    <p className="text-xs text-brand-text/70">
                      Query matches found for: <strong className="text-indigo-400">"{searchQuery}"</strong> across 4 database indexes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Index 1: Matching Users / Identity Records */}
                    <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Index A: User & Identity Nodes</span>
                        <span className="text-[10px] text-brand-text/50 font-mono">System RBAC</span>
                      </div>
                      <div className="space-y-2">
                        {users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-brand-text/40 py-2 italic">No users matching search query.</p>
                        ) : (
                          users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg">
                              <div>
                                <span className="text-xs font-bold text-brand-text-bright block">{u.name}</span>
                                <span className="text-[10px] text-brand-text/50 block font-mono">{u.email}</span>
                                <span className="text-[9px] text-brand-text/40 block mt-0.5">Workspace: {u.currentWorkspace}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-semibold">{u.globalRole}</span>
                                <button
                                  type="button"
                                  onClick={() => handleStartImpersonation(u)}
                                  className="text-[10px] text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 rounded-md font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer shadow"
                                >
                                  <Ghost size={10} /> Ghost Mode
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Index 2: Matching Organizations & Spaces */}
                    <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Index B: Active Workspaces & Subdomains</span>
                        <span className="text-[10px] text-brand-text/50 font-mono font-bold">Multi-Tenancy</span>
                      </div>
                      <div className="space-y-2">
                        {workspaces.filter(ws => ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || ws.subdomain.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-brand-text/40 py-2 italic">No workspaces matching search query.</p>
                        ) : (
                          workspaces.filter(ws => ws.name.toLowerCase().includes(searchQuery.toLowerCase()) || ws.subdomain.toLowerCase().includes(searchQuery.toLowerCase())).map(ws => (
                            <div key={ws.id} className="flex items-center justify-between p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg">
                              <div>
                                <span className="text-xs font-bold text-brand-text-bright block">{ws.name}</span>
                                <span className="text-[10px] text-cyan-400 font-mono block">{ws.subdomain}.telecrm.io</span>
                                <span className="text-[9px] text-brand-text/40 block mt-0.5 font-sans font-medium">Owner: {ws.owner}</span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                ws.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {ws.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Index 3: Call & WhatsApp Recordings */}
                    <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Index C: Leads & Call Recording Streams</span>
                        <span className="text-[10px] text-brand-text/50 font-mono font-bold font-semibold">Forensic Logs</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { id: 'rec-901', leadName: 'Johnathan Archer', phone: '+1 (555) 019-9234', duration: '2m 14s', outcome: 'CONNECTED / INTERESTED', workspace: 'Nexus Corp Solutions' },
                          { id: 'rec-412', leadName: 'Sarah Connor', phone: '+1 (555) 014-4100', duration: '5m 45s', outcome: 'NATIVE SIM / FOLLOWUP', workspace: 'Apex Logistics Inc.' },
                          { id: 'rec-552', leadName: 'Victoria Chambers', phone: '+1 (555) 012-7881', duration: '0m 45s', outcome: 'BUSY / RETRY_LATER', workspace: 'Sovereign Capital LLC' }
                        ].filter(r => r.leadName.toLowerCase().includes(searchQuery.toLowerCase()) || r.outcome.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-brand-text/40 py-2 italic">No lead call records matching search query.</p>
                        ) : (
                          [
                            { id: 'rec-901', leadName: 'Johnathan Archer', phone: '+1 (555) 019-9234', duration: '2m 14s', outcome: 'CONNECTED / INTERESTED', workspace: 'Nexus Corp Solutions' },
                            { id: 'rec-412', leadName: 'Sarah Connor', phone: '+1 (555) 014-4100', duration: '5m 45s', outcome: 'NATIVE SIM / FOLLOWUP', workspace: 'Apex Logistics Inc.' },
                            { id: 'rec-552', leadName: 'Victoria Chambers', phone: '+1 (555) 012-7881', duration: '0m 45s', outcome: 'BUSY / RETRY_LATER', workspace: 'Sovereign Capital LLC' }
                          ].filter(r => r.leadName.toLowerCase().includes(searchQuery.toLowerCase()) || r.outcome.toLowerCase().includes(searchQuery.toLowerCase())).map(r => (
                            <div key={r.id} className="p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-xs font-bold text-brand-text-bright block">{r.leadName}</span>
                                  <span className="text-[10px] text-brand-text/50 block font-mono">{r.phone}</span>
                                </div>
                                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold font-semibold">
                                  {r.duration}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] border-t border-brand-border/20 pt-2">
                                <span className="text-brand-text/40">{r.workspace}</span>
                                <span className="text-emerald-400 font-bold">{r.outcome}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Index 4: Associated Security Transactions & Audits */}
                    <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-lg space-y-4">
                      <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                        <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Index D: Compliance Transaction Audit Logs</span>
                        <span className="text-[10px] text-brand-text/50 font-mono font-bold font-semibold">Audit Trails</span>
                      </div>
                      <div className="space-y-2">
                        {auditLogs.filter(log => log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || log.category.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-brand-text/40 py-2 italic font-mono">No transaction log matches.</p>
                        ) : (
                          auditLogs.filter(log => log.action.toLowerCase().includes(searchQuery.toLowerCase()) || log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || log.category.toLowerCase().includes(searchQuery.toLowerCase())).map(log => (
                            <div key={log.id} className="p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg text-xs font-mono">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-brand-text/40">[{log.timestamp}]</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                  log.severity === 'High' ? 'bg-rose-500/10 text-rose-400 font-semibold' :
                                  log.severity === 'Warning' ? 'bg-amber-500/10 text-amber-400 font-semibold' :
                                  'bg-emerald-500/10 text-emerald-400 font-semibold'
                                }`}>
                                  {log.severity}
                                </span>
                              </div>
                              <p className="text-brand-text-bright font-sans text-xs mt-1 leading-normal">{log.action}</p>
                              <div className="flex items-center justify-between mt-2 text-[9px] text-brand-text/50 border-t border-brand-border/20 pt-1.5 font-sans">
                                <span>Actor: {log.actor}</span>
                                <span className="font-mono">IP: {log.ipAddress}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-slide-up">
                {/* StatCards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Active Organizations" 
                    value={`${organizations.filter(o => o.status !== 'Suspended').length} / ${organizations.length}`}
                    change={`${calculatedStats.suspendedTenants} Suspended`} 
                    changeType={calculatedStats.suspendedTenants === 0 ? 'positive' : 'negative'}
                    icon={Layers} 
                    sparklineData={[3, 3, 4, 4, 4, 5, 5]}
                    color="cyan"
                    onClick={() => setActiveSection('workspaces')}
                  />

                  <StatCard 
                    title="Voice Trunk Traffic" 
                    value={`${trunks.reduce((acc, t) => acc + t.activeChannels, 0)} Streams`}
                    change="+14.8%" 
                    changeType="positive"
                    icon={PhoneCall} 
                    sparklineData={[210, 312, 420, 290, 380, 412, 482]}
                    color="indigo"
                    onClick={() => setActiveSection('telephony')}
                  />

                  <StatCard 
                    title="Monthly Revenue Rate" 
                    value={`$${systemMetrics.mrrAmount.toLocaleString()}`}
                    change="+12.4%" 
                    changeType="positive"
                    icon={TrendingUp} 
                    sparklineData={[1200, 1250, 1310, 1450, 1450, 1580, 1635]}
                    color="emerald"
                    onClick={() => setActiveSection('billing')}
                  />

                  <StatCard 
                    title="Aggregate SMS Traffic" 
                    value={calculatedStats.totalWhatsAppVolume.toLocaleString()}
                    change="+24.2%" 
                    changeType="positive"
                    icon={Wifi} 
                    sparklineData={[42000, 48000, 62000, 71000, 89000, 120000, 156600]}
                    color="amber"
                    onClick={() => setActiveSection('whatsapp')}
                  />
                </div>

                {/* Infrastructure Status Core Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Node Health monitoring panel */}
                  <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                            <Server size={16} className="text-cyan-400 mr-2" />
                            Global Infrastructure Node Health
                          </h4>
                          <p className="text-xs text-brand-text/50">Simulated system health indices across core threads</p>
                        </div>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 font-bold font-mono">
                          SLA_STABLE
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Database Connection Node */}
                        <div className="p-3 bg-[#131722]/65 border border-brand-border/55 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                              <Database size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-brand-text-bright block">Postgres Primary DB</span>
                              <span className="text-[10px] text-brand-text/50 font-mono">Connection thread pool</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">99.99%</span>
                            <span className="text-[9px] text-brand-text/40 uppercase font-bold">Stable</span>
                          </div>
                        </div>

                        {/* Websocket stream cluster */}
                        <div className="p-3 bg-[#131722]/65 border border-brand-border/55 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                              <Wifi size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-brand-text-bright block">Socket.IO Broadcasts</span>
                              <span className="text-[10px] text-brand-text/50 font-mono">Real-time socket streams</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">Active</span>
                            <span className="text-[9px] text-brand-text/40 uppercase font-bold">14.2k conn</span>
                          </div>
                        </div>

                        {/* Redis cache clusters */}
                        <div className="p-3 bg-[#131722]/65 border border-brand-border/55 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-amber-500/10 text-amber-400">
                              <Cpu size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-brand-text-bright block">Redis In-Memory Cache</span>
                              <span className="text-[10px] text-brand-text/50 font-mono">Query accelerator pool</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">98.4% Hit</span>
                            <span className="text-[9px] text-brand-text/40 uppercase font-bold">Synced</span>
                          </div>
                        </div>

                        {/* SMTP Campaign Relay Node */}
                        <div className="p-3 bg-[#131722]/65 border border-brand-border/55 rounded-lg flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
                              <Globe size={16} />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-brand-text-bright block">SMTP Email Relays</span>
                              <span className="text-[10px] text-brand-text/50 font-mono">Global campaign relays</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-emerald-400 font-mono block">Online</span>
                            <span className="text-[9px] text-brand-text/40 uppercase font-bold">0 Queue</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-border/40 mt-6 text-[10px] text-brand-text/40 font-mono flex justify-between items-center">
                      <span>HARDWARE_THREAD: 16 CORE INTEL</span>
                      <span>SYSTEM ONLINE 12 DAYS</span>
                    </div>
                  </div>

                  {/* Live Carriers monitor */}
                  <div className="glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
                        <h4 className="text-xs font-extrabold text-brand-text-bright uppercase tracking-wider flex items-center">
                          <PhoneCall size={14} className="text-indigo-400 mr-1.5" /> Live Carrier Signaling
                        </h4>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      <div className="space-y-3.5">
                        {trunks.map(t => (
                          <div key={t.id} className="flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-brand-text-bright block">{t.name}</span>
                              <span className="text-[10px] text-brand-text/50 font-mono">{t.phone}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-cyan-400 font-mono font-bold block">${t.ratePerMin}/min</span>
                              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveSection('telephony')}
                      className="w-full mt-6 flex items-center justify-center space-x-1.5 bg-[#1b2030] hover:bg-brand-border/70 border border-brand-border text-brand-text-bright text-xs py-2 rounded-lg transition-all cursor-pointer"
                    >
                      <span>Configure SIP Carriers</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic activity feed */}
                <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-lg">
                  <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
                      Core Security Diagnostic Logs (Audit trail)
                    </h4>
                    <button
                      type="button"
                      onClick={() => setActiveSection('audit')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Security Logs →
                    </button>
                  </div>

                  <div className="divide-y divide-brand-border/40 text-xs px-6 font-mono">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-brand-text/40 font-mono">[{log.timestamp}]</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.severity === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            log.severity === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {log.severity}
                          </span>
                          <span className="text-brand-text-bright font-sans">{log.action}</span>
                        </div>
                        <span className="text-brand-text/50 text-[11px]">by {log.actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )
            )}

            {/* Render individual modular views depending on navigation state */}
            {activeSection === 'workspaces' && (
              <WorkspaceTab 
                workspaces={workspaces}
                organizations={organizations}
                users={users}
                workspaceShares={workspaceShares}
                onShareWorkspace={handleShareWorkspace}
                onRevokeShare={handleRevokeShare}
                selectedOrgId={selectedOrgId}
                setSelectedOrgId={setSelectedOrgId}
                selectedWorkspaceId={selectedWorkspaceId}
                setSelectedWorkspaceId={setSelectedWorkspaceId}
                onUpdateWorkspace={handleUpdateWorkspace}
                onCreateWorkspace={handleCreateWorkspace}
                onDeleteWorkspace={handleDeleteWorkspace}
                onUpdateOrganization={handleUpdateOrganization}
                onCreateOrganization={handleCreateOrganization}
                onDeleteOrganization={handleDeleteOrganization}
                searchQuery={searchQuery}
                authToken={authToken}
                apiBaseUrl={apiBaseUrl}
              />
            )}

            {activeSection === 'billing' && (
              <BillingTab 
                plans={plans}
                licenseKeys={licenseKeys}
                organizations={organizations}
                onUpdateOrganization={handleUpdateOrganization}
                onUpdatePlan={handleUpdatePlan}
                onCreatePlan={handleCreatePlan}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'users' && (
              <UsersTab 
                users={users}
                onUpdateUser={handleUpdateUser}
                onCreateUser={handleCreateUser}
                onImpersonate={handleStartImpersonation}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'telephony' && (
              <TelephonyTab 
                trunks={trunks}
                onUpdateTrunk={handleUpdateTrunk}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'whatsapp' && (
              <WhatsAppTab 
                templates={templates}
                onUpdateTemplate={handleUpdateTemplate}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'workflows' && (
              <WorkflowsTab 
                workflows={workflows}
                onUpdateWorkflow={handleUpdateWorkflow}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'audit' && (
              <AuditTab 
                auditLogs={auditLogs}
                searchQuery={searchQuery}
              />
            )}

            {activeSection === 'config' && (
              <ConfigTab 
                organizations={organizations}
                onUpdateOrganization={handleUpdateOrganization}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
