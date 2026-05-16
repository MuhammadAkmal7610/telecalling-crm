import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  sparklineData = [], 
  color = 'indigo',
  onClick
}) {
  const isPositive = changeType === 'positive';
  
  // Dynamic color mappings
  const colorStyles = {
    indigo: {
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'hover:border-indigo-500/30',
      glow: 'shadow-indigo-500/5',
      stroke: '#6366f1'
    },
    emerald: {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'hover:border-emerald-500/30',
      glow: 'shadow-emerald-500/5',
      stroke: '#10b981'
    },
    amber: {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'hover:border-amber-500/30',
      glow: 'shadow-amber-500/5',
      stroke: '#f59e0b'
    },
    cyan: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'hover:border-cyan-500/30',
      glow: 'shadow-cyan-500/5',
      stroke: '#06b6d4'
    },
    rose: {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'hover:border-rose-500/30',
      glow: 'shadow-rose-500/5',
      stroke: '#f43f5e'
    }
  };

  const selectedColor = colorStyles[color] || colorStyles.indigo;

  // Generate SVG path for sparkline
  const generateSparklinePath = (data) => {
    if (data.length < 2) return '';
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;
    
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 border border-brand-border/60 transition-all duration-300 ${selectedColor.border} shadow-lg ${selectedColor.glow} ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-medium text-brand-text/80 uppercase tracking-wider">
            {title}
          </span>
          <h4 className="text-2xl font-bold text-brand-text-bright mt-1 tracking-tight font-sans">
            {value}
          </h4>
        </div>
        
        {Icon && (
          <div className={`p-2.5 rounded-lg ${selectedColor.bg} ${selectedColor.text}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between mt-4">
        {/* Change Indicator */}
        <div className="flex items-center space-x-1.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}>
            {isPositive ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
            {change}
          </span>
          <span className="text-xs text-brand-text/50">vs last week</span>
        </div>

        {/* Sparkline Graphic */}
        {sparklineData.length > 0 && (
          <div className="w-24 h-8">
            <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
              <path
                d={generateSparklinePath(sparklineData)}
                fill="none"
                stroke={selectedColor.stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-80"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
