import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    MagnifyingGlassIcon,
    UserPlusIcon,
    InformationCircleIcon,
    NoSymbolIcon,
    TrashIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

const MOCK_CONTACTS = [
    { id: 1, name: 'Aysha Younas', phone: '923171706681', addedBy: 'Eon Holding' },
    { id: 2, name: 'Eman', phone: '923171778803', addedBy: 'Eon Holding' },
    { id: 3, name: 'Esha Aftab', phone: '923171706694', addedBy: 'Eon Holding' },
    { id: 4, name: 'Fatima', phone: '923174439074', addedBy: 'Eon Holding' },
    { id: 5, name: 'Fatima', phone: '923171706695', addedBy: 'Eon Holding' },
];

const TeamMemberBlocklist = () => {
    const [activeTab, setActiveTab] = useState('PERSONAL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 font-sans relative">
            {/* Modal Overlay */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800 mx-auto">Add Contact</h3>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            {/* Name Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Name"
                                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] outline-none"
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Phone Number</label>
                                <div className="flex">
                                    <div className="flex items-center gap-2 px-3 py-2 border border-r-0 border-gray-200 rounded-l-md bg-gray-50 min-w-[80px]">
                                        {/* Mock Flag (Pakistan 92 from screenshot) */}
                                        <div className="w-5 h-3.5 bg-green-700 relative overflow-hidden border border-gray-200 flex items-center justify-center">
                                            <div className="w-1 h-3 bg-white absolute left-0"></div>
                                            <span className="text-[6px] text-white">★</span>
                                        </div>
                                        <span className="text-sm text-gray-700">92</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter Phone Number"
                                        className="flex-1 border border-gray-200 rounded-r-md px-3 py-2 text-sm focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 flex justify-center">
                            <button
                                className="px-10 py-2 border border-[#08A698] text-[#08A698] rounded-md font-medium text-sm hover:bg-[#08A698] hover:text-white transition-colors"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Click outside to close */}
                    <div className="absolute inset-0 z-[-1]" onClick={() => setIsAddModalOpen(false)}></div>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div>
                            <div className="flex items-center gap-2 text-gray-800 mb-1">
                                <NoSymbolIcon className="w-6 h-6 text-gray-400" />
                                <h1 className="text-2xl font-bold">Blocklists</h1>
                            </div>
                            <p className="text-gray-500 text-sm ml-8">Organize Your Blocked Contacts</p>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('PERSONAL')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'PERSONAL'
                                        ? 'border-[#08A698] text-[#08A698]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    PERSONAL
                                </button>
                                <button
                                    onClick={() => setActiveTab('ENTERPRISE')}
                                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'ENTERPRISE'
                                        ? 'border-[#08A698] text-[#08A698]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    ENTERPRISE
                                </button>
                            </nav>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-teal-50 text-[#08A698] px-4 py-3 rounded-md flex items-center gap-2 text-sm font-medium italic border border-teal-100">
                            <InformationCircleIcon className="w-5 h-5" />
                            <span>
                                {activeTab === 'PERSONAL'
                                    ? 'Add & manage your personal contacts to avoid syncing'
                                    : 'Add & manage enterprise contacts to avoid syncing across all team members devices'}
                            </span>
                        </div>

                        {/* Search and Add */}
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search by name or number"
                                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#08A698] focus:border-transparent outline-none bg-white"
                                />
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="bg-[#08A698] hover:bg-[#068f82] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors uppercase"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                    Add
                                </button>
                                {activeTab === 'ENTERPRISE' && (
                                    <button
                                        className="bg-[#08A698] hover:bg-[#068f82] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"
                                        onClick={() => setIsAddModalOpen(true)} // Maybe distinct modal later? using same for now
                                    >
                                        Add Teammembers
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Count */}
                        <div className="text-xs text-gray-500 font-medium tracking-wide">
                            {activeTab === 'ENTERPRISE' ? `${MOCK_CONTACTS.length} Contacts found` : '0 Contact found'}
                        </div>

                        {/* Content Area */}
                        {activeTab === 'ENTERPRISE' ? (
                            <div className="space-y-3">
                                {MOCK_CONTACTS.map((contact) => (
                                    <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                        <div>
                                            <h4 className="text-[#08A698] font-bold text-sm">{contact.name}</h4>
                                            <div className="text-gray-600 text-sm font-medium mt-0.5">{contact.phone}</div>
                                            <div className="text-gray-400 text-xs mt-1">Added by {contact.addedBy}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="text-rose-400 hover:text-rose-600 p-1 rounded transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Empty State for Personal */
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <h3 className="text-lg font-bold text-gray-800">No Contact Found</h3>
                                <button
                                    className="bg-[#08A698] hover:bg-[#068f82] text-white px-6 py-2 rounded-md text-sm font-medium shadow transition-colors"
                                    onClick={() => setIsAddModalOpen(true)}
                                >
                                    Add Contact to blocklist
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeamMemberBlocklist;
