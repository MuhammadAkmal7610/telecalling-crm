import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, ArrowPathIcon, PhoneIcon, UserCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export default function PublicLeadForm() {
    const { orgName } = useParams();
    const [fields, setFields] = useState([]);
    const [orgId, setOrgId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchFormConfig();
    }, [orgName]);

    const fetchFormConfig = async () => {
        setLoading(true);
        try {
            // Updated to match backend PublicController paths
            const orgRes = await axios.get(`${API_URL}/public/organization/${orgName}`);
            const org = orgRes.data.data || orgRes.data;
            setOrgId(org.id);

            // Fetch lead fields for this organization
            const fieldsRes = await axios.get(`${API_URL}/public/fields/${org.id}`);
            const allFields = fieldsRes.data.data || fieldsRes.data || [];

            // Only show important fields in public form
            const publicFields = allFields.filter(f => f.show_in_quick_add || f.is_default);
            setFields(publicFields);
        } catch (error) {
            console.error('Error fetching form config:', error);
            toast.error("Form not found or organization invalid.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Prepared data for submission
            const mainFields = ['name', 'phone', 'email', 'altPhone', 'source'];
            const payload = {
                organizationId: orgId,
                source: 'Public Web Form'
            };
            const customFields = {};

            Object.keys(formData).forEach(key => {
                if (mainFields.includes(key)) {
                    payload[key] = formData[key];
                } else {
                    customFields[key] = formData[key];
                }
            });

            await axios.post(`${API_URL}/public/lead`, { ...payload, customFields });
            setSubmitted(true);
            toast.success("Thank you! We'll get back to you soon.");
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || "Failed to submit. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <ArrowPathIcon className="w-10 h-10 text-[#08A698] animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Form...</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center border border-teal-50 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-teal-50/50">
                        <CheckCircleIcon className="w-12 h-12 text-[#08A698]" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Sent Successfully!</h1>
                    <p className="text-gray-500 leading-relaxed font-medium">
                        Our team will review your information and reach out to you within the next 24 hours.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="mt-10 w-full py-4 bg-[#08A698] text-white rounded-2xl font-black shadow-lg shadow-teal-100 hover:shadow-2xl transition-all transform active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center py-12 px-4 md:py-24">
            <div className="max-w-xl w-full">
                {/* Brand / Header */}
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#08A698] text-white rounded-2xl shadow-xl shadow-teal-100 mb-6 font-black text-2xl rotate-3">
                        {orgName?.substring(0, 1).toUpperCase() || 'C'}
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight capitalize">{orgName}</h1>
                    <p className="text-gray-500 font-medium">Please fill out the form below to get started.</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="h-2 bg-[#08A698]"></div>
                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-6">
                        {fields.map((field) => (
                            <div key={field.id} className="space-y-2 group">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-[2px] px-1 flex items-center gap-2 group-focus-within:text-[#08A698] transition-colors">
                                    {field.name.toLowerCase().includes('phone') ? <PhoneIcon className="w-3 h-3" /> :
                                        field.name.toLowerCase().includes('email') ? <EnvelopeIcon className="w-3 h-3" /> :
                                            <UserCircleIcon className="w-3 h-3" />}
                                    {field.label}
                                    {field.is_default && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    required={field.is_default}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    placeholder={`Enter your ${field.label.toLowerCase()}...`}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-[#08A698] focus:bg-white focus:ring-4 focus:ring-[#08A698]/5 transition-all outline-none font-medium"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-8 py-5 bg-[#08A698] hover:bg-teal-700 text-white rounded-[1.5rem] font-black shadow-xl shadow-teal-100 hover:shadow-2xl transition-all disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            {submitting ? (
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            ) : (
                                <>Submit Now</>
                            )}
                        </button>

                        <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">
                            Powered by Telecalling CRM
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
