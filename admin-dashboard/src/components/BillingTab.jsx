import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  Key, 
  Calendar, 
  Tag, 
  ShieldCheck,
  Award
} from 'lucide-react';
import UiModal from './UiModal';

export default function BillingTab({ 
  plans, 
  licenseKeys, 
  organizations, 
  onUpdateOrganization, 
  onUpdatePlan, 
  onCreatePlan, 
  searchQuery 
}) {
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [newPlan, setNewPlan] = useState({
    name: '',
    price: '',
    callingMinutes: 5000,
    whatsappLimit: 10000,
    seats: 5,
    status: 'Active'
  });

  // Billing override states
  const [overrideOrgId, setOverrideOrgId] = useState(organizations[0]?.id || '');
  const [overrideAction, setOverrideAction] = useState('refund');
  const [overrideAmount, setOverrideAmount] = useState('50');
  const [overrideNotes, setOverrideNotes] = useState('');

  const handleCreatePlan = (e) => {
    e.preventDefault();
    onCreatePlan({
      ...newPlan,
      id: `plan-${Date.now()}`,
      price: parseFloat(newPlan.price) || 0
    });
    setNewPlan({
      name: '',
      price: '',
      callingMinutes: 5000,
      whatsappLimit: 10000,
      seats: 5,
      status: 'Active'
    });
    setIsNewPlanModalOpen(false);
  };

  const handleEditPlan = (e) => {
    e.preventDefault();
    onUpdatePlan(editingPlan.id, {
      ...editingPlan,
      price: parseFloat(editingPlan.price) || 0
    });
    setIsEditPlanModalOpen(false);
    setEditingPlan(null);
  };

  const handleExecuteOverride = (e) => {
    e.preventDefault();
    if (!overrideOrgId || !overrideAmount || !overrideNotes) return;

    const org = organizations.find(o => o.id === overrideOrgId);
    if (!org) return;

    const val = parseInt(overrideAmount) || 0;
    let updateFields = {};
    let alertMsg = '';

    if (overrideAction === 'refund') {
      alertMsg = `SUCCESSFUL REFUND OVERRIDE!\n\nIssued a manual credit refund of $${val} to ${org.name}.\nStripe Customer ID: ${org.stripeCustomerId}\nReason: "${overrideNotes}"`;
    } else if (overrideAction === 'bonus_seats') {
      const nextQuota = org.usersQuota + val;
      updateFields = { usersQuota: nextQuota };
      alertMsg = `SUCCESSFUL SEATS OVERRIDE!\n\nGranted ${val} bonus user seats to ${org.name}.\nNew Total Users Quota: ${nextQuota} seats.\nReason: "${overrideNotes}"`;
    } else if (overrideAction === 'extend_trial') {
      alertMsg = `SUCCESSFUL TRIAL OVERRIDE!\n\nExtended the trial period for ${org.name} by ${val} days.\nSubscription limits set to active.\nReason: "${overrideNotes}"`;
    } else if (overrideAction === 'settle_invoice') {
      updateFields = { stripeSync: 'Synced' };
      alertMsg = `SUCCESSFUL INVOICE OVERRIDE!\n\nForce-settled outstanding invoice of $${val} for ${org.name}.\nStripe balance synchronized.\nReason: "${overrideNotes}"`;
    }

    if (Object.keys(updateFields).length > 0) {
      onUpdateOrganization(org.id, updateFields);
    }

    alert(alertMsg);
    setOverrideAmount('50');
    setOverrideNotes('');
  };

  // Custom mock financial revenue path coordinates for SVG Chart
  const chartPoints = [24, 28, 31, 45, 52, 67, 82];
  const chartLabels = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  
  const generateChartPath = (data) => {
    const width = 600;
    const height = 140;
    const max = 100; // max scale 100k
    
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (val / max) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const generateAreaPath = (data) => {
    const width = 600;
    const height = 140;
    const max = 100;
    const linePath = generateChartPath(data);
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      
      {/* Financial KPIs and SVG Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Area Chart Card */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-brand-border/60 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
                <TrendingUp size={16} className="text-indigo-400 mr-2 animate-bounce" />
                Monthly Recurring Revenue Growth (MRR)
              </h4>
              <p className="text-xs text-brand-text/50">Simulated subscription telemetry logs across active nodes</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/15 font-mono font-bold">
              +34.2% MoM
            </span>
          </div>

          {/* SVG Visual graph */}
          <div className="w-full h-36 mt-2 relative">
            <svg viewBox="0 0 600 140" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35"/>
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Horizontal grid lines */}
              <line x1="0" y1="35" x2="600" y2="35" stroke="#1f293d" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="70" x2="600" y2="70" stroke="#1f293d" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="0" y1="105" x2="600" y2="105" stroke="#1f293d" strokeWidth="0.5" strokeDasharray="3 3" />

              {/* Grid Label */}
              <text x="590" y="30" fill="#94a3b8" fontSize="8" textAnchor="end" className="opacity-40">100k</text>
              <text x="590" y="65" fill="#94a3b8" fontSize="8" textAnchor="end" className="opacity-40">50k</text>
              <text x="590" y="100" fill="#94a3b8" fontSize="8" textAnchor="end" className="opacity-40">25k</text>

              {/* Area path fill */}
              <path
                d={generateAreaPath(chartPoints)}
                fill="url(#chartGradient)"
              />

              {/* Stroke line path */}
              <path
                d={generateChartPath(chartPoints)}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_4px_10px_rgba(99,102,241,0.5)]"
              />

              {/* Highlight dot for newest point */}
              <circle
                cx="600"
                cy={140 - (82 / 100) * 140}
                r="5"
                fill="#06b6d4"
                stroke="#090b11"
                strokeWidth="2"
                className="animate-ping"
              />
              <circle
                cx="600"
                cy={140 - (82 / 100) * 140}
                r="4"
                fill="#6366f1"
                stroke="#fff"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="flex justify-between mt-3 text-[10px] font-mono text-brand-text/50 px-2">
            {chartLabels.map((lbl, i) => (
              <span key={i}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* Financial KPI stats and Overrides panel */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel rounded-xl p-3.5 border border-brand-border/60 shadow-lg flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <DollarSign size={16} />
              </div>
              <div>
                <p className="text-[10px] text-brand-text/60 font-semibold uppercase tracking-wider">Estimated MRR</p>
                <h3 className="text-base font-bold text-brand-text-bright font-sans mt-0.5">$82,450</h3>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-3.5 border border-brand-border/60 shadow-lg flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Key size={16} />
              </div>
              <div>
                <p className="text-[10px] text-brand-text/60 font-semibold uppercase tracking-wider">Active Keys</p>
                <h3 className="text-base font-bold text-brand-text-bright font-sans mt-0.5">{licenseKeys.length} keys</h3>
              </div>
            </div>
          </div>

          {/* Manual Billing Overrides Panel */}
          <div className="glass-panel rounded-xl p-4.5 border border-brand-border/60 shadow-lg">
            <div className="flex items-center justify-between border-b border-brand-border/40 pb-2 mb-3">
              <span className="text-xs font-bold text-brand-text-bright uppercase tracking-wider flex items-center">
                <Award size={14} className="text-cyan-400 mr-1" /> Audited Billing Overrides
              </span>
              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/15 font-mono font-bold">
                OWNER_CREDITS
              </span>
            </div>

            <form onSubmit={handleExecuteOverride} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-brand-text/60 font-semibold mb-0.5">Target Organization</label>
                <select
                  value={overrideOrgId}
                  onChange={(e) => setOverrideOrgId(e.target.value)}
                  className="w-full bg-[#131722]/85 border border-brand-border/80 rounded px-2 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-cyan-500 font-sans"
                >
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-brand-text/60 font-semibold mb-0.5">Action</label>
                  <select
                    value={overrideAction}
                    onChange={(e) => setOverrideAction(e.target.value)}
                    className="w-full bg-[#131722]/85 border border-brand-border/80 rounded px-2 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-cyan-500"
                  >
                    <option value="refund">Credit Refund ($)</option>
                    <option value="bonus_seats">Grant Bonus Seats</option>
                    <option value="extend_trial">Extend Trial (Days)</option>
                    <option value="settle_invoice">Settle Invoice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-brand-text/60 font-semibold mb-0.5">Adjustment Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={overrideAmount}
                    onChange={(e) => setOverrideAmount(e.target.value)}
                    placeholder="50"
                    className="w-full bg-[#090b11] border border-brand-border/80 rounded px-2.5 py-1 text-xs text-brand-text-bright focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-brand-text/60 font-semibold mb-0.5">Audit Reason / Notes *</label>
                <input
                  type="text"
                  required
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  placeholder="Special client loyalty compensation..."
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded px-2.5 py-1 text-[11px] text-brand-text-bright focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] py-1.5 rounded-md shadow active:scale-95 transition-all cursor-pointer text-center"
              >
                Execute audited adjustment
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Subscription Plans & Pricing Layout */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase">
              Subscription Tiers & Rate Boundaries
            </h4>
            <p className="text-xs text-brand-text/50">Manage default tiers assigned during client workspace provisioning</p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewPlanModalOpen(true)}
            className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={12} />
            <span>Create Plan</span>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="relative bg-[#131722]/60 border border-brand-border/70 rounded-xl p-5 flex flex-col justify-between hover:border-brand-primary/40 transition-all duration-200">
              {p.name === 'Enterprise' && (
                <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-400/30 font-mono">
                  FLAGSHIP
                </span>
              )}
              
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-brand-text-bright font-sans">{p.name}</h5>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
                
                <div className="my-4 flex items-baseline">
                  <span className="text-3xl font-extrabold text-brand-text-bright tracking-tight">${p.price}</span>
                  <span className="text-brand-text/50 text-xs ml-1 font-sans">/month</span>
                </div>

                <ul className="space-y-2 border-t border-brand-border/50 pt-4 mb-6 text-xs text-brand-text/80 font-sans">
                  <li className="flex justify-between">
                    <span>Calling Credit Limits:</span>
                    <span className="font-mono font-bold text-brand-text-bright">{p.callingMinutes.toLocaleString()} min</span>
                  </li>
                  <li className="flex justify-between">
                    <span>WhatsApp Sending Limit:</span>
                    <span className="font-mono font-bold text-brand-text-bright">{p.whatsappLimit.toLocaleString()} msg</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Provisioned Team Seats:</span>
                    <span className="font-mono font-bold text-brand-text-bright">{p.seats} Seats</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingPlan(p);
                  setIsEditPlanModalOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-1.5 bg-[#1b2030] hover:bg-brand-border/70 border border-brand-border text-brand-text-bright text-xs py-2 rounded-lg transition-all cursor-pointer font-sans"
              >
                <Edit size={12} />
                <span>Configure Boundaries</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Licensing Database */}
      <div className="glass-panel rounded-xl border border-brand-border/60 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-brand-border/40 bg-[#161c2c]/40 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-brand-text-bright tracking-wider uppercase flex items-center">
            <Key size={14} className="text-cyan-400 mr-2" /> Live License Activation Keys
          </h4>
          <span className="text-xs text-brand-text/50 font-mono">ENCRYPTED_DB</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border/50 text-[10px] uppercase font-mono font-bold text-brand-text/50 tracking-wider bg-[#0d111b]/40">
                <th className="px-6 py-4">Serial Key</th>
                <th className="px-6 py-4">Assigned Workspace</th>
                <th className="px-6 py-4">Key Level</th>
                <th className="px-6 py-4">Activation Date</th>
                <th className="px-6 py-4 text-right">Licensing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
              {licenseKeys.map((k) => (
                <tr key={k.key} className="hover:bg-[#131722]/50 transition-colors duration-150">
                  <td className="px-6 py-4 text-cyan-400 font-bold tracking-wider select-all">
                    {k.key}
                  </td>
                  <td className="px-6 py-4 font-sans text-brand-text/80">
                    {k.workspace}
                  </td>
                  <td className="px-6 py-4 font-sans text-brand-text/80">
                    {k.plan}
                  </td>
                  <td className="px-6 py-4 text-brand-text/60">
                    {k.issueDate}
                  </td>
                  <td className="px-6 py-4 font-sans text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold gap-1 ${
                      k.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${k.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {k.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Plan Modal */}
      <UiModal isOpen={isNewPlanModalOpen} onClose={() => setIsNewPlanModalOpen(false)} title="Create New Subscription Tier">
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Plan Tier Name *</label>
            <input
              type="text"
              required
              value={newPlan.name}
              onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
              placeholder="E.g. Pro Suite, Unlimited Pack"
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Monthly Pricing (USD) *</label>
            <div className="flex rounded-lg overflow-hidden border border-brand-border/80 focus-within:border-indigo-500 transition-colors">
              <span className="bg-[#1b2030] px-3 py-2 text-xs font-mono font-bold text-brand-text/70 border-r border-brand-border/60 flex items-center">
                $
              </span>
              <input
                type="number"
                required
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: e.target.value})}
                placeholder="99"
                className="flex-1 bg-[#090b11] px-3 py-2 text-sm text-brand-text-bright focus:outline-none border-none font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Calling Allowance (Mins)</label>
              <input
                type="number"
                value={newPlan.callingMinutes}
                onChange={(e) => setNewPlan({...newPlan, callingMinutes: parseInt(e.target.value) || 0})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">WhatsApp Campaign Message Credits</label>
              <input
                type="number"
                value={newPlan.whatsappLimit}
                onChange={(e) => setNewPlan({...newPlan, whatsappLimit: parseInt(e.target.value) || 0})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-text/80 mb-1">Allocated Workspace Seats</label>
            <input
              type="number"
              value={newPlan.seats}
              onChange={(e) => setNewPlan({...newPlan, seats: parseInt(e.target.value) || 1})}
              className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
            <button
              type="button"
              onClick={() => setIsNewPlanModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer font-sans"
            >
              Provision Tier
            </button>
          </div>
        </form>
      </UiModal>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <UiModal isOpen={isEditPlanModalOpen} onClose={() => { setIsEditPlanModalOpen(false); setEditingPlan(null); }} title={`Modify Tier: ${editingPlan.name}`}>
          <form onSubmit={handleEditPlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Monthly Pricing (USD) *</label>
              <div className="flex rounded-lg overflow-hidden border border-brand-border/80 focus-within:border-indigo-500 transition-colors">
                <span className="bg-[#1b2030] px-3 py-2 text-xs font-mono font-bold text-brand-text/70 border-r border-brand-border/60 flex items-center">
                  $
                </span>
                <input
                  type="number"
                  required
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({...editingPlan, price: e.target.value})}
                  className="flex-1 bg-[#090b11] px-3 py-2 text-sm text-brand-text-bright focus:outline-none border-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">Calling Allowance (Mins)</label>
                <input
                  type="number"
                  value={editingPlan.callingMinutes}
                  onChange={(e) => setEditingPlan({...editingPlan, callingMinutes: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text/80 mb-1">WhatsApp Campaign Limits</label>
                <input
                  type="number"
                  value={editingPlan.whatsappLimit}
                  onChange={(e) => setEditingPlan({...editingPlan, whatsappLimit: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Team Seat Boundaries</label>
              <input
                type="number"
                value={editingPlan.seats}
                onChange={(e) => setEditingPlan({...editingPlan, seats: parseInt(e.target.value) || 1})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text/80 mb-1">Tier Status</label>
              <select
                value={editingPlan.status}
                onChange={(e) => setEditingPlan({...editingPlan, status: e.target.value})}
                className="w-full bg-[#090b11] border border-brand-border/80 rounded-lg px-3 py-2 text-sm text-brand-text-bright focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => { setIsEditPlanModalOpen(false); setEditingPlan(null); }}
                className="px-4 py-2 text-xs font-semibold text-brand-text hover:text-brand-text-bright bg-[#131722] hover:bg-[#1b2030] rounded-lg border border-brand-border/60 transition-all cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg hover:shadow-indigo-500/15 transition-all cursor-pointer font-sans"
              >
                Apply Boundaries
              </button>
            </div>
          </form>
        </UiModal>
      )}
    </div>
  );
}
