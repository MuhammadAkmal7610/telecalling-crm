import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    UserGroupIcon, IdentificationIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon, UserIcon
} from '@heroicons/react/24/outline';

export default function Filters() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const filterLinks = [
        { name: 'All Leads', icon: UserGroupIcon, path: '/all-leads', description: 'View and manage all leads across the system.' },
        { name: 'Leads Assigned to me', icon: UserIcon, path: '/assigned-leads', description: 'Leads explicitly assigned to your user account.' },
        { name: 'My Leads', icon: IdentificationIcon, path: '/my-leads', description: 'Leads you have created or claimed.' },
        { name: 'Daily Report', icon: ClipboardDocumentCheckIcon, path: '/daily-report', description: 'Daily summary and filtering of tasks and leads.' },
        { name: 'Incoming Whatsapp Leads', icon: ChatBubbleLeftRightIcon, path: '/whatsapp-leads', description: 'Leads generated from WhatsApp integration.' },
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900">Filters</h1>
                            <p className="text-gray-500 mt-1">Access specific lead segments and daily filtering views.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filterLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className="group flex flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 rounded-lg bg-teal-50 text-[#08A698] group-hover:bg-[#08A698] group-hover:text-white transition-colors duration-200">
                                            <link.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#08A698] transition-colors">{link.name}</h3>
                                    </div>
                                    <p className="text-gray-500 text-sm flex-1">{link.description}</p>
                                    <div className="mt-4 flex items-center text-sm font-medium text-[#08A698] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        View Page &rarr;
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
