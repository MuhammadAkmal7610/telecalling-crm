import React from 'react';
import { Search, Bell, ShieldAlert, Cpu, Database, Wifi } from 'lucide-react';

export default function Header({ title, searchQuery, setSearchQuery, systemMetrics, onAlertClick }) {
  return (
    <header className="h-16 border-b border-brand-border/60 bg-[#090b11]/55 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Title & Path */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono text-indigo-400 font-bold tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/15">
          SYS_ROOT
        </span>
        <span className="text-brand-text/40">/</span>
        <h2 className="text-md font-bold text-brand-text-bright font-sans m-0 tracking-wide">
          {title}
        </h2>
      </div>

      {/* Global Interactive Elements */}
      <div className="flex items-center space-x-6">
        {/* Search Box */}
        <div className="relative w-64 group hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/50 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search records, trunks, logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131722]/85 border border-brand-border/80 rounded-lg pl-9 pr-8 py-1.5 text-xs text-brand-text-bright placeholder-brand-text/50 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all font-sans"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] bg-brand-border/60 px-1 py-0.5 rounded text-brand-text/70 font-mono font-bold border border-brand-border/30">
            Ctrl K
          </span>
        </div>

        {/* Live System Cockpit Parameters */}
        <div className="flex items-center space-x-4 border-l border-brand-border/60 pl-6 text-xs text-brand-text/70">
          {/* CPU Indicator */}
          <div className="flex items-center space-x-1.5" title="CPU Core Cluster Status">
            <Cpu size={12} className="text-indigo-400" />
            <span className="font-medium hidden lg:inline">CPU</span>
            <span className="font-mono font-bold text-brand-text-bright">{systemMetrics.cpuLoad}%</span>
          </div>

          {/* Database Latency */}
          <div className="flex items-center space-x-1.5" title="PostgreSQL Live Query Latency">
            <Database size={12} className="text-cyan-400" />
            <span className="font-medium hidden lg:inline">DB Latency</span>
            <span className="font-mono font-bold text-emerald-400">{systemMetrics.dbLatency}ms</span>
          </div>

          {/* Websocket Stream */}
          <div className="flex items-center space-x-1.5" title="Socket.IO Broadcast Sockets">
            <Wifi size={12} className="text-emerald-400" />
            <span className="font-medium hidden lg:inline">Socket Stream</span>
            <span className="font-mono font-bold text-brand-text-bright">Stable</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-2 border-l border-brand-border/60 pl-6">
          {/* Notifications */}
          <button
            type="button"
            onClick={onAlertClick}
            className="p-2 rounded-lg bg-[#131722]/85 border border-brand-border/60 hover:border-indigo-500/40 text-brand-text hover:text-brand-text-bright relative transition-all duration-200"
          >
            <Bell size={14} className="animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-brand-bg" />
          </button>

          {/* Emergency Alert indicator */}
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/15 cursor-pointer transition-all duration-200" title="Emergency Trunk Hotlines Active">
            <ShieldAlert size={14} />
          </div>
        </div>
      </div>
    </header>
  );
}
