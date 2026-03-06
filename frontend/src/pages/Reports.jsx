import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AdvancedReporting from '../components/AdvancedReporting';
import WorkspaceGuard from '../components/WorkspaceGuard';
import { usePermission } from '../hooks/usePermission';
import {
    TrophyIcon, PhoneIcon, ArrowDownTrayIcon, DocumentDuplicateIcon,
    ChartPieIcon, PresentationChartBarIcon, UserGroupIcon,
    ArrowTrendingUpIcon, ClipboardDocumentCheckIcon, ClockIcon,
    LockClosedIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Reports() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { can, isAdmin, isRoot } = usePermission();

    const workspaceReports = [
        { name: 'Advanced Analytics', icon: ChartBarIcon, path: '/reports', description: 'Comprehensive analytics with custom reports and insights.', badge: 'New' },
        { name: 'Leaderboard', icon: TrophyIcon, path: '/leaderboard', description: 'See top performing agents and compare sales metrics.' },
        { name: 'Call Report', icon: PhoneIcon, path: '/call-report', description: 'Detailed logs and analytics of all calls made.' },
        { name: 'Conversion Rate', icon: ArrowTrendingUpIcon, path: '/reports', description: 'Total leads vs Won leads analysis and rates.', badge: 'New' },
        { name: 'Agent Performance', icon: UserGroupIcon, path: '/reports', description: 'Breakdown of activity and sales per agent.', badge: 'New' },
        { name: 'Daily Follow-ups', icon: ClipboardDocumentCheckIcon, path: '/daily-report', description: 'Summary of follow-up tasks due today.' },
    ];

    const orgReports = [
        { name: 'Combined Analytics', icon: ChartPieIcon, path: '/reports', description: 'Aggregated stats across all workspaces.', permission: 'manage_users' },
        { name: 'Revenue Analytics', icon: PresentationChartBarIcon, path: '/reports', description: 'Monthly revenue trends and forecasts.', permission: 'manage_users' },
        { name: 'User Activity Logs', icon: ClockIcon, path: '/reports', description: 'Audit trail of user actions across the org.', permission: 'manage_users' },
        { name: 'Report Download', icon: ArrowDownTrayIcon, path: '/report-download', description: 'Export your data into CSV or Excel formats.' },
        { name: 'All Duplicates', icon: DocumentDuplicateIcon, path: '/all-duplicates', description: 'Identify and merge duplicated leads in the system.' },
    ];

    const ReportCard = ({ link }) => {
        const hasAccess = !link.permission || can(link.permission);

        return (
            <Link
                key={link.name}
                to={hasAccess ? link.path : '#'}
                onClick={(e) => !hasAccess && e.preventDefault()}
                className={`group flex flex-col bg-white p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${hasAccess
                        ? 'border-gray-200 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 hover:border-teal-200 hover:-translate-y-1'
                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed grayscale'
                    }`}
            >
                {!hasAccess && (
                    <div className="absolute top-3 right-3">
                        <LockClosedIcon className="w-4 h-4 text-gray-400" />
                    </div>
                )}
                {link.badge && (
                    <div className="absolute top-0 right-0">
                        <div className="bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                            {link.badge}
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${hasAccess
                            ? 'bg-teal-50 text-[#08A698] group-hover:bg-[#08A698] group-hover:text-white group-hover:scale-110'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                        <link.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`text-lg font-bold transition-colors ${hasAccess ? 'text-gray-900 group-hover:text-[#08A698]' : 'text-gray-400'
                        }`}>{link.name}</h3>
                </div>
                <p className="text-gray-500 text-sm flex-1 leading-relaxed">{link.description}</p>
                <div className={`mt-6 flex items-center text-sm font-bold transition-all duration-300 ${hasAccess ? 'text-[#08A698] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0' : 'opacity-0'
                    }`}>
                    Explore Report &rarr;
                </div>
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-10">
                    <WorkspaceGuard>
                        <div className="max-w-7xl mx-auto space-y-12">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Analytics & Reports</h1>
                                <p className="text-gray-500 mt-2 text-lg">Comprehensive insights across your workspaces and organization.</p>
                            </div>

                            {/* Workspace Section */}
                            <section>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1.5 bg-[#08A698] rounded-full"></div>
                                    <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest text-sm">Workspace Insights</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {workspaceReports.map((link) => (
                                        <ReportCard key={link.name} link={link} />
                                    ))}
                                </div>
                            </section>

                            {/* Org Section */}
                            <section className="pt-4 border-t border-gray-200/60">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-8 w-1.5 bg-indigo-500 rounded-full"></div>
                                    <h2 className="text-xl font-extrabold text-gray-800 uppercase tracking-widest text-sm">Organization Intelligence</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {orgReports.map((link) => (
                                        <ReportCard key={link.name} link={link} />
                                    ))}
                                </div>
                            </section>
                        </div>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
