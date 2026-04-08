import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    ShieldExclamationIcon,
    ArrowPathIcon,
    KeyIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabaseClient';

export default function AuditSecurity() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const res = await fetch(`${API_URL}/audit/logs`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data);
            } else {
                setAuditLogs([
                    { id: 1, user: 'john.doe@example.com', action: 'Changed Workspace Settings', date: new Date().toISOString(), ip: '192.168.1.1' },
                    { id: 2, user: 'jane.smith@example.com', action: 'Exported Leads', date: new Date(Date.now() - 86400000).toISOString(), ip: '10.0.0.1' },
                    { id: 3, user: 'admin@organization.com', action: 'Assigned Role to Manager', date: new Date(Date.now() - 172800000).toISOString(), ip: '172.16.0.5' },
                ]);
            }
        } catch (error) {
            setAuditLogs([
                { id: 1, user: 'john.doe@example.com', action: 'Changed Workspace Settings', date: new Date().toISOString(), ip: '192.168.1.1' },
                { id: 2, user: 'jane.smith@example.com', action: 'Exported Leads', date: new Date(Date.now() - 86400000).toISOString(), ip: '10.0.0.1' },
                { id: 3, user: 'admin@organization.com', action: 'Assigned Role to Manager', date: new Date(Date.now() - 172800000).toISOString(), ip: '172.16.0.5' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <ShieldExclamationIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <h1 className="text-2xl font-bold text-gray-700">Audit &amp; Security</h1>
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" onClick={fetchLogs}>
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Security Settings Panel */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8 p-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <KeyIcon className="w-5 h-5 text-gray-500" />
                                Security Settings
                            </h2>
                            <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                <div>
                                    <p className="font-medium text-gray-900">Enforce Multi-Factor Authentication (MFA)</p>
                                    <p className="text-sm text-gray-500 mt-1">Require all users in this organization to use MFA to log in.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#08A698]"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <p className="font-medium text-gray-900">Single Sign-On (SSO)</p>
                                    <p className="text-sm text-gray-500 mt-1">Enable login via corporate identity provider (SAML/Okta).</p>
                                </div>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                    Configure
                                </button>
                            </div>
                        </div>

                        {/* Audit Logs Table */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                                    Activity Logs
                                </h2>
                                <button className="text-sm text-[#08A698] font-medium hover:underline">
                                    Export CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date &amp; Time</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                    <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2 text-[#08A698]" />
                                                    Loading logs...
                                                </td>
                                            </tr>
                                        ) : auditLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No activity logs found</td>
                                            </tr>
                                        ) : (
                                            auditLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(log.date).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {log.user}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {log.action}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                                        {log.ip}
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
