import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function TableHeader({ columns }) {
  return (
    <thead className="sticky top-0 bg-gray-50/50 z-10 border-b border-gray-100">
      <tr>
        {columns.map((col, idx) => (
          <th
            key={idx}
            className={`pb-4 pt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.align === 'center' ? 'text-center' : 'text-left'} ${col.width || ''}`}
          >
            <div className={`flex items-center gap-1 ${col.align === 'center' ? 'justify-center' : ''} cursor-pointer hover:text-gray-700 transition-colors`}>
              {col.label} {col.sortable !== false ? <ChevronDownIcon className="w-3 h-3 text-gray-400" /> : null}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}
