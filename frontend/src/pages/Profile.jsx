import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const Profile = () => {
    // State for form fields (pre-filled as per screenshot)
    const [formData, setFormData] = useState({
        name: 'Eon Holding',
        initials: 'EH',
        email: 'eonholdings.pk@gmail.com',
        state: 'Working',
        role: 'Root',
        permissionTemplate: 'Default Root Permissions',
        phone: '923330380404'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <Header />

                {/* Main Content - Scrollable */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-8 scroll-smooth no-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8 pb-10">
                        {/* Page Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-700">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                </svg>
                                <h1 className="text-2xl font-semibold text-gray-800">Edit user</h1>
                            </div>
                            <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors">
                                Save changes
                            </button>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="grid grid-cols-12 gap-x-6 gap-y-6">
                                {/* Name */}
                                <div className="col-span-8">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3"
                                    />
                                </div>

                                {/* Initials */}
                                <div className="col-span-4">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Intials <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="initials"
                                        value={formData.initials}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3"
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 cursor-not-allowed"
                                    />
                                </div>

                                {/* State */}
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        State
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 appearance-none"
                                        >
                                            <option>Working</option>
                                            <option>Inactive</option>
                                            <option>Suspended</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Roles
                                    </label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={formData.role}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 cursor-not-allowed"
                                    />
                                </div>

                                {/* Permission Template */}
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Permission template
                                    </label>
                                    <input
                                        type="text"
                                        name="permissionTemplate"
                                        value={formData.permissionTemplate}
                                        readOnly
                                        className="w-full bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 cursor-not-allowed"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                                            {/* Flag Icon Placeholder (Pakistan Flag as per screenshot phone code +92) */}
                                            <span role="img" aria-label="flag" className="text-xl">🇵🇰</span>
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-3 pl-12"
                                        />
                                    </div>
                                </div>

                                {/* Verified Status */}
                                <div className="col-span-12 pt-2">
                                    <div className="flex items-center gap-2 text-green-700 font-bold text-base">
                                        <CheckCircleIcon className="w-5 h-5 text-green-700" />
                                        <span>Verified</span>
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
