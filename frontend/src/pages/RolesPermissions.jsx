import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    ShieldCheckIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowPathIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

export default function RolesPermissions() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/roles`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRoles(data);
            } else {
                // Mock data if backend not ready
                setRoles([
                    { id: '1', name: 'Admin', type: 'System', description: 'Full access', usersCount: 2, updatedAt: new Date().toISOString() },
                    { id: '2', name: 'Manager', type: 'System', description: 'Can manage teams and leads', usersCount: 5, updatedAt: new Date().toISOString() },
                    { id: '3', name: 'Caller', type: 'System', description: 'Can make calls and update leads', usersCount: 20, updatedAt: new Date().toISOString() },
                ]);
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            setRoles([
                { id: '1', name: 'Admin', type: 'System', description: 'Full access', usersCount: 2, updatedAt: new Date().toISOString() },
                { id: '2', name: 'Manager', type: 'System', description: 'Can manage teams and leads', usersCount: 5, updatedAt: new Date().toISOString() },
                { id: '3', name: 'Caller', type: 'System', description: 'Can make calls and update leads', usersCount: 20, updatedAt: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = roles.filter(role => role.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <h1 className="text-2xl font-bold text-gray-700">Roles &amp; Permissions</h1>
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" onClick={fetchRoles}>
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                className="flex items-center justify-center gap-2 bg-[#08A698] hover:bg-[#079186] text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm active:scale-95"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Create Custom Role
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <div className="relative max-w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search roles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] sm:text-sm transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Users</th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#08A698]" />
                                                    Loading roles...
                                                </td>
                                            </tr>
                                        ) : filteredRoles.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No roles found</td>
                                            </tr>
                                        ) : (
                                            filteredRoles.map((role) => (
                                                <tr key={role.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">{role.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.type === 'System' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                            {role.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {role.description}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 font-medium">
                                                        {role.usersCount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button className="p-1.5 text-gray-400 hover:text-[#08A698] hover:bg-[#08A698]/5 rounded-md transition-colors border border-gray-200">
                                                                <PencilSquareIcon className="w-4 h-4" />
                                                            </button>
                                                            {role.type !== 'System' && (
                                                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-gray-200">
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
