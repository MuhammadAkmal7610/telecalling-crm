import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const UserPreferences = () => {
    // State for Desktop Preferences
    const [emailHandler, setEmailHandler] = useState('mobile'); // 'web' or 'mobile'
    const [whatsappHandler, setWhatsappHandler] = useState('mobile'); // 'web' or 'mobile'

    // State for Notification Categories
    const [notifications, setNotifications] = useState({
        paymentPending: true,
        paymentCompleted: true,
        paymentFailed: true,
        newLead: true,
        callReminder: true,
    });

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        <h1 className="text-xl font-medium text-gray-500">My Preferences</h1>

                        {/* Desktop Preferences Section */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-medium text-gray-700">Desktop Preferences</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                {/* Item 1 */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">1. How to handle one-click email</span>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${emailHandler === 'web' ? 'border-[#08A698]' : 'border-gray-400'}`}>
                                                {emailHandler === 'web' && <div className="w-2.5 h-2.5 rounded-full bg-[#08A698]"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="email"
                                                value="web"
                                                checked={emailHandler === 'web'}
                                                onChange={() => setEmailHandler('web')}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-800">Web</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${emailHandler === 'mobile' ? 'border-[#08A698]' : 'border-gray-400'}`}>
                                                {emailHandler === 'mobile' && <div className="w-2.5 h-2.5 rounded-full bg-[#08A698]"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="email"
                                                value="mobile"
                                                checked={emailHandler === 'mobile'}
                                                onChange={() => setEmailHandler('mobile')}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-800">Send to Mobile</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Item 2 */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-600">2. How to handle one-click whatsapp</span>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${whatsappHandler === 'web' ? 'border-[#08A698]' : 'border-gray-400'}`}>
                                                {whatsappHandler === 'web' && <div className="w-2.5 h-2.5 rounded-full bg-[#08A698]"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="whatsapp"
                                                value="web"
                                                checked={whatsappHandler === 'web'}
                                                onChange={() => setWhatsappHandler('web')}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-800">Web</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${whatsappHandler === 'mobile' ? 'border-[#08A698]' : 'border-gray-400'}`}>
                                                {whatsappHandler === 'mobile' && <div className="w-2.5 h-2.5 rounded-full bg-[#08A698]"></div>}
                                            </div>
                                            <input
                                                type="radio"
                                                name="whatsapp"
                                                value="mobile"
                                                checked={whatsappHandler === 'mobile'}
                                                onChange={() => setWhatsappHandler('mobile')}
                                                className="hidden"
                                            />
                                            <span className="text-sm text-gray-600 group-hover:text-gray-800">Send to Mobile</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notification Categories Section */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-medium text-gray-700">Notification Categories</h2>
                            </div>
                            
                            <div className="p-6 space-y-5 border-gray-100 pt-6">
                                {[
                                    { id: 'paymentPending', label: '1. Payment Pending' },
                                    { id: 'paymentCompleted', label: '2. Payment Completed' },
                                    { id: 'paymentFailed', label: '3. Payment Failed' },
                                    { id: 'newLead', label: '4. New Lead in Campaign' },
                                    { id: 'callReminder', label: '5. Call Reminder' },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-gray-600">{item.label}</span>
                                        <button
                                            onClick={() => toggleNotification(item.id)}
                                            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${notifications[item.id] ? 'bg-[#08A698]' : 'bg-gray-300'}`}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${notifications[item.id] ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserPreferences;
