import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import toast from 'react-hot-toast';
import { useApi } from '../hooks/useApi';

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

    const { apiFetch } = useApi();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        setDirty(true);
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await apiFetch('/users/me/settings');
                if (!res.ok) {
                    toast.error('Failed to load preferences');
                    return;
                }

                const json = await res.json();
                const settings = json?.settings || json || {};

                if (settings.emailHandler) setEmailHandler(settings.emailHandler);
                if (settings.whatsappHandler) setWhatsappHandler(settings.whatsappHandler);

                const serverNotifications = settings.notifications || {};
                setNotifications(prev => ({
                    ...prev,
                    ...serverNotifications,
                }));
            } catch (e) {
                console.error('Failed to load user settings', e);
                toast.error('Failed to load preferences');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                emailHandler,
                whatsappHandler,
                notifications,
            };

            const res = await apiFetch('/users/me/settings', {
                method: 'PATCH',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => null);
                toast.error(errJson?.message || 'Failed to save preferences');
                return;
            }

            toast.success('Preferences saved');
            setDirty(false);
        } catch (e) {
            console.error('Failed to save user settings', e);
            toast.error('Failed to save preferences');
        } finally {
            setSaving(false);
        }
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
                                                onChange={() => {
                                                    setEmailHandler('web');
                                                    setDirty(true);
                                                }}
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
                                                onChange={() => {
                                                    setWhatsappHandler('mobile');
                                                    setDirty(true);
                                                }}
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

                        <div className="pt-2 flex items-center justify-end">
                            <button
                                onClick={handleSave}
                                disabled={loading || saving || !dirty}
                                className="px-5 py-2.5 rounded-lg bg-[#08A698] hover:bg-[#079186] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserPreferences;
