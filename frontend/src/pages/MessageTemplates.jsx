import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    ChatBubbleOvalLeftEllipsisIcon,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    PlusIcon,
    TrashIcon,
    ShareIcon,
    XMarkIcon,
    ArrowUpTrayIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    PhoneIcon,
    EllipsisHorizontalIcon,
    CalendarDaysIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import { FolderIcon } from '@heroicons/react/24/solid'; // Save icon replacement

const MessageTemplates = () => {
    // State
    const [activeTab, setActiveTab] = useState('whatsapp');
    const [templates, setTemplates] = useState([
        { id: 1, type: 'whatsapp', shortcut: 'default', content: 'Hi This is {{MY NAME}} from {{MY COMPANY NAME}}...' }
    ]);
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

    // Popover States
    const [activeShareTemplateId, setActiveShareTemplateId] = useState(null);
    const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
    const [isValuesPopoverOpen, setIsValuesPopoverOpen] = useState(false);
    const [variableSearchTerm, setVariableSearchTerm] = useState('');

    // Mock Team Members
    const TEAM_MEMBERS = [
        { id: 1, name: 'Esha Aftab', initials: 'EA', color: 'bg-[#08A698]/10 text-[#08A698]' },
        { id: 2, name: 'Minahil', initials: 'MI', color: 'bg-[#08A698]/10 text-[#08A698]' },
        { id: 3, name: 'Masfa', initials: 'MA', color: 'bg-[#08A698]/10 text-[#08A698]' },
        { id: 4, name: 'Samaha', initials: 'SA', color: 'bg-[#08A698]/10 text-[#08A698]' },
        { id: 5, name: 'Laiba', initials: 'LA', color: 'bg-[#08A698]/10 text-[#08A698]' },
    ];

    // Mock Variables Data
    const VARIABLES_DATA = [
        {
            category: 'Lead Property',
            items: [
                { type: 'text', label: 'Status' },
                { type: 'text', label: 'Lead link' },
                { type: 'text', label: 'Lead Assignee' },
                { type: 'text', label: 'Lead Assignee Manager' },
                { type: 'text', label: 'Lead Assignee Manager Email' },
                { type: 'text', label: 'Campaign Content' },
                { type: 'text', label: 'adset' },
                { type: 'text', label: 'Whats the Best Time To Call You' },
                { type: 'text', label: 'Best Time to Call' },
                { type: 'text', label: 'Do You Want to earn Millions' },
            ]
        },
        {
            category: 'General',
            items: [
                { type: 'text', label: 'Facebook Ad' },
                { type: 'text', label: 'Facebook Campaign' },
                { type: 'text', label: 'Lead ID FACEBOOK' },
                { type: 'text', label: 'City' },
                { type: 'text', label: 'Job Title' },
                { type: 'text', label: 'Campaign Source' },
                { type: 'text', label: 'Campaign Medium' },
                { type: 'text', label: 'Campaign Name' },
                { type: 'phone', label: 'Alternate Phone' },
                { type: 'email', label: 'Email' },
                { type: 'text', label: 'Name' },
                { type: 'phone', label: 'Phone' },
                { type: 'calendar', label: 'Created On' },
                { type: 'check', label: 'Do not call' },
                { type: 'check', label: 'Do not email' },
                { type: 'check', label: 'Do not track' },
                { type: 'calendar', label: 'Last activity date' },
                { type: 'calendar', label: 'Last customer activity date' },
                { type: 'calendar', label: 'Last outbound activity date' },
                { type: 'calendar', label: 'Modified On' },
                { type: 'check', label: 'Whatsapp opt out' },
            ]
        }
    ];

    const getIconForType = (type) => {
        switch (type) {
            case 'text': return <span className="text-gray-400 font-serif font-bold text-xs">T</span>;
            case 'phone': return <PhoneIcon className="w-4 h-4 text-gray-400" />;
            case 'email': return <EnvelopeIcon className="w-4 h-4 text-gray-400" />;
            case 'calendar': return <CalendarDaysIcon className="w-4 h-4 text-gray-400" />;
            case 'check': return <ClipboardDocumentCheckIcon className="w-4 h-4 text-gray-400" />;
            default: return <span className="text-gray-400 font-serif font-bold text-xs">T</span>;
        }
    };

    // Tabs
    const tabs = [
        { id: 'whatsapp', label: 'WHATSAPP', icon: ChatBubbleOvalLeftEllipsisIcon },
        { id: 'sms', label: 'SMS', icon: DevicePhoneMobileIcon },
        { id: 'email', label: 'EMAIL', icon: EnvelopeIcon },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* App Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <Header />

                {/* Templates Layout (Split View) */}
                <main className="flex-1 overflow-hidden flex">
                    {/* LEFT PANEL: Template List */}
                    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col relative z-10">
                        {/* Panel Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-800">Templates</h2>
                            <div className="relative">
                                <button
                                    className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                    onClick={() => setIsHeaderMenuOpen(!isHeaderMenuOpen)}
                                >
                                    <span className="text-xl mb-2">...</span>
                                </button>
                                {isHeaderMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setIsHeaderMenuOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 animated-fade-in">
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <ArrowUpTrayIcon className="w-4 h-4 text-gray-500" />
                                                Upload
                                            </button>
                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                                <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                                                Download all
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id
                                        ? 'border-[#08A698] text-[#08A698]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search/Filter or Just List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {/* Selected Item */}
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 cursor-pointer relative group bg-[#08A698]/5 border-[#08A698]/20">
                                <div className="flex items-start gap-3">
                                    <div className="text-gray-400 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 grid grid-cols-2 gap-0.5"></div>
                                        {/* Drag handle placeholder icon */}
                                        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="text-gray-400 font-medium text-sm">/</span>
                                            <span className="font-bold text-gray-900 text-sm">default</span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate">
                                            Hi This is {'{{MY NAME}}'} from {'{{M...'}
                                        </p>
                                    </div>
                                    {/* Action Button */}
                                    <div className="relative">
                                        <button
                                            className={`p-1.5 border rounded-md shadow-sm hover:text-[#08A698] transition-colors ${activeShareTemplateId === 1
                                                ? 'bg-[#08A698]/10 border-[#08A698]/30 text-[#08A698]'
                                                : 'bg-white border-gray-200 text-gray-400'
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveShareTemplateId(activeShareTemplateId === 1 ? null : 1);
                                            }}
                                        >
                                            <ShareIcon className="w-4 h-4" />
                                        </button>

                                        {/* Share Popover */}
                                        {activeShareTemplateId === 1 && (
                                            <div
                                                className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Header / Search */}
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-5 h-5 border-2 border-[#08A698] rounded flex items-center justify-center cursor-pointer">
                                                        {/* Select All Checkbox Placeholder */}
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Type here to search team member"
                                                            className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:border-[#08A698] outline-none"
                                                            autoFocus
                                                        />
                                                        <button
                                                            className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                                                            onClick={() => setActiveShareTemplateId(null)}
                                                        >
                                                            <XMarkIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* User List */}
                                                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                    {TEAM_MEMBERS.map(member => (
                                                        <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group/item">
                                                            <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-xs font-bold`}>
                                                                {member.initials}
                                                            </div>
                                                            <span className="text-sm text-gray-700 font-medium group-hover/item:text-gray-900">{member.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Backdrop for Click Outside */}
                                        {activeShareTemplateId === 1 && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveShareTemplateId(null);
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                </div>
                                {/* Left accent for active state */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#08A698] rounded-l-lg"></div>
                            </div>
                        </div>

                        {/* FAB Add Button */}
                        <button className="absolute bottom-6 right-6 w-14 h-14 bg-[#08A698] hover:bg-[#068f82] text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                            <PlusIcon className="w-8 h-8" />
                        </button>
                    </div>

                    {/* RIGHT PANEL: Editor */}
                    <div className="flex-1 bg-white p-8 overflow-y-auto relative">
                        <div className="max-w-3xl mx-auto space-y-6">

                            {/* Shortcut Input */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                        Shortcut: <span className="text-[#08A698] font-bold">/</span>
                                    </label>
                                    <button className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    defaultValue="default"
                                    className="w-full text-lg border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#08A698] focus:border-transparent outline-none transition-shadow"
                                    placeholder="e.g. greeting"
                                />
                            </div>

                            {/* Subject Input (Only for Email) */}
                            {activeTab === 'email' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-400">Subject:</label>
                                    <input
                                        type="text"
                                        className="w-full text-lg border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#08A698] focus:border-transparent outline-none transition-shadow"
                                        placeholder="Enter email subject"
                                    />
                                </div>
                            )}

                            {/* Variables */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm font-semibold text-gray-500">Variables:</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">my name</span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">my company name</span>
                                <button
                                    className="px-3 py-1 text-[#08A698] text-xs font-bold flex items-center gap-1 hover:bg-[#08A698]/10 rounded-md transition-colors relative"
                                    onMouseEnter={() => setIsValuesPopoverOpen(true)}
                                // onMouseLeave={() => setIsValuesPopoverOpen(false)} // Keeping open for interaction usually, but let's see. User said "when hovered". 
                                // If we close on mouse leave, we need to ensure we don't close when entering the popover.
                                // A common pattern is using a wrapper or timeout. For now let's just use click/hover hybrid or a wrapper div.
                                >
                                    <span>Select Variables</span>
                                    <ChevronDownIcon className="w-3 h-3" />

                                    {/* Variables Popover */}
                                    {isValuesPopoverOpen && (
                                        <div
                                            className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left"
                                            onMouseLeave={() => setIsValuesPopoverOpen(false)}
                                        >
                                            <div className="p-2 border-b border-gray-100">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Search fields"
                                                        className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-md focus:border-[#08A698] outline-none text-gray-600"
                                                        value={variableSearchTerm}
                                                        onChange={(e) => setVariableSearchTerm(e.target.value)}
                                                    />
                                                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute right-2 top-1.5" />
                                                </div>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {VARIABLES_DATA.map((group, idx) => (
                                                    <div key={idx} className="border-b border-gray-50 last:border-0">
                                                        {group.category !== 'General' && (
                                                            <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50/50 cursor-pointer hover:bg-gray-100">
                                                                <ChevronDownIcon className="w-3 h-3" />
                                                                {group.category}
                                                            </div>
                                                        )}
                                                        <div className="py-1">
                                                            {group.items
                                                                .filter(item => item.label.toLowerCase().includes(variableSearchTerm.toLowerCase()))
                                                                .map((item, itemIdx) => (
                                                                    <div
                                                                        key={itemIdx}
                                                                        className="px-4 py-1.5 flex items-center gap-3 hover:bg-[#08A698]/10 cursor-pointer text-gray-700 hover:text-[#08A698] transition-colors"
                                                                    >
                                                                        <div className="w-4 flex justify-center">
                                                                            {getIconForType(item.type)}
                                                                        </div>
                                                                        <span className="text-sm truncate">{item.label}</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Editor Textarea */}
                            <div className="relative">
                                <textarea
                                    className="w-full h-96 p-6 border border-gray-200 rounded-xl bg-white text-gray-800 text-base leading-relaxed resize-none focus:ring-2 focus:ring-[#08A698] focus:border-transparent outline-none shadow-sm"
                                    defaultValue={`Hi
This is {{MY NAME}} from {{MY COMPANY NAME}}
I tried calling you regarding your query but could not reach you.
You can call me back here.
Thanks`}
                                />
                            </div>
                        </div>

                        {/* FAB Save Button */}
                        <button className="absolute bottom-8 right-8 w-14 h-14 bg-[#E0F5F3] hover:bg-[#C1ECE8] text-[#08A698] rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 border border-[#B2E2DD]">
                            {/* Mock Save Icon */}
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" /></svg>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MessageTemplates;
