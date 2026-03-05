import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ placeholder = 'Search...' }) {
  return (
    <div className="relative group">
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#08A698] transition-colors" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#08A698] focus:border-[#08A698] outline-none transition-all placeholder:text-gray-400 hover:bg-white focus:bg-white"
      />
    </div>
  );
}
