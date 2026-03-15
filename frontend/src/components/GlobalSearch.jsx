import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, User, Phone, Mail, CheckCircle, 
  Flag, Calendar, Users, Zap, ArrowRight 
} from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ leads: [], users: [], tasks: [], campaigns: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ leads: [], users: [], tasks: [], campaigns: [] });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults({ leads: [], users: [], tasks: [], campaigns: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/search/global?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const flattenResults = () => {
    const flattened = [];
    results.leads.forEach(item => flattened.push({ ...item, type: 'lead' }));
    results.users.forEach(item => flattened.push({ ...item, type: 'user' }));
    results.tasks.forEach(item => flattened.push({ ...item, type: 'task' }));
    results.campaigns.forEach(item => flattened.push({ ...item, type: 'campaign' }));
    return flattened;
  };

  const handleKeyDown = (e) => {
    const flattened = flattenResults();
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < flattened.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && flattened[selectedIndex]) {
      handleNavigate(flattened[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleNavigate = (item) => {
    onClose();
    switch (item.type) {
      case 'lead': navigate(`/lead-details/${item.id}`); break;
      case 'user': navigate(`/users`); break;
      case 'task': navigate(`/all-tasks`); break;
      case 'campaign': navigate(`/campaigns`); break;
      default: break;
    }
  };

  if (!isOpen) return null;

  const flattened = flattenResults();

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto p-4 sm:p-6 md:p-20" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" aria-hidden="true" onClick={onClose}></div>

      <div className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search leads, users, tasks..."
            role="combobox"
            aria-expanded="false"
            aria-controls="options"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {(query.length >= 2 || loading) && (
          <div className="max-h-96 scroll-py-3 overflow-y-auto p-3" id="options" role="listbox">
            {loading && query.length >= 2 && (
              <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
            )}

            {!loading && flattened.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">No results found for "{query}"</div>
            )}

            {Object.entries(results).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} className="mb-4 last:mb-0">
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    {category}
                  </h3>
                  <ul className="space-y-1">
                    {items.map((item) => {
                      const absoluteIndex = flattened.findIndex(f => f.id === item.id && f.type.startsWith(category.slice(0, -1)));
                      const isSelected = selectedIndex === absoluteIndex;
                      
                      return (
                        <li
                          key={item.id}
                          className={`group flex cursor-default select-none items-center rounded-md px-3 py-2 ${
                            isSelected ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => handleNavigate({ ...item, type: category.slice(0, -1) })}
                          onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                        >
                          {category === 'leads' && <User className={`h-5 w-5 flex-none ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                          {category === 'users' && <Users className={`h-5 w-5 flex-none ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                          {category === 'tasks' && <CheckCircle className={`h-5 w-5 flex-none ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                          {category === 'campaigns' && <Zap className={`h-5 w-5 flex-none ${isSelected ? 'text-white' : 'text-gray-400'}`} />}
                          
                          <div className="ml-3 flex-auto">
                            <p className="text-sm font-medium">{item.name || item.title}</p>
                            <p className={`text-xs ${isSelected ? 'text-teal-100' : 'text-gray-500'}`}>
                              {item.email || item.phone || item.status}
                            </p>
                          </div>
                          {isSelected && <ArrowRight className="ml-3 h-5 w-5 flex-none text-white" />}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center bg-gray-50 px-4 py-2.5 text-xs text-gray-700">
          <kbd className={`mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold shadow-sm ${query ? 'text-teal-600' : 'text-gray-400'}`}>
            ↵
          </kbd>{' '}
          to select
          <kbd className="mx-1 flex h-5 w-8 items-center justify-center rounded border bg-white font-semibold text-gray-400 shadow-sm">
            esc
          </kbd>{' '}
          to close
          <div className="ml-auto flex items-center">
            <span className="text-gray-400">Shortcut:</span>
            <kbd className="mx-1 flex h-5 w-12 items-center justify-center rounded border bg-white font-semibold text-teal-600 shadow-sm">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
