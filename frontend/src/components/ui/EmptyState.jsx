import React from 'react';

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
      {Icon ? (
        <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center">
          <Icon className="w-7 h-7 text-[#08A698]" />
        </div>
      ) : null}
      {title ? <div className="text-base font-bold text-gray-900">{title}</div> : null}
      {subtitle ? <div className="text-sm text-gray-500 max-w-xs">{subtitle}</div> : null}
      {actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 bg-[#08A698] text-white rounded-lg text-sm font-semibold hover:bg-[#078F82] transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
