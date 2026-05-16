import React, { useState } from 'react';
import { PhoneCall, ShieldAlert, Wifi, Edit, CheckCircle, RefreshCw, Layers, ArrowRightLeft, Radio, Sliders } from 'lucide-react';
import UiModal from './UiModal';

export default function TelephonyTab({ trunks, onUpdateTrunk, searchQuery }) {
  const [selectedTrunk, setSelectedTrunk] = useState(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateInput, setRateInput] = useState('');

  // Primary active carrier state for hot swapping!
  const [primaryCarrier, setPrimaryCarrier] = useState('Android SIM Bridge Engine');

  const filteredTrunks = trunks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const handleRateSubmit = (e) => {
    e.preventDefault();
    onUpdateTrunk(selectedTrunk.id, { ratePerMin: parseFloat(rateInput) || 0 });
    setIsRateModalOpen(false);
    setSelectedTrunk(null);
  };

  const toggleTrunkStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Connected' ? 'Maintenance' : 'Connected';
    onUpdateTrunk(id, { status: nextStatus });
  };

  const handleHotSwapCarrier = (carrierName) => {
    setPrimaryCarrier(carrierName);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Carrier Hot Swap Engine & Call Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Swap Box */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-start justify-between border-b border-brand-border/30 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                <ArrowRightLeft size={16} className="text-indigo-400 mr-2 animate-pulse" />
                Device Gateway Routing & Bridge Failover
              </h4>
              <p className="text-xs text-brand-text/50 mt-0.5">Force outbound telecalling queues to bridge through registered device nodes instantly.</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/15 font-mono font-bold">
              BRIDGE_ROUTER
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            {trunks.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleHotSwapCarrier(t.name)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                  primaryCarrier === t.name
                    ? 'bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-500/10'
                    : 'bg-[#131722]/60 border-brand-border/60 hover:border-brand-border'
                }`}
              >
                {primaryCarrier === t.name && (
                  <span className="absolute top-3 right-3 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
                
                <div>
                  <span className="text-[10px] text-brand-text/50 font-mono font-bold block">{t.provider}</span>
                  <h5 className="text-xs font-bold text-brand-text-bright mt-0.5">{t.name}</h5>
                </div>

                <div className="flex items-center justify-between w-full border-t border-brand-border/30 pt-2 text-[10px] text-brand-text/70">
                  <span className="font-semibold">{primaryCarrier === t.name ? 'PRIMARY' : 'STANDBY'}</span>
                  <span className="font-mono text-cyan-400">${t.ratePerMin}/min</span>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 bg-[#0d111b]/80 border border-brand-border/40 rounded-lg flex items-center justify-between text-xs">
            <span className="text-brand-text flex items-center">
              <Radio size={12} className="mr-1.5 text-emerald-400 animate-pulse" />
              Active Call Signaling Gateway: 
              <strong className="text-brand-text-bright ml-1 font-semibold">{primaryCarrier}</strong>
            </span>
            <span className="text-emerald-400 font-semibold font-mono">0ms Bridge Latency</span>
          </div>
        </div>

        {/* Call Telemetry Card */}
        <div className="glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-brand-text-bright uppercase tracking-wider">WebSocket Gateway Sockets</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="my-4 space-y-3 flex-1 justify-center flex flex-col">
            <div className="flex justify-between items-center bg-[#131722]/50 p-2.5 rounded border border-brand-border/40">
              <span className="text-xs text-brand-text/80">Active Device Bridges</span>
              <span className="text-sm font-bold text-brand-text-bright font-mono">3 / 3</span>
            </div>
            <div className="flex justify-between items-center bg-[#131722]/50 p-2.5 rounded border border-brand-border/40">
              <span className="text-xs text-brand-text/80">Concurrent Sessions</span>
              <span className="text-sm font-bold text-brand-text-bright font-mono">482 / 1000</span>
            </div>
            <div className="flex justify-between items-center bg-[#131722]/50 p-2.5 rounded border border-brand-border/40">
              <span className="text-xs text-brand-text/80">Socket Bandwidth</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">Normal (48.2%)</span>
            </div>
          </div>

          <p className="text-[10px] text-brand-text/40 font-mono text-center border-t border-brand-border/30 pt-2">
            STATION_ID: WS_EDGE_GW_3
          </p>
        </div>
      </div>

      {/* Trunk Connections Directory */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
            Active Mobile Devices & WebSocket Bridge Channels
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Gateway Node Name</th>
                <th className="px-6 py-4">Signaling Engine</th>
                <th className="px-6 py-4">Device Interface</th>
                <th className="px-6 py-4">Carrier Surcharge</th>
                <th className="px-6 py-4">Active Channels</th>
                <th className="px-6 py-4">Bridge Health</th>
                <th className="px-6 py-4 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs">
              {filteredTrunks.map((t) => (
                <tr key={t.id} className="hover:bg-[#131722]/50 transition-colors duration-150">
                  <td className="px-6 py-4 font-semibold text-brand-text-bright">
                    {t.name}
                    <div className="text-[10px] text-brand-text/50 font-normal font-mono mt-0.5">{t.id}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-cyan-400">
                    {t.provider}
                  </td>
                  <td className="px-6 py-4 font-mono text-brand-text/80">
                    {t.phone}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-text-bright">
                    {t.ratePerMin === 0 ? (
                      <span className="text-emerald-400 font-sans font-bold uppercase tracking-wider text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        FREE <span className="text-[9px] text-brand-text/50 font-normal lowercase font-sans">(Native SIM)</span>
                      </span>
                    ) : (
                      <>
                        ${t.ratePerMin} <span className="text-[10px] text-brand-text/40 font-normal">/ min</span>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-brand-text/80">
                    {t.activeChannels} channels
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                      t.status === 'Connected' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      t.status === 'Outage' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.status === 'Connected' ? 'bg-emerald-400' :
                        t.status === 'Outage' ? 'bg-rose-400' :
                        'bg-amber-400'
                      }`} />
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    {/* Edit Rate Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTrunk(t);
                        setRateInput(t.ratePerMin);
                        setIsRateModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-[#1b2030] text-brand-text hover:text-brand-text-bright border border-brand-border/60 hover:border-brand-primary/40 transition-all duration-150"
                      title="Configure Bridge Surcharge"
                    >
                      <Edit size={12} />
                    </button>
                    
                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => toggleTrunkStatus(t.id, t.status)}
                      className={`p-1.5 rounded border transition-all duration-150 ${
                        t.status === 'Connected'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                      title={t.status === 'Connected' ? 'Suspend Bridge Channel' : 'Activate Bridge Channel'}
                    >
                      <Sliders size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Rate Modal */}
      {selectedTrunk && (
        <UiModal isOpen={isRateModalOpen} onClose={() => { setIsRateModalOpen(false); setSelectedTrunk(null); }} title={`Configure Bridge Surcharge: ${selectedTrunk.name}`}>
          <form onSubmit={handleRateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Surcharge Rate Code (USD / minute) *</label>
              <div className="flex rounded-lg overflow-hidden border border-brand-border/80 focus-within:border-indigo-500 transition-colors">
                <span className="bg-[#1b2030] px-3 py-2 text-xs font-mono font-bold text-brand-text/70 border-r border-brand-border/60 flex items-center">
                  $
                </span>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="flex-1 bg-[#090b11] px-3 py-2 text-sm text-brand-text-bright focus:outline-none border-none font-mono"
                />
              </div>
            </div>

            <p className="text-xs text-brand-text/50">
              Modifying the gateway rate card will affect all billing metrics generated for workspaces utilizing this node.
            </p>

            <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => { setIsRateModalOpen(false); setSelectedTrunk(null); }}
                className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer"
              >
                Apply Surcharge
              </button>
            </div>
          </form>
        </UiModal>
      )}
    </div>
  );
}
