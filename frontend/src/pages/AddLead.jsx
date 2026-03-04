import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';
import WorkspaceGuard from '../components/WorkspaceGuard';
import {
    MagnifyingGlassIcon,
    ArrowTopRightOnSquareIcon,
    Bars3Icon,
    VariableIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function AddLead() {
    const { apiFetch } = useApi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        alt_phone: '',
        email: '',
        source: '',
        custom_fields: {}
    });

    const handleInputChange = (e, field, isCustom = false) => {
        const value = e.target.value;
        if (isCustom) {
            setFormData(prev => ({
                ...prev,
                custom_fields: { ...prev.custom_fields, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) {
            toast.error('Name and Phone are required');
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/leads', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success('Lead added successfully!');
                setFormData({ name: '', phone: '', alt_phone: '', email: '', source: '', custom_fields: {} });
            } else {
                const error = await response.json();
                toast.error(error.error?.message || error.message || 'Failed to add lead');
            }
        } catch (error) {
            console.error('Error adding lead:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reusable Input Component to keep code clean
    const InputField = ({ label, placeholder, icon: Icon, type = "text", value, onChange }) => (
        <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#08A698]">
                    {Icon && <Icon className="h-4 w-4 text-gray-400 group-focus-within:text-[#08A698]" />}
                </div>
                <input
                    type={type}
                    value={value || ''}
                    onChange={onChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all bg-white text-gray-700 shadow-sm hover:border-gray-300"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );

    const SelectField = ({ label, options, value, onChange }) => (
        <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                {label}
            </label>
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Bars3Icon className="h-4 w-4 text-gray-400 group-focus-within:text-[#08A698]" />
                </div>
                <select
                    value={value || ''}
                    onChange={onChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all bg-white appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                >
                    <option value="">Select</option>
                    {options.filter(opt => opt !== 'Select').map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xs">▼</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto bg-gray-50/50">
                    <WorkspaceGuard>
                        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Add Leads</h1>
                                <p className="text-sm text-gray-500 mt-1">Add individual leads to your CRM manually.</p>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-10 space-y-8">
                                <div className="flex items-center gap-2 pb-4 border-b border-gray-100 mb-2">
                                    <h2 className="text-lg font-bold text-gray-800">Add New Lead</h2>
                                    <span className="bg-teal-50 text-[#08A698] text-xs font-bold px-2 py-0.5 rounded border border-teal-100">Details</span>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <InputField
                                        label="Name"
                                        placeholder="Enter full name"
                                        icon={VariableIcon}
                                        value={formData.name}
                                        onChange={(e) => handleInputChange(e, 'name')}
                                    />

                                    <div className="mb-5">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
                                            Phone <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 font-bold tracking-wider">REQUIRED</span>
                                        </label>
                                        <div className="flex group relative">
                                            <div className="flex items-center justify-center px-4 border border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-600 text-sm group-focus-within:border-[#08A698] transition-colors">
                                                <span className="text-lg mr-1 ml-1 leading-none">🇵🇰</span>
                                                <span className="font-semibold">+92</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange(e, 'phone')}
                                                placeholder="300 1234567"
                                                className="flex-1 block w-full px-4 py-3 border border-gray-200 bg-white rounded-r-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#08A698] focus:ring-1 focus:ring-[#08A698] transition-all text-gray-700 shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <InputField
                                    label="Alternate Phone"
                                    placeholder="Enter alternate phone"
                                    icon={PhoneIcon}
                                    value={formData.alt_phone}
                                    onChange={(e) => handleInputChange(e, 'alt_phone')}
                                />

                                <InputField
                                    label="Email"
                                    placeholder="Enter email address"
                                    icon={VariableIcon}
                                    value={formData.email}
                                    onChange={(e) => handleInputChange(e, 'email')}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                    <SelectField
                                        label="Lead Source"
                                        options={['Facebook', 'Website', 'Referral', 'Manual']}
                                        value={formData.source}
                                        onChange={(e) => handleInputChange(e, 'source')}
                                    />
                                    <InputField
                                        label="City"
                                        placeholder="Enter City"
                                        icon={VariableIcon}
                                        value={formData.custom_fields.city}
                                        onChange={(e) => handleInputChange(e, 'city', true)}
                                    />
                                </div>

                                <div className="pt-8 flex justify-center sticky bottom-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-100 -mx-6 -mb-6 lg:-mx-10 lg:-mb-10 rounded-b-xl z-20">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#08A698] text-white px-16 py-3.5 rounded-lg text-sm font-bold tracking-wide hover:bg-teal-700 transition-all duration-300 shadow-lg shadow-teal-100 transform hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {loading ? 'ADDING...' : '+ ADD LEAD'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </WorkspaceGuard>
                </main>
            </div>
        </div>
    );
}
