import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
    CreditCardIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import { useApi } from '../hooks/useApi';
import { toast } from 'react-hot-toast';

export default function LicenseBilling() {
    const navigate = useNavigate();
    const { apiFetch } = useApi();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [billingInfo, setBillingInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBillingInfo();
    }, []);

    const fetchBillingInfo = async () => {
        setLoading(true);
        try {
            const [subRes, usageRes] = await Promise.all([
                apiFetch('/billing/subscription'),
                apiFetch('/billing/usage')
            ]);

            if (subRes.ok && usageRes.ok) {
                const subData = await subRes.json();
                const usageData = await usageRes.json();
                
                setBillingInfo({
                    plan: subData.plan || 'Free Plan',
                    seatsUsed: usageData.usedSeats || 0,
                    seatsTotal: usageData.totalLicenses || 2,
                    renewalDate: subData.updated_at || new Date().toISOString(),
                    status: subData.status === 'active' ? 'Active' : 'Inactive'
                });
            } else {
                toast.error('Failed to load real billing data. Showing demo data.');
                setBillingInfo({
                    plan: 'Pro Plan',
                    seatsUsed: 12,
                    seatsTotal: 15,
                    renewalDate: '2026-12-31',
                    status: 'Active'
                });
            }
        } catch (error) {
            console.error('Error fetching billing info:', error);
            setBillingInfo({
                plan: 'Pro Plan',
                seatsUsed: 12,
                seatsTotal: 15,
                renewalDate: '2026-12-31',
                status: 'Active'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <CreditCardIcon className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
                                <h1 className="text-2xl font-bold text-gray-700">License &amp; Billing</h1>
                                <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors" onClick={fetchBillingInfo}>
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <ArrowPathIcon className="w-8 h-8 animate-spin text-[#08A698]" />
                            </div>
                        ) : billingInfo && (
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Current Plan</h2>
                                        <p className="text-gray-500 text-sm mt-1">Manage your organization's subscription and seat limits.</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                                        <CheckCircleIcon className="w-5 h-5" />
                                        {billingInfo.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-6 border-b border-gray-100">
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <p className="text-sm text-gray-500 font-medium mb-1">Plan Name</p>
                                        <p className="text-2xl font-bold text-gray-900">{billingInfo.plan}</p>
                                        <button className="mt-4 text-sm text-[#08A698] font-medium hover:underline">Change Plan</button>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <p className="text-sm text-gray-500 font-medium mb-1">Renewal Date</p>
                                        <p className="text-xl font-bold text-gray-900">{new Date(billingInfo.renewalDate).toLocaleDateString()}</p>
                                        <p className="text-xs text-gray-400 mt-1">Auto-renews automatically</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <UserGroupIcon className="w-6 h-6 text-gray-400" />
                                        <h3 className="text-lg font-bold text-gray-800">Seat Usage</h3>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm mb-2 font-medium">
                                        <span className="text-gray-700">{billingInfo.seatsUsed} Seats Used</span>
                                        <span className="text-gray-500">{billingInfo.seatsTotal} Total Seats</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                        <div 
                                            className="bg-[#08A698] h-3 rounded-full" 
                                            style={{ width: `${(billingInfo.seatsUsed / billingInfo.seatsTotal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        You are currently using {billingInfo.seatsUsed} out of {billingInfo.seatsTotal} available seats across all workspaces.
                                        To assign more team members, you may need to purchase additional seats.
                                    </p>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-8">
                                    <button className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                        View Invoices
                                    </button>
                                    <button 
                                        onClick={() => navigate('/billing')}
                                        className="px-5 py-2.5 bg-[#08A698] hover:bg-[#079186] text-white font-medium rounded-lg transition-colors shadow-sm"
                                    >
                                        Add More Seats
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
