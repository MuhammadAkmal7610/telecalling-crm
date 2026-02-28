import React from 'react';
import { XMarkIcon, MagnifyingGlassIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    GlobeAltIcon,
    ShoppingBagIcon,
    PhoneIcon,
    DocumentArrowUpIcon,
    PencilSquareIcon,
    TagIcon,
    StarIcon,
    UserPlusIcon,
    ChatBubbleBottomCenterTextIcon,
    ClipboardDocumentCheckIcon,
    MapPinIcon,
    MicrophoneIcon,
    PlayCircleIcon,
    CreditCardIcon,
    InboxIcon
} from '@heroicons/react/24/outline';

const events = [
    { id: 'whatsapp', name: 'Whatsapp', icon: ChatBubbleLeftRightIcon, hasSub: true },
    { id: 'field-change', name: 'On Lead Field Change', icon: UserGroupIcon, hasSub: true },
    { id: 'facebook', name: 'On Facebook lead', icon: ShoppingBagIcon, isPublished: true, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { id: 'website', name: 'On Website lead', icon: GlobeAltIcon, isPublished: true, iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
    { id: 'woocommerce', name: 'On WooCommerce payment', icon: ShoppingBagIcon, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { id: 'call-log', name: 'On call log lead', icon: PhoneIcon },
    { id: 'excel-upload', name: 'On Excel upload lead', icon: DocumentArrowUpIcon, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { id: 'manual', name: 'On manual lead', icon: PencilSquareIcon, isPublished: true },
    { id: 'status-change', name: 'On Lead Status Change', icon: InboxIcon, isPublished: true },
    { id: 'rating-change', name: 'On Lead Rating Change', icon: StarIcon },
    { id: 'assignment-change', name: 'On Lead Assignment Change', icon: UserPlusIcon },
    { id: 'user-note', name: 'On User Note', icon: ChatBubbleBottomCenterTextIcon },
    { id: 'system-note', name: 'On System Note', icon: ClipboardDocumentCheckIcon },
    { id: 'location-checkin', name: 'On Location Check-in', icon: MapPinIcon },
    { id: 'ivr', name: 'IVR', icon: MicrophoneIcon, hasSub: true },
    { id: 'call-activities', name: 'Call activities', icon: PlayCircleIcon, hasSub: true },
    { id: 'payment-activities', name: 'Payment activities', icon: CreditCardIcon, hasSub: true },
];

export default function SelectEventModal({ isOpen, onClose, onNext }) {
    const [search, setSearch] = React.useState('');
    const [selectedEvent, setSelectedEvent] = React.useState(null);

    if (!isOpen) return null;

    const filteredEvents = events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Select event</h2>
                        <p className="text-[13px] text-gray-500 mt-0.5">Select the event that will trigger the workflow</p>
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
                            placeholder="Search for event, e.g. facebook, payment completed, my_waca_template, etc"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 focus:border-[#08A698] transition-all text-[15px] placeholder-gray-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                {/* Event List */}
                <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-0.5">
                        {filteredEvents.map((event) => (
                            <div
                                key={event.id}
                                className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-gray-50 group ${selectedEvent === event.id ? 'bg-teal-50/50' : ''}`}
                                onClick={() => setSelectedEvent(event.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg transition-colors ${event.iconBg || 'bg-gray-100'} ${event.iconColor || 'text-gray-500'} ${selectedEvent === event.id ? 'ring-2 ring-teal-500 ring-offset-2' : 'group-hover:scale-110'}`}>
                                        <event.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[15px] font-medium transition-colors ${selectedEvent === event.id ? 'text-teal-900' : 'text-gray-700 group-hover:text-gray-900 font-normal'}`}>
                                        {event.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {event.isPublished && (
                                        <span className="px-2 py-0.5 bg-emerald-50 text-[#08A698] text-[10px] font-bold uppercase rounded-md border border-emerald-100/50">
                                            Published
                                        </span>
                                    )}
                                    {event.hasSub ? (
                                        <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <div className="w-4 h-4" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 flex justify-end items-center gap-4 bg-gray-50/30">
                    <button
                        disabled={!selectedEvent}
                        onClick={() => onNext(selectedEvent)}
                        className={`px-10 py-2.5 rounded-xl font-semibold text-white transition-all transform active:scale-95 ${selectedEvent
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
