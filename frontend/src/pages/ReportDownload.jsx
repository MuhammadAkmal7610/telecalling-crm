import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import {
    ArrowDownTrayIcon,
    FunnelIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function ReportDownload() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const res = await fetch(`${API_URL}/reports/history`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = activeTab === 'All'
        ? reports
        : reports.filter(r => r.type.toLowerCase().includes(activeTab.toLowerCase()));

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/30">
                    <div className="mx-auto max-w-7xl">

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Report Downloads</h1>
                                <button
                                    onClick={fetchReports}
                                    className="p-1.5 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-[#08A698] transition-all"
                                    disabled={loading}
                                >
                                    <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="flex gap-4 p-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
                                {['All', 'Leads', 'Tasks', 'Calls', 'Sales'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#08A698] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <th className="px-6 py-5">Report Details</th>
                                            <th className="px-6 py-5">Type / Filter</th>
                                            <th className="px-6 py-5">Status</th>
                                            <th className="px-6 py-5">Completed On</th>
                                            <th className="px-6 py-5">Created By</th>
                                            <th className="px-6 py-5 text-right">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center text-gray-400 italic font-medium">Loading report history...</td>
                                            </tr>
                                        ) : filteredReports.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                            <ArrowDownTrayIcon className="w-8 h-8 text-gray-200" />
                                                        </div>
                                                        <p className="text-gray-400 italic">No reports found for this category</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredReports.map((report) => (
                                            <tr key={report.id} className="hover:bg-teal-50/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-[#08A698] transition-colors">
                                                            <ArrowDownTrayIcon className="w-5 h-5 text-[#08A698] group-hover:text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{report.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{report.size || '0 KB'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-wider border border-gray-200">{report.type}</span>
                                                        <FunnelIcon className="w-3.5 h-3.5 text-gray-300" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${report.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-gray-500 font-bold">
                                                    {new Date(report.created_at).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center text-[10px] font-black text-[#08A698] border-2 border-white shadow-sm">
                                                            {report.creator?.name?.substring(0, 2).toUpperCase() || 'AD'}
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-600">{report.creator?.name || 'Admin'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-[#08A698] rounded-xl text-gray-400 hover:text-white transition-all border border-transparent hover:shadow-lg hover:shadow-teal-100 transform active:scale-95 group/btn">
                                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-teal-50/50 rounded-2xl border border-teal-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                    <FunnelIcon className="w-6 h-6 text-[#08A698]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-teal-900">Need specific data?</h4>
                                    <p className="text-xs text-teal-700">You can generate custom reports with advanced filters from any lead or task page.</p>
                                </div>
                            </div>
                            <button className="px-6 py-2.5 bg-[#08A698] text-white text-xs font-bold rounded-xl hover:bg-teal-700 shadow-md transition-all transform active:scale-95">
                                Create New Report
                            </button>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
