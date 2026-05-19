import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Download, RefreshCw, Search, Filter, HelpCircle, Calendar } from 'lucide-react';

export default function AuditTab({ auditLogs, searchQuery }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.ipAddress.includes(searchQuery);
    const matchesSeverity = filterSeverity === 'ALL' || log.severity === filterSeverity;
    const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory;

    return matchesSearch && matchesSeverity && matchesCategory;
  });

  const handleExportLogs = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      
      // Simulate CSV generation and download
      const headers = 'ID,Timestamp,Actor,Action,Category,IPAddress,Severity\n';
      const rows = filteredLogs.map(l => 
        `"${l.id}","${l.timestamp}","${l.actor}","${l.action}","${l.category}","${l.ipAddress}","${l.severity}"`
      ).join('\n');
      
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `telecrm_audit_logs_${Date.now()}.csv`);
      a.click();
      
      alert('Security logs database exported successfully as CSV file!');
    }, 1500);
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'High':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Search & Operations toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 glass-panel border-brand-border/60 rounded-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Severity filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <ShieldCheck size={12} className="text-indigo-400" />
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Threat Levels</option>
              <option value="Info" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Info</option>
              <option value="Warning" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Warning</option>
              <option value="High" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>High Severity</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
            <Filter size={12} className="text-cyan-400" />
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
            >
              <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Operations</option>
              <option value="Auth" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Auth Systems</option>
              <option value="Workspace" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Workspace Mgmt</option>
              <option value="Billing" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Billing Tiers</option>
              <option value="Gateway" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Carrier SIP</option>
              <option value="Templates" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Templates</option>
            </select>
          </div>
        </div>

        {/* Export database button */}
        <button
          type="button"
          onClick={handleExportLogs}
          disabled={isExporting}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
        >
          {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
          <span>{isExporting ? 'Synthesizing CSV...' : 'Export Database'}</span>
        </button>
      </div>

      {/* Security logs table */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
            <ShieldCheck size={14} className="text-cyan-400 mr-2" /> Compliance & Operations Database Audit
          </h4>
          <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 font-mono font-bold">
            AUDIT_MODE: STRENGTHENED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Execution Timestamp</th>
                <th className="px-6 py-4">Administrative Actor</th>
                <th className="px-6 py-4">Operation Description</th>
                <th className="px-6 py-4">Functional Domain</th>
                <th className="px-6 py-4">Remote IP Address</th>
                <th className="px-6 py-4">Threat Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {filteredLogs.length === 0 ? (
                <tr className="font-sans">
                  <td colSpan="7" className="px-6 py-12 text-center text-brand-text/50">
                    No compliance events matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-bold text-brand-text/60 select-all">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 text-brand-text/70">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 font-sans font-semibold text-brand-text-bright">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4 font-sans text-brand-text-bright">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <span className="px-2 py-0.5 rounded bg-[#1b2030] border border-brand-border/60 text-[10px] text-cyan-400 font-bold">
                        {log.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text/80">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 font-sans">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getSeverityBadge(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
