import React from 'react';
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function DashboardCard({
  icon: Icon,
  title,
  manageLink,
  onAdd,
  onManage,
  headerDate = 'Today',
  children,
  className = '',
  headerRight
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:border-teal-100 ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/80">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-teal-50 to-white rounded-lg border border-teal-50 text-[#08A698] shadow-sm">
            {Icon ? <Icon className="w-5 h-5" /> : null}
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-800 leading-none">{title}</h3>
            {manageLink ? (
              <span
                className="text-[10px] font-semibold text-[#08A698] cursor-pointer hover:underline border-l border-gray-300 pl-2 leading-none hover:text-teal-700 transition-colors"
                onClick={onManage}
              >
                Manage
              </span>
            ) : null}
            {onAdd ? (
              <span
                className="text-[10px] font-semibold text-[#08A698] cursor-pointer hover:underline border-l border-gray-300 pl-2 leading-none hover:text-teal-700 transition-colors"
                onClick={onAdd}
              >
                + Add
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {headerRight || (
            <>
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                {headerDate}
                <ChevronDownIcon className="w-3 h-3 text-gray-400 ml-0.5" />
              </button>
              <button className="text-gray-300 hover:text-gray-500 transition-colors p-1 hover:bg-gray-50 rounded" onClick={onManage}>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0 p-5 space-y-4 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
