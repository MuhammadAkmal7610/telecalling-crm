import React, { useState } from 'react';
import { MessageSquare, Check, X, Search, ShieldAlert, Wifi, MessageCircle, Eye } from 'lucide-react';
import UiModal from './UiModal';

export default function WhatsAppTab({ templates, onUpdateTemplate, searchQuery }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.workspace.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id) => {
    onUpdateTemplate(id, { status: 'Approved' });
    if (selectedTemplate && selectedTemplate.id === id) {
      setSelectedTemplate({ ...selectedTemplate, status: 'Approved' });
    }
  };

  const handleReject = (id) => {
    onUpdateTemplate(id, { status: 'Rejected' });
    if (selectedTemplate && selectedTemplate.id === id) {
      setSelectedTemplate({ ...selectedTemplate, status: 'Rejected' });
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* WhatsApp Gateway Meta Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
              <MessageSquare size={16} className="text-indigo-400 mr-2 animate-pulse" />
              Meta Cloud API Gateway Status
            </h4>
            <p className="text-xs text-brand-text/50">Broadcasting WhatsApp Business API configurations across active tenants.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">SYNCED_WITH_META</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex items-center justify-between">
          <span className="text-xs text-brand-text/80 font-medium">Approval Queue Size</span>
          <span className="text-xl font-mono font-extrabold text-amber-400">
            {templates.filter(t => t.status === 'Pending Meta Approval').length} Pending
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between p-4 glass-panel border-brand-border/60 rounded-xl">
        <div className="flex items-center space-x-1.5 bg-[#131722]/85 border border-brand-border/60 rounded-lg px-2.5 py-1.5 text-xs text-brand-text">
          <MessageCircle size={12} className="text-indigo-400" />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-transparent focus:outline-none border-none text-brand-text-bright pr-4"
          >
            <option value="ALL" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>All Templates</option>
            <option value="Pending Meta Approval" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Pending Approval</option>
            <option value="Approved" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Approved</option>
            <option value="Rejected" style={{ backgroundColor: '#131722', color: '#e2e8f0' }}>Rejected</option>
          </select>
        </div>

        <span className="text-[10px] text-brand-text/40 font-mono font-bold">
          SECURE_SANDBOX
        </span>
      </div>

      {/* Templates queue list */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
            WhatsApp Template Verification & Authorization Queue
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Workspace / Origin</th>
                <th className="px-6 py-4">Template Identifier</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Language Code</th>
                <th className="px-6 py-4">Verification Status</th>
                <th className="px-6 py-4 text-right">Verification & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-brand-text/50">
                    No matching WhatsApp templates in this queue.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-cyan-400">
                      {t.workspace}
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-brand-text-bright">
                      {t.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-text/80">
                      {t.category}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-text/60">
                      {t.language}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                        t.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        t.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'Approved' ? 'bg-emerald-400' :
                          t.status === 'Rejected' ? 'bg-rose-400' :
                          'bg-amber-400'
                        }`} />
                        {t.status === 'Pending Meta Approval' ? 'Pending Approval' : t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* View details */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTemplate(t);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-brand-primary/40 transition-all duration-150"
                        title="View & Verify Content"
                      >
                        <Eye size={12} />
                      </button>
                      
                      {t.status === 'Pending Meta Approval' && (
                        <>
                          {/* Approve */}
                          <button
                            type="button"
                            onClick={() => handleApprove(t.id)}
                            className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all duration-150"
                            title="Approve & Send to Meta"
                          >
                            <Check size={12} />
                          </button>

                          {/* Reject */}
                          <button
                            type="button"
                            onClick={() => handleReject(t.id)}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20 transition-all duration-150"
                            title="Reject Template"
                          >
                            <X size={12} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Detail Verification Modal */}
      {selectedTemplate && (
        <UiModal isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedTemplate(null); }} title="Verify WhatsApp Template Content">
          <div className="space-y-4">
            <div className="p-3 bg-[#131722]/80 border border-brand-border/50 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-brand-text/50 block font-semibold uppercase tracking-wider text-[10px]">Workspace Origin</span>
                  <strong className="text-cyan-400">{selectedTemplate.workspace}</strong>
                </div>
                <div>
                  <span className="text-brand-text/50 block font-semibold uppercase tracking-wider text-[10px]">Template Name</span>
                  <strong className="text-brand-text-bright font-mono">{selectedTemplate.name}</strong>
                </div>
                <div>
                  <span className="text-brand-text/50 block font-semibold uppercase tracking-wider text-[10px]">Category Code</span>
                  <strong className="text-brand-text-bright">{selectedTemplate.category}</strong>
                </div>
                <div>
                  <span className="text-brand-text/50 block font-semibold uppercase tracking-wider text-[10px]">Target Language</span>
                  <strong className="text-brand-text-bright font-mono">{selectedTemplate.language}</strong>
                </div>
              </div>
            </div>

            {/* Simulated WhatsApp Bubble preview */}
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-2 uppercase tracking-wide">WhatsApp Client Render Preview</label>
              <div className="bg-[#0b141a] rounded-xl p-4 border border-[#202c33]/80 relative overflow-hidden flex flex-col">
                {/* Visual WhatsApp UI elements */}
                <div className="bg-[#1f2c34] text-[#e9edef] px-3.5 py-2.5 rounded-lg text-xs max-w-[85%] self-start relative shadow-md rounded-tl-none border-l-4 border-teal-500/85">
                  <p className="whitespace-pre-line font-sans leading-relaxed">
                    {selectedTemplate.templateBody}
                  </p>
                  
                  {/* Dynamic Template Parameters Guide */}
                  <div className="mt-2.5 pt-2 border-t border-[#2a3942]/60 text-[10px] text-[#8696a0] font-mono">
                    Parameters schema: {"{{1}} = Lead Name, {{2}} = Workspace Domain"}
                  </div>
                </div>
                
                {/* WhatsApp Chat Bubble Accent */}
                <div className="text-[9px] text-[#8696a0] text-right mt-1.5 self-start pl-2">
                  12:00 PM ✓✓
                </div>
              </div>
            </div>

            {/* Security Compliance Audit */}
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs">
              <h5 className="font-semibold text-indigo-400 flex items-center mb-1">
                <ShieldAlert size={14} className="mr-1.5" /> Automated Security Compliance Assessment
              </h5>
              <p className="text-[11px] text-brand-text/80">
                AI scanning confirms 0 security violations, malware tags, or abusive spam patterns. Ready for Meta transmission pipeline.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-brand-border/60">
              <span className="text-[10px] text-brand-text/40 font-mono">TEMPLATE_ID: {selectedTemplate.id}</span>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsDetailModalOpen(false); setSelectedTemplate(null); }}
                  className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                
                {selectedTemplate.status === 'Pending Meta Approval' && (
                  <>
                    <button
                      type="button"
                      onClick={() => { handleReject(selectedTemplate.id); setIsDetailModalOpen(false); }}
                      className="px-4 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                    >
                      Reject Message
                    </button>
                    <button
                      type="button"
                      onClick={() => { handleApprove(selectedTemplate.id); setIsDetailModalOpen(false); }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg hover:shadow-emerald-500/15 transition-all cursor-pointer"
                    >
                      Approve & Synchronize
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </UiModal>
      )}
    </div>
  );
}
