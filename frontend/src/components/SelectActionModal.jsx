import React from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
    PaperAirplaneIcon,
    ChatBubbleLeftIcon,
    EnvelopeIcon,
    UserPlusIcon,
    PencilIcon,
    ArchiveBoxIcon,
    LinkIcon,
    BellIcon,
    PhoneArrowUpRightIcon
} from '@heroicons/react/24/outline';

const actions = [
    { id: 'send-whatsapp', name: 'Send Whatsapp Message', icon: ChatBubbleLeftIcon, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
    { id: 'send-sms', name: 'Send SMS Message', icon: PaperAirplaneIcon, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { id: 'send-email', name: 'Send Email', icon: EnvelopeIcon, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { id: 'assign-lead', name: 'Assign Lead to User', icon: UserPlusIcon, iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
    { id: 'update-lead', name: 'Update Lead Field', icon: PencilIcon, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { id: 'add-note', name: 'Add Note/Comment', icon: ArchiveBoxIcon },
    { id: 'external-api', name: 'Trigger External API (Webhook)', icon: LinkIcon, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { id: 'app-notification', name: 'Send App Notification', icon: BellIcon, iconBg: 'bg-yellow-50', iconColor: 'text-yellow-600' },
    { id: 'ivr-call', name: 'Initiate IVR Call', icon: PhoneArrowUpRightIcon, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
];

export default function SelectActionModal({ isOpen, onClose, onBack, onNext }) {
    const [search, setSearch] = React.useState('');
    const [selectedAction, setSelectedAction] = React.useState(null);

    if (!isOpen) return null;

    const filteredActions = actions.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeftIcon className="w-5 h-5 text-gray-500" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Select action</h2>
                            <p className="text-[13px] text-gray-500 mt-0.5">Choose what happens when the trigger event occurs</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-8 py-5">
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-[#08A698]" />
                        <input
                            type="text"
                            placeholder="Search for action..."
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 focus:border-[#08A698] transition-all text-[15px] placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Action List */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-0.5">
                        {filteredActions.map((action) => (
                            <div
                                key={action.id}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-gray-50 group ${selectedAction === action.id ? 'bg-teal-50/50' : ''}`}
                                onClick={() => setSelectedAction(action.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg transition-colors ${action.iconBg || 'bg-gray-100'} ${action.iconColor || 'text-gray-500'} ${selectedAction === action.id ? 'ring-2 ring-teal-500 ring-offset-2' : 'group-hover:scale-110'}`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[15px] font-medium transition-colors ${selectedAction === action.id ? 'text-teal-900' : 'text-gray-700 group-hover:text-gray-900 font-normal'}`}>
                                        {action.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 flex justify-end items-center gap-4 bg-gray-50/30">
                    <button
                        disabled={!selectedAction}
                        onClick={() => onNext(selectedAction)}
                        className={`px-10 py-2.5 rounded-xl font-semibold text-white transition-all transform active:scale-95 ${selectedAction
                                ? 'bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-200'
                                : 'bg-gray-200 cursor-not-allowed'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
