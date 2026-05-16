import React, { useState } from 'react';
import { GitBranch, Play, Pause, Zap, CheckCircle, Search, RefreshCw, Terminal, Eye } from 'lucide-react';
import UiModal from './UiModal';

export default function WorkflowsTab({ workflows, onUpdateWorkflow, searchQuery }) {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([
    { id: 'sim-1', timestamp: '12:04:12', msg: 'Core trigger listener activated [LEAD_INBOUND]' },
    { id: 'sim-2', timestamp: '12:04:13', msg: 'Scanning matching webhook criteria... Found Node 122' },
    { id: 'sim-3', timestamp: '12:04:13', msg: 'Queue entry initialized. Transferred payload successfully. Code: 200' },
  ]);

  const filteredWorkflows = workflows.filter(w => 
    w.workspace.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.triggerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleWorkflowStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    onUpdateWorkflow(id, { activeStatus: nextStatus });
  };

  const handleSimulateTrigger = (wf) => {
    // Generate simulated run and append to logs
    const newLog = {
      id: `sim-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      msg: `FORCED SIMULATION ON [${wf.triggerName}] (Actions: ${wf.actionsCount}) -> Executed in ${wf.averageExecTime}ms. Output: SUCCESS.`
    };
    
    // Increment run triggers locally
    onUpdateWorkflow(wf.id, { triggerCount: wf.triggerCount + 1 });
    setSimulationLogs(prev => [newLog, ...prev]);
    
    alert(`Trigger event fired for "${wf.triggerName}"! Execution speed: ${wf.averageExecTime}ms. Added to system event logs.`);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Workflow Engine Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sim Queue Event logs console */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-brand-border/30 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                <Terminal size={16} className="text-indigo-400 mr-2 animate-pulse" />
                Live Automated Execution Console
              </h4>
              <p className="text-xs text-brand-text/50">Simulated system-wide trigger events and automation sequences</p>
            </div>
            <button
              type="button"
              onClick={() => setSimulationLogs([])}
              className="text-[10px] text-brand-text/50 hover:text-brand-text-bright font-mono transition-colors"
            >
              Clear Buffer
            </button>
          </div>

          {/* Console Output box */}
          <div className="bg-[#090b11] border border-brand-border/60 rounded-xl p-4 h-36 font-mono text-[11px] text-emerald-400 overflow-y-auto space-y-1.5 scrollbar-thin">
            {simulationLogs.length === 0 ? (
              <p className="text-brand-text/40 text-center py-12">Console idle. Fire a trigger event to see logs.</p>
            ) : (
              simulationLogs.map(l => (
                <div key={l.id} className="flex items-start space-x-2">
                  <span className="text-brand-text/40">[{l.timestamp}]</span>
                  <span className="text-cyan-400">⚡</span>
                  <span className="break-all">{l.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engine status metrics */}
        <div className="glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
          <h4 className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">Trigger Scheduler</h4>
          
          <div className="my-3 space-y-2 flex-1 justify-center flex flex-col text-xs">
            <div className="flex justify-between items-center bg-[#131722]/50 px-3 py-2 rounded">
              <span className="text-brand-text/70">Engine Thread Pools</span>
              <span className="font-mono font-bold text-emerald-400">Idle (0.01% load)</span>
            </div>
            <div className="flex justify-between items-center bg-[#131722]/50 px-3 py-2 rounded">
              <span className="text-brand-text/70">Queue Capacity</span>
              <span className="font-mono font-bold text-brand-text-bright">100,000 req/sec</span>
            </div>
          </div>

          <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-lg text-[11px] text-indigo-400 text-center font-semibold">
            Scheduler Engine Online v3.02
          </div>
        </div>
      </div>

      {/* Workflows Directory */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
            <GitBranch size={14} className="text-cyan-400 mr-2" /> Global Automation Nodes
          </h4>
          <span className="text-xs text-brand-text/50 font-mono">FLOW_SCHEMAS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Workspace / Origin</th>
                <th className="px-6 py-4">Trigger Pipeline Event</th>
                <th className="px-6 py-4">Chain Size (Actions)</th>
                <th className="px-6 py-4">Aggregate runs</th>
                <th className="px-6 py-4">Mean Exec Time</th>
                <th className="px-6 py-4">Scheduler State</th>
                <th className="px-6 py-4 text-right">Event Simulation & State Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {filteredWorkflows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-brand-text/50">
                    No matching automation nodes found in this sandbox.
                  </td>
                </tr>
              ) : (
                filteredWorkflows.map((w) => (
                  <tr key={w.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                    <td className="px-6 py-4 font-semibold text-cyan-400">
                      {w.workspace}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-text-bright">
                      {w.triggerName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-text/80 font-mono">
                      {w.actionsCount} steps
                    </td>
                    <td className="px-6 py-4 font-mono text-indigo-400 font-bold">
                      {w.triggerCount.toLocaleString()} events
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-text/70">
                      {w.averageExecTime}ms
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                        w.activeStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${w.activeStatus === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {w.activeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {/* Fire Event Simulation */}
                      <button
                        type="button"
                        onClick={() => handleSimulateTrigger(w)}
                        disabled={w.activeStatus !== 'Active'}
                        className={`p-1.5 rounded border transition-all duration-150 ${
                          w.activeStatus === 'Active'
                            ? 'bg-indigo-600/10 hover:bg-indigo-600/25 border-indigo-500/30 text-indigo-400 hover:text-indigo-300'
                            : 'bg-brand-border/30 border-brand-border/40 text-brand-text/30 cursor-not-allowed'
                        }`}
                        title={w.activeStatus === 'Active' ? 'Inject Live Simulation Event' : 'Trigger disabled (Pipeline paused)'}
                      >
                        <Zap size={12} className={w.activeStatus === 'Active' ? 'animate-pulse' : ''} />
                      </button>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => toggleWorkflowStatus(w.id, w.activeStatus)}
                        className={`p-1.5 rounded border transition-all duration-150 ${
                          w.activeStatus === 'Active'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                        title={w.activeStatus === 'Active' ? 'Pause Automation Trigger' : 'Activate Automation Trigger'}
                      >
                        {w.activeStatus === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                      </button>
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
