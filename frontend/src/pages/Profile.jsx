import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const Profile = () => {
    const { user: authUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        initials: '',
        email: '',
        status: '',
        role: '',
        permissionTemplate: '',
        phone: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { session } } = await (await import('../lib/supabaseClient')).supabase.auth.getSession();
            const res = await fetch(`${API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            const result = await res.json();
            if (res.ok) {
                const userData = result.data || result;
                setFormData({
                    name: userData.name || '',
                    initials: userData.initials || '',
                    email: userData.email || '',
                    status: userData.status || 'Working',
                    role: userData.role || 'Caller',
                    permissionTemplate: userData.permission_template?.name || 'Default',
                    phone: userData.phone || ''
                });
            } else {
                toast.error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Error loading profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving changes...');
        try {
            const { data: { session } } = await (await import('../lib/supabaseClient')).supabase.auth.getSession();
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    initials: formData.initials
                })
            });
            const result = await res.json();
            if (res.ok) {
                toast.success('Profile updated successfully!', { id: toastId });
            } else {
                toast.error(result.message || 'Failed to update profile', { id: toastId });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating profile', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <ArrowPathIcon className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-y-auto bg-gray-50 p-8 scroll-smooth no-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                </svg>
                                <h1 className="text-2xl font-semibold text-gray-800">Edit profile</h1>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                <div className="col-span-8">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none"
                                    />
                                </div>

                                <div className="col-span-4">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Intials <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="initials"
                                        value={formData.initials}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none"
                                    />
                                </div>

                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Email (Read only)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block p-3 cursor-not-allowed outline-none"
                                    />
                                </div>

                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">State</label>
                                    <input
                                        type="text"
                                        value={formData.status}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block p-3 cursor-not-allowed outline-none"
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Role</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block p-3 cursor-not-allowed outline-none uppercase"
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Permission template</label>
                                    <input
                                        type="text"
                                        value={formData.permissionTemplate}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg block p-3 cursor-not-allowed outline-none"
                                    />
                                </div>

                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Phone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span role="img" aria-label="flag" className="text-xl">🇵🇰</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block p-3 pl-12 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-12 pt-2">
                                    <div className="flex items-center gap-2 text-green-700 font-bold text-base">
                                        <CheckCircleIcon className="w-5 h-5 text-green-700" />
                                        <span>Verified Profile</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Profile;

