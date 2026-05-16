import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  ShieldAlert, 
  ToggleLeft, 
  ToggleRight, 
  Check, 
  Sparkles, 
  RefreshCw,
  Globe,
  Key,
  ShieldCheck,
  Languages,
  Power,
  Trash2,
  Plus
} from 'lucide-react';

export default function ConfigTab({ organizations, onUpdateOrganization }) {
  const [selectedOrgId, setSelectedOrgId] = useState(organizations[0]?.id || '');

  // 1. Feature Flags with AI Caller Beta Included
  const [featureFlags, setFeatureFlags] = useState({
    'org-1': { aiScoring: true, whatsappV2: true, speechToText: false, reportsPdf: true, aiCaller: true },
    'org-2': { aiScoring: false, whatsappV2: true, speechToText: false, reportsPdf: false, aiCaller: false },
    'org-3': { aiScoring: false, whatsappV2: false, speechToText: false, reportsPdf: false, aiCaller: false },
    'org-4': { aiScoring: true, whatsappV2: true, speechToText: true, reportsPdf: true, aiCaller: true },
  });

  // 2. Paid Ecosystem Add-ons (Feature Gating)
  const [paidAddons, setPaidAddons] = useState({
    'org-1': { whatsappScheduler: true, customDomain: true, analyticsPlus: false },
    'org-2': { whatsappScheduler: false, customDomain: true, analyticsPlus: false },
    'org-3': { whatsappScheduler: false, customDomain: false, analyticsPlus: false },
    'org-4': { whatsappScheduler: true, customDomain: true, analyticsPlus: true },
  });

  // 3. Global System-Wide Orchestrations (Global Config)
  const [globalConfig, setGlobalConfig] = useState({
    defaultLanguage: 'en_US',
    primarySmsGateway: 'Direct SIM Bridge',
    maintenanceMode: false,
    systemBackupInterval: '24h'
  });

  // 4. Ecosystem Integration API Keys Database
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', workspace: 'Nexus Corp Solutions', label: 'Zapier Core Integration', value: 'wave_live_key_9921_xX9A88c21Z', scope: 'Full read/write', status: 'Active' },
    { id: 'key-2', workspace: 'Apex Logistics Inc.', label: 'WhatsApp campaign direct Graph Sync', value: 'wave_live_key_3110_bB1F44q20P', scope: 'WhatsApp Campaigns', status: 'Active' },
    { id: 'key-3', workspace: 'Sovereign Capital LLC', label: 'Ecosystem Analytics Export', value: 'wave_live_key_0021_zZ4T77r12L', scope: 'Read-only analytics', status: 'Active' },
    { id: 'key-4', workspace: 'Helix MedCare Group', label: 'Direct EHR Record Webhooks', value: 'wave_live_key_5540_rR9T00a52K', scope: 'Read/write records', status: 'Revoked' }
  ]);

  const [newKeyForm, setNewKeyForm] = useState({
    workspace: 'Nexus Corp Solutions',
    label: '',
    scope: 'Full read/write'
  });

  const toggleFlag = (orgId, flagKey) => {
    setFeatureFlags(prev => {
      const orgFlags = prev[orgId] || { aiScoring: false, whatsappV2: false, speechToText: false, reportsPdf: false, aiCaller: false };
      return {
        ...prev,
        [orgId]: {
          ...orgFlags,
          [flagKey]: !orgFlags[flagKey]
        }
      };
    });
  };

  const toggleAddon = (orgId, addonKey) => {
    setPaidAddons(prev => {
      const orgAddons = prev[orgId] || { whatsappScheduler: false, customDomain: false, analyticsPlus: false };
      return {
        ...prev,
        [orgId]: {
          ...orgAddons,
          [addonKey]: !orgAddons[addonKey]
        }
      };
    });
  };

  const handleOrgColorChange = (orgId, color) => {
    onUpdateOrganization(orgId, { primaryColor: color });
  };

  const handleOrgTitleChange = (orgId, title) => {
    onUpdateOrganization(orgId, { customTitle: title });
  };

  const handleGlobalConfigChange = (key, value) => {
    setGlobalConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyForm.label) return;

    const randomVal = 'wave_live_key_' + Math.floor(1000 + Math.random() * 9000) + '_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const newKey = {
      id: 'key-' + Date.now(),
      workspace: newKeyForm.workspace,
      label: newKeyForm.label,
      value: randomVal,
      scope: newKeyForm.scope,
      status: 'Active'
    };

    setApiKeys(prev => [newKey, ...prev]);
    setNewKeyForm(prev => ({ ...prev, label: '' }));
  };

  const toggleApiKeyStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Revoked' : 'Active';
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: nextStatus } : k));
  };

  const handleDeleteApiKey = (id) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  const selectedOrg = organizations.find(o => o.id === selectedOrgId) || organizations[0];

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Maintenance Alert Warning Banner */}
      {globalConfig.maintenanceMode && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white p-3.5 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs font-bold font-sans shadow-lg shadow-rose-600/10">
          <div className="flex items-center space-x-3.5">
            <span className="bg-white text-rose-600 px-2 py-0.5 rounded text-[9px] uppercase font-extrabold flex items-center gap-1 animate-pulse">
              <ShieldAlert size={12} /> Live Outage Mode Enforced
            </span>
            <span>
              Ecosystem Maintenance Mode is globally active. All workspaces are locked down and returning 503 Maintenance Status pages.
            </span>
          </div>
          <button 
            type="button"
            onClick={() => handleGlobalConfigChange('maintenanceMode', false)}
            className="bg-black/40 hover:bg-black/60 text-white px-3 py-1 rounded font-extrabold cursor-pointer transition-all active:scale-95 text-[10px]"
          >
            END MAINTENANCE
          </button>
        </div>
      )}

      {/* Split Columns Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          
          {/* Feature Flags Module with AI Caller */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                  <Sliders size={16} className="text-indigo-400 mr-2" />
                  Enterprise Feature Flags Engine
                </h4>
                <p className="text-xs text-brand-text/50">Toggle specific modular features per organization without code redeploys.</p>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 font-mono font-bold">
                FLAG_ROUTER
              </span>
            </div>

            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {organizations.map((org) => {
                const orgFlags = featureFlags[org.id] || { aiScoring: false, whatsappV2: false, speechToText: false, reportsPdf: false, aiCaller: false };
                
                return (
                  <div key={org.id} className="p-4 bg-[#131722]/50 border border-brand-border/40 rounded-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-brand-border/30 pb-2">
                      <div>
                        <span className="text-xs font-bold text-brand-text-bright block">{org.name}</span>
                        <span className="text-[10px] text-brand-text/50 font-mono">ID: {org.id} ({org.tier} Tier)</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        org.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {org.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      {/* Flag: Beta AI caller */}
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1.5 rounded border border-brand-border/30 col-span-2">
                        <div>
                          <span className="text-indigo-400 font-bold flex items-center gap-1 text-[11px]">
                            <Sparkles size={11} className="animate-spin" /> Beta AI Agent Caller
                          </span>
                          <span className="text-[9px] text-brand-text/40 block">Autonomous LLM-driven voice dialer node</span>
                        </div>
                        <button type="button" onClick={() => toggleFlag(org.id, 'aiCaller')} className="text-brand-text-bright">
                          {orgFlags.aiCaller ? <ToggleRight className="text-emerald-400" size={20} /> : <ToggleLeft className="text-brand-text/40" size={20} />}
                        </button>
                      </div>

                      {/* Flag: AI Lead Scoring */}
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1.5 rounded border border-brand-border/30">
                        <div>
                          <span className="text-brand-text-bright block font-medium">AI Lead Scoring</span>
                          <span className="text-[9px] text-brand-text/40 block">Predictive metrics</span>
                        </div>
                        <button type="button" onClick={() => toggleFlag(org.id, 'aiScoring')} className="text-brand-text-bright">
                          {orgFlags.aiScoring ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      {/* Flag: WhatsApp campaign v2 */}
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1.5 rounded border border-brand-border/30">
                        <div>
                          <span className="text-brand-text-bright block font-medium">Meta Campaigns v2</span>
                          <span className="text-[9px] text-brand-text/40 block">Interactive flows</span>
                        </div>
                        <button type="button" onClick={() => toggleFlag(org.id, 'whatsappV2')} className="text-brand-text-bright">
                          {orgFlags.whatsappV2 ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      {/* Flag: Speech to text */}
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1.5 rounded border border-brand-border/30">
                        <div>
                          <span className="text-brand-text-bright block font-medium">Speech-to-Text</span>
                          <span className="text-[9px] text-brand-text/40 block">Live dial transcripts</span>
                        </div>
                        <button type="button" onClick={() => toggleFlag(org.id, 'speechToText')} className="text-brand-text-bright">
                          {orgFlags.speechToText ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>

                      {/* Flag: Advanced reports */}
                      <div className="flex items-center justify-between bg-[#090b11]/55 px-2.5 py-1.5 rounded border border-brand-border/30">
                        <div>
                          <span className="text-brand-text-bright block font-medium">Enhanced Reports</span>
                          <span className="text-[9px] text-brand-text/40 block">Custom CSV/XLSX</span>
                        </div>
                        <button type="button" onClick={() => toggleFlag(org.id, 'reportsPdf')} className="text-brand-text-bright">
                          {orgFlags.reportsPdf ? <ToggleRight className="text-emerald-400" size={18} /> : <ToggleLeft className="text-brand-text/40" size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Third-Party API Key Manager */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                  <Key size={16} className="text-cyan-400 mr-2" />
                  Ecosystem API & Webhooks access Control
                </h4>
                <p className="text-xs text-brand-text/50">Issue, audit, and revoke secure API tokens for Zapier or WhatsApp integrations.</p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
                API_GATEWAY
              </span>
            </div>

            {/* Quick Create API key */}
            <form onSubmit={handleCreateApiKey} className="p-3 bg-[#0d111b]/80 border border-brand-border/40 rounded-lg mb-4 space-y-3">
              <span className="text-[10px] font-bold text-brand-text-bright uppercase tracking-wider block">Provision Integration Key</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-brand-text/60 font-semibold mb-0.5">Target Workspace</label>
                  <select
                    value={newKeyForm.workspace}
                    onChange={(e) => setNewKeyForm(prev => ({ ...prev, workspace: e.target.value }))}
                    className="w-full bg-[#131722]/85 border border-brand-border rounded px-2 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Nexus Corp Solutions">Nexus Corp Solutions</option>
                    <option value="Apex Logistics Inc.">Apex Logistics Inc.</option>
                    <option value="Sovereign Capital LLC">Sovereign Capital LLC</option>
                    <option value="Helix MedCare Group">Helix MedCare Group</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-brand-text/60 font-semibold mb-0.5">Scope Boundary</label>
                  <select
                    value={newKeyForm.scope}
                    onChange={(e) => setNewKeyForm(prev => ({ ...prev, scope: e.target.value }))}
                    className="w-full bg-[#131722]/85 border border-brand-border rounded px-2 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Full read/write">Full read/write</option>
                    <option value="WhatsApp Campaigns">WhatsApp Campaigns</option>
                    <option value="Read-only analytics">Read-only analytics</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newKeyForm.label}
                  onChange={(e) => setNewKeyForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Key description (e.g. Zapier CRM Outbound)"
                  className="flex-1 bg-[#090b11] border border-brand-border/85 rounded px-2.5 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500 font-sans"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] px-3 py-1 rounded shadow cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus size={10} /> Issue Key
                </button>
              </div>
            </form>

            {/* List API Keys */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {apiKeys.map(k => (
                <div key={k.id} className="p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg flex flex-col space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-brand-text-bright block leading-tight">{k.label}</span>
                      <span className="text-[9px] text-brand-text/50 block font-sans">Workspace: <strong className="text-indigo-400">{k.workspace}</strong></span>
                    </div>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      k.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {k.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 select-all font-mono text-[10px] bg-[#090b11]/70 px-2.5 py-1 rounded text-cyan-400 border border-brand-border/20">
                    <span className="truncate flex-1">{k.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-brand-text/40 pt-1 border-t border-brand-border/10">
                    <span>Scope: <strong className="text-brand-text/60 font-sans">{k.scope}</strong></span>
                    <div className="flex space-x-1.5">
                      <button
                        type="button"
                        onClick={() => toggleApiKeyStatus(k.id, k.status)}
                        className={`font-semibold cursor-pointer text-[9px] ${
                          k.status === 'Active' ? 'text-rose-400 hover:text-rose-300' : 'text-emerald-400 hover:text-emerald-300'
                        }`}
                      >
                        {k.status === 'Active' ? 'Revoke' : 'Reactivate'}
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteApiKey(k.id)}
                        className="text-brand-text/40 hover:text-rose-400 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Global System-Wide Orchestrator Panel */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                  <Languages size={16} className="text-emerald-400 mr-2" />
                  Global System-Wide Orchestrator
                </h4>
                <p className="text-xs text-brand-text/50">Change platform global defaults and high-level network overrides.</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-mono font-bold">
                SYSTEM_CORE
              </span>
            </div>

            <div className="space-y-4">
              {/* Default Language Selector */}
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1.5 uppercase tracking-wide">Default Platform Language</label>
                <select
                  value={globalConfig.defaultLanguage}
                  onChange={(e) => handleGlobalConfigChange('defaultLanguage', e.target.value)}
                  className="w-full bg-[#131722]/85 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="en_US">English (United States) - en_US</option>
                  <option value="es_ES">Spanish (Spain) - es_ES</option>
                  <option value="hi_IN">Hindi (India) - hi_IN</option>
                  <option value="de_DE">German (Germany) - de_DE</option>
                </select>
              </div>

              {/* Default SMS / Campaign Route */}
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1.5 uppercase tracking-wide">Primary SMS Gateway Provider</label>
                <select
                  value={globalConfig.primarySmsGateway}
                  onChange={(e) => handleGlobalConfigChange('primarySmsGateway', e.target.value)}
                  className="w-full bg-[#131722]/85 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Direct SIM Bridge">Direct WebSocket Mobile Gateway (Free SIM)</option>
                  <option value="Infobip Cloud SMTP">Infobip Premium Enterprise Cloud</option>
                  <option value="Plivo Backup Relay">Plivo Secondary Failover Carrier</option>
                </select>
                <span className="text-[10px] text-brand-text/40 block mt-1">
                  Default messaging carrier route used for global non-WhatsApp SMS workflows.
                </span>
              </div>

              {/* System Maintenance Lock Toggle */}
              <div className="p-3 bg-[#0d111b]/80 border border-brand-border/40 rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-brand-text-bright flex items-center gap-1.5">
                    <Power size={11} className={globalConfig.maintenanceMode ? 'text-rose-500 animate-pulse' : 'text-emerald-500'} /> Global Maintenance Lockout
                  </span>
                  <span className="text-[9px] text-brand-text/50 block">Force database read-only lockout mode across all subdomains.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleGlobalConfigChange('maintenanceMode', !globalConfig.maintenanceMode)}
                  className="focus:outline-none cursor-pointer"
                >
                  {globalConfig.maintenanceMode ? (
                    <ToggleRight className="text-rose-500" size={24} />
                  ) : (
                    <ToggleLeft className="text-brand-text/30" size={24} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Paid Ecosystem Add-ons (Feature Gating) */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                  <ShieldCheck size={16} className="text-cyan-400 mr-2" />
                  Ecosystem Paid Add-on Controllers
                </h4>
                <p className="text-xs text-brand-text/50">Manage feature modules unlocked via Stripe auxiliary subscription contracts.</p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
                ADDON_GATING
              </span>
            </div>

            {selectedOrg ? (
              <div className="space-y-4">
                {/* Select Org selector */}
                <div>
                  <label className="block text-xs font-semibold text-brand-text/80 mb-1.5 uppercase tracking-wide">Target Organization</label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-[#131722]/85 border border-brand-border rounded-lg px-3 py-2 text-xs text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                {/* List Add-ons for selected Org */}
                <div className="space-y-2.5">
                  {(() => {
                    const orgAddons = paidAddons[selectedOrg.id] || { whatsappScheduler: false, customDomain: false, analyticsPlus: false };
                    
                    return (
                      <>
                        {/* Add-on 1: WhatsApp Scheduler */}
                        <div className="flex items-center justify-between p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-brand-text-bright block">WhatsApp Automated campaign Scheduler</span>
                            <span className="text-[9px] text-brand-text/40 block">Enable recurring campaigns and cron-driven templates.</span>
                          </div>
                          <button type="button" onClick={() => toggleAddon(selectedOrg.id, 'whatsappScheduler')} className="text-brand-text-bright">
                            {orgAddons.whatsappScheduler ? <ToggleRight className="text-emerald-400" size={20} /> : <ToggleLeft className="text-brand-text/40" size={20} />}
                          </button>
                        </div>

                        {/* Add-on 2: Custom Domains */}
                        <div className="flex items-center justify-between p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-brand-text-bright block">CNAME Custom Domain Mapping</span>
                            <span className="text-[9px] text-brand-text/40 block">Allows users to map crm.clientcompany.com instead of subdomain.</span>
                          </div>
                          <button type="button" onClick={() => toggleAddon(selectedOrg.id, 'customDomain')} className="text-brand-text-bright">
                            {orgAddons.customDomain ? <ToggleRight className="text-emerald-400" size={20} /> : <ToggleLeft className="text-brand-text/40" size={20} />}
                          </button>
                        </div>

                        {/* Add-on 3: Analytics Plus */}
                        <div className="flex items-center justify-between p-3 bg-[#131722]/40 border border-brand-border/30 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-brand-text-bright block">Analytics Plus Executive Report exporter</span>
                            <span className="text-[9px] text-brand-text/40 block">Generates automated weekly performance digests emailed directly to execs.</span>
                          </div>
                          <button type="button" onClick={() => toggleAddon(selectedOrg.id, 'analyticsPlus')} className="text-brand-text-bright">
                            {orgAddons.analyticsPlus ? <ToggleRight className="text-emerald-400" size={20} /> : <ToggleLeft className="text-brand-text/40" size={20} />}
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <p className="text-xs text-brand-text/40 text-center py-12">Please create an organization first.</p>
            )}
          </div>

          {/* White-labeling Control Panel */}
          <div className="glass-panel rounded-xl border border-brand-border/60 p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                  <Palette size={16} className="text-cyan-400 mr-2" />
                  White-Labeling & Branding Engine
                </h4>
                <p className="text-xs text-brand-text/50">Configure custom brand identities and accent coloring for individual tenants.</p>
              </div>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
                BRAND_CUSTOM
              </span>
            </div>

            {selectedOrg ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#131722]/40 border border-brand-border/50 rounded-xl space-y-4">
                  {/* Title Customization */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-text/80 mb-1">Custom Workspace Title</label>
                    <input
                      type="text"
                      value={selectedOrg.customTitle || ''}
                      onChange={(e) => handleOrgTitleChange(selectedOrg.id, e.target.value)}
                      placeholder="E.g. Nexus Support Center"
                      className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-xs text-brand-text-bright focus:outline-none focus:border-cyan-500 transition-colors animate-none"
                    />
                  </div>

                  {/* Primary Color Customization */}
                  <div>
                    <label className="block text-xs font-semibold text-brand-text/80 mb-2">Primary Workspace Theme Color</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={selectedOrg.primaryColor || '#6366f1'}
                        onChange={(e) => handleOrgColorChange(selectedOrg.id, e.target.value)}
                        className="w-10 h-10 bg-transparent border-none rounded cursor-pointer p-0"
                      />
                      
                      <div className="flex items-center space-x-2">
                        {[
                          { hex: '#6366f1', label: 'Indigo' },
                          { hex: '#06b6d4', label: 'Cyan' },
                          { hex: '#10b981', label: 'Emerald' },
                          { hex: '#f59e0b', label: 'Gold' },
                          { hex: '#f43f5e', label: 'Rose' },
                        ].map((sw) => (
                          <button
                            key={sw.hex}
                            type="button"
                            onClick={() => handleOrgColorChange(selectedOrg.id, sw.hex)}
                            style={{ backgroundColor: sw.hex }}
                            className={`w-5 h-5 rounded-full border transition-all active:scale-90 ${
                              selectedOrg.primaryColor === sw.hex ? 'ring-2 ring-white scale-110' : 'border-transparent'
                            }`}
                            title={sw.label}
                          />
                        ))}
                      </div>

                      <span className="font-mono text-xs text-brand-text-bright ml-auto">
                        {selectedOrg.primaryColor || '#6366f1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tenant Workspace Mock Preview Card */}
                <div className="border border-brand-border/60 rounded-xl overflow-hidden bg-[#090b11] h-28 relative flex flex-col justify-between p-3.5">
                  <div className="flex items-center justify-between border-b border-brand-border/40 pb-1.5">
                    <div className="flex items-center space-x-2">
                      <span 
                        style={{ backgroundColor: selectedOrg.primaryColor || '#6366f1' }}
                        className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]"
                      />
                      <span className="text-xs font-bold text-brand-text-bright font-sans">
                        {selectedOrg.customTitle || `${selectedOrg.name} Dashboard`}
                      </span>
                    </div>
                    <span className="text-[8px] bg-brand-border/60 text-brand-text px-1.5 py-0.5 rounded font-mono font-bold">
                      WS_PREVIEW
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-0.5">
                      <span 
                        style={{ color: selectedOrg.primaryColor || '#6366f1' }}
                        className="text-xs font-extrabold font-sans flex items-center justify-center gap-1"
                      >
                        <Sparkles size={12} />
                        Custom Branding Enforced Successfully
                      </span>
                      <p className="text-[9px] text-brand-text/40">This preview mimics the client-facing subdomain view.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-brand-text/40 text-center py-12">Please create an organization first.</p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
