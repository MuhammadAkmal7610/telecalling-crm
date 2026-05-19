import React, { useState } from 'react';
import { 
  Activity, 
  Layers, 
  CreditCard, 
  Users, 
  PhoneCall, 
  MessageSquare, 
  GitBranch, 
  ShieldCheck,
  Sliders,
  Terminal,
  Server,
  ChevronDown,
  ChevronRight,
  Building,
  Globe
} from 'lucide-react';
import Logo from '../assets/Logo.png';

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  currentAdmin, 
  systemStatus,
  organizations = [],
  workspaces = [],
  selectedOrgId = 'ALL',
  setSelectedOrgId,
  selectedWorkspaceId = 'ALL',
  setSelectedWorkspaceId
}) {
  const [isOrgsExpanded, setIsOrgsExpanded] = useState(true);
  const [expandedOrgs, setExpandedOrgs] = useState({});

  const toggleOrg = (orgId, e) => {
    e.stopPropagation();
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: prev[orgId] === false ? true : false // default is true (expanded)
    }));
  };

  const navItems = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'workspaces', name: 'Organizations', icon: Layers, badge: 'Active' },
    { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
    { id: 'users', name: 'Users & Roles', icon: Users },
    { id: 'telephony', name: 'Telephony GW', icon: PhoneCall },
    { id: 'whatsapp', name: 'WhatsApp Meta', icon: MessageSquare, badge: 'New' },
    { id: 'workflows', name: 'Automation WF', icon: GitBranch },
    { id: 'audit', name: 'Security & Audits', icon: ShieldCheck },
    { id: 'config', name: 'FeatureFlags & Brand', icon: Sliders },
  ];

  return (
    <div className="w-64 h-screen glass-panel border-r border-brand-border/60 flex flex-col fixed left-0 top-0 z-30">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-brand-border/40 flex items-center space-x-3 bg-[#0d111b]/80">
        <div className="flex-shrink-0">
          <img src={Logo} alt="Wave Logo" className="w-9 h-9 object-contain" />
        </div>
        <div>
          <h1 className="text-base font-bold text-brand-text-bright font-sans m-0 tracking-wider">
            Wave <span className="text-indigo-400">Admin</span>
          </h1>
          <p className="text-[10px] text-brand-text/50 uppercase tracking-widest font-semibold mt-0.5">
            Enterprise Hub
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          if (item.id === 'workspaces') {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection('workspaces');
                    setIsOrgsExpanded(!isOrgsExpanded);
                    if (!isOrgsExpanded) {
                      setSelectedOrgId('ALL');
                      setSelectedWorkspaceId('ALL');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-indigo-600/15 border-l-2 border-indigo-500 text-brand-text-bright shadow-inner shadow-indigo-500/5' 
                      : 'text-brand-text hover:bg-brand-border/40 hover:text-brand-text-bright'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      size={18} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-indigo-400' : 'text-brand-text/70 group-hover:text-brand-text-bright'
                      }`} 
                    />
                    <span className="text-sm font-medium font-sans">
                      Organizations
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5">
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                    {isOrgsExpanded ? <ChevronDown size={14} className="text-brand-text/50" /> : <ChevronRight size={14} className="text-brand-text/50" />}
                  </div>
                </button>

                {/* Submenu for Organizations and Workspaces */}
                {isOrgsExpanded && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l border-brand-border/30 ml-6 animate-slide-down">
                    {/* "All Organizations" Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrgId('ALL');
                        setSelectedWorkspaceId('ALL');
                        setActiveSection('workspaces');
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        selectedOrgId === 'ALL' && selectedWorkspaceId === 'ALL'
                          ? 'text-cyan-400 bg-cyan-500/10 font-bold font-semibold'
                          : 'text-brand-text/70 hover:text-brand-text-bright hover:bg-brand-border/20'
                      }`}
                    >
                      📁 All Organizations
                    </button>

                    {organizations.map((org) => {
                      const isOrgSelected = selectedOrgId === org.id;
                      const isOrgOpen = expandedOrgs[org.id] !== false; // open by default
                      const orgWorkspaces = workspaces.filter(ws => ws.orgId === org.id);

                      return (
                        <div key={org.id} className="space-y-1">
                          <div
                            onClick={() => {
                              setSelectedOrgId(org.id);
                              setSelectedWorkspaceId('ALL');
                              setActiveSection('workspaces');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-all ${
                              isOrgSelected && selectedWorkspaceId === 'ALL'
                                ? 'text-indigo-400 bg-indigo-500/10 font-bold font-semibold'
                                : 'text-brand-text/70 hover:text-brand-text-bright hover:bg-brand-border/20'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Building size={11} className="text-indigo-400/80" />
                              {org.name}
                            </span>
                            <div
                              onClick={(e) => toggleOrg(org.id, e)}
                              className="p-0.5 rounded hover:bg-brand-border/40 text-brand-text/50 hover:text-brand-text-bright"
                            >
                              {isOrgOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                            </div>
                          </div>

                          {/* Workspaces Submenu under Org */}
                          {isOrgOpen && orgWorkspaces.length > 0 && (
                            <div className="pl-3 py-0.5 space-y-0.5 border-l border-brand-border/20 ml-2 animate-slide-down">
                              {orgWorkspaces.map((ws) => {
                                const isWsSelected = selectedWorkspaceId === ws.id;

                                return (
                                  <button
                                    key={ws.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedOrgId(org.id);
                                      setSelectedWorkspaceId(ws.id);
                                      setActiveSection('workspaces');
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded text-[11px] font-sans transition-all flex items-center gap-1.5 ${
                                      isWsSelected
                                        ? 'text-emerald-400 bg-emerald-500/10 font-bold font-semibold border-l-2 border-emerald-500'
                                        : 'text-brand-text/60 hover:text-brand-text-bright hover:bg-brand-border/10'
                                    }`}
                                  >
                                    <Globe size={10} className="text-cyan-400/80" />
                                    <span className="truncate">{ws.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-600/15 border-l-2 border-indigo-500 text-brand-text-bright shadow-inner shadow-indigo-500/5' 
                  : 'text-brand-text hover:bg-brand-border/40 hover:text-brand-text-bright'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  size={18} 
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-brand-text/70 group-hover:text-brand-text-bright'
                  }`} 
                />
                <span className="text-sm font-medium font-sans">
                  {item.name}
                </span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${
                  item.badge === 'Active' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Connection / Status Box in Footer */}
      <div className="p-4 border-t border-brand-border/40 bg-[#0d111b]/60 flex flex-col space-y-3.5">
        {/* Admin Profile Summary */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px]">
            <div className="w-full h-full bg-[#131722] rounded-full flex items-center justify-center text-xs font-bold text-brand-text-bright uppercase">
              {currentAdmin.avatarLetters}
            </div>
          </div>
          <div>
            <h5 className="text-xs font-semibold text-brand-text-bright truncate max-w-[140px]">
              {currentAdmin.name}
            </h5>
            <p className="text-[10px] text-brand-text/50 truncate max-w-[140px]">
              {currentAdmin.role}
            </p>
          </div>
        </div>

        {/* Live System Indicators */}
        <div className="p-3 bg-[#090b11]/70 border border-brand-border/50 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-brand-text/60 flex items-center">
              <Server size={10} className="mr-1 text-cyan-400" /> API Gateway
            </span>
            <div className="flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
              <span className="text-[9px] text-brand-text/80 font-mono font-bold">ONLINE</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-brand-text/60 flex items-center">
              <Activity size={10} className="mr-1 text-indigo-400" /> WS Session
            </span>
            <span className="text-[9px] text-emerald-400 font-mono font-bold">14.2k Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
