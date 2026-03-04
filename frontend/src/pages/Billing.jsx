import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';
import {
    PencilSquareIcon,
    ShoppingCartIcon,
    ChatBubbleLeftRightIcon,
    Squares2X2Icon,
    CheckIcon,
    EyeIcon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import Logo from '../assets/Logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const licenses = [
    {
        id: 1,
        title: 'Core CRM + WhatsApp Chat Sync - International (A)',
        price: '₹23,904.00',
        expiry: '19 Dec 2026',
        icon: 'crm-wa'
    },
    {
        id: 2,
        title: 'Core CRM - International(A)',
        price: '₹19,823.00',
        expiry: '19 Dec 2026',
        icon: 'crm'
    }
];

const services = [
    {
        id: 3,
        title: 'WhatsApp Cloud API Set up',
        price: '₹1,654.00',
        icon: 'wa-api'
    }
];

const WhatsAppLogo = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

const LicenseIcon = ({ type }) => {
    if (type === 'crm-wa') {
        return (
            <div className="relative w-12 h-12 shrink-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white border border-gray-200 p-2">
                    <img src={Logo} alt="WeWave" className="w-full h-full object-contain" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white flex items-center justify-center shadow-sm">
                    <WhatsAppLogo className="w-3 h-3 text-white" />
                </div>
            </div>
        );
    }
    if (type === 'crm') {
        return (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden bg-white border border-gray-200 shadow-sm p-2">
                <img src={Logo} alt="WeWave" className="w-full h-full object-contain" />
            </div>
        );
    }
    if (type === 'wa-api') {
        return (
            <div className="relative w-12 h-12 shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-green-100">
                    <WhatsAppLogo className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-0 -right-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
                    <div className="relative w-4 h-4 rounded-full overflow-hidden">
                        <img src={Logo} alt="WeWave" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const FloatingInput = ({ label, value, onChange, type = "text", required = false }) => {
    return (
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="block px-4 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#08A698] peer"
                placeholder=" "
            />
            <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#08A698] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                {label} {required && <span className="text-gray-400 font-normal">(required)</span>}
            </label>
        </div>
    );
};

const EditBillingModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Edit Billing Information</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {/* Country Select */}
                    <div className="relative">
                        <select className="block px-4 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#08A698] peer">
                            <option>Pakistan</option>
                            <option>United Arab Emirates</option>
                            <option>United States</option>
                        </select>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-[#08A698] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">
                            Country <span className="text-gray-400 font-normal">(required)</span>
                        </label>
                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    <FloatingInput label="Address" value="Flat 810 Abushakara builiding Al rega Dubai, UAE" required />

                    <FloatingInput label="Address Line 2" value="" />

                    <FloatingInput label="Pincode" value="25314" required />

                    <FloatingInput label="Registered Name of the Company" value="Eon Holding" required />

                    <FloatingInput label="Email" value="eonholdings.pk@gmail.com" type="email" required />

                    {/* Phone Input with Flag */}
                    <div className="relative flex items-center border border-gray-300 rounded-lg focus-within:border-[#08A698] focus-within:ring-1 focus-within:ring-[#08A698]">
                        <div className="flex items-center gap-2 pl-4 pr-3 py-3 border-r border-gray-200 bg-gray-50/50 rounded-l-lg">
                            <div className="w-5 h-5 rounded-full bg-green-900 border border-white overflow-hidden relative">
                                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white"></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium tracking-wide">+92</span>
                        </div>
                        <input
                            type="tel"
                            className="flex-1 px-4 py-3 bg-transparent text-sm text-gray-900 focus:outline-none"
                            value="3330380404"
                        />
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-20">
                            Phone <span className="text-gray-400 font-normal">(required)</span>
                        </label>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 pt-2">
                    <button className="w-full py-3.5 bg-[#08A698] hover:bg-[#079186] text-white font-semibold rounded-xl text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] duration-200">
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewBillingModal = ({ isOpen, onClose, onEdit }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-2">
                    <h2 className="text-xl font-bold text-gray-800">View Billing Information</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 pt-2">
                    <div className="border border-gray-200 rounded-xl p-6">
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 inline-block mr-2">Eon Holding</h3>
                                <span className="text-gray-500 text-sm">(eonholdings.pk@gmail.com)</span>
                            </div>
                            <button
                                onClick={onEdit}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#08A698] bg-white border border-[#08A698] rounded-lg hover:bg-[#08A698] hover:text-white transition-all shadow-sm active:scale-95 self-start sm:self-auto"
                            >
                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                Edit
                            </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-8">
                            <div className="group">
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Country</div>
                                <div className="text-gray-900 font-medium">Pakistan</div>
                            </div>
                            <div className="group">
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Pincode</div>
                                <div className="text-gray-900 font-medium">25314</div>
                            </div>
                            <div className="group">
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Phone no</div>
                                <div className="text-gray-900 font-medium font-mono">+92 333 038 0404</div>
                            </div>
                            <div className="sm:col-span-2 group">
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">Address</div>
                                <div className="text-gray-900 font-medium leading-relaxed">Flat 810 Abushakara builiding Al rega Dubai, UAE</div>
                            </div>
                            <div className="group">
                                <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-1.5">GSTIN</div>
                                <div className="text-gray-400 italic">Not set</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Billing() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [billingCycle, setBillingCycle] = useState('Annual');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [subscription, setSubscription] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    name: session.user.user_metadata?.name || 'User',
                    email: session.user.email
                });
            }
        };
        getUser();
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const headers = { 'Authorization': `Bearer ${session.access_token}` };

            const [subRes, transRes] = await Promise.all([
                fetch(`${API_URL}/billing/subscription`, { headers }),
                fetch(`${API_URL}/billing/transactions`, { headers })
            ]);

            const subResult = await subRes.json();
            const transResult = await transRes.json();

            setSubscription(subResult.data || subResult);
            setTransactions(transResult.data || transResult);
        } catch (error) {
            console.error('Error fetching billing data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-[#202124] font-sans antialiased">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            <EditBillingModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />

            <ViewBillingModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                onEdit={() => {
                    setIsViewModalOpen(false);
                    setIsEditModalOpen(true);
                }}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header setIsSidebarOpen={setSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Buy Licenses</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage your billing</p>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* Left Column - Product Selection */}
                            <div className="xl:col-span-7 space-y-8">

                                {/* Licenses Section */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-lg font-semibold text-gray-700">Licenses</h2>

                                        {/* Toggle */}
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => setBillingCycle('Quarterly')}
                                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingCycle === 'Quarterly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Quarterly
                                            </button>
                                            <button
                                                onClick={() => setBillingCycle('Annual')}
                                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${billingCycle === 'Annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Annual
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {licenses.map((item) => (
                                            <div key={item.id} className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#08A698]/30 transition-colors group">
                                                <div className="flex items-start gap-4">
                                                    <LicenseIcon type={item.icon} />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm sm:text-base leading-snug mb-1">
                                                            {item.title}
                                                        </h3>
                                                        <div className="text-sm font-bold text-gray-700 mb-1">{item.price}</div>
                                                        <div className="text-xs text-gray-500">Expiry Date : {item.expiry}</div>
                                                    </div>
                                                </div>
                                                <button className="self-start sm:self-center px-6 py-2 border border-[#08A698] text-[#08A698] font-medium text-sm rounded-lg hover:bg-[#08A698] hover:text-white transition-all shadow-sm active:scale-95">
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Other Services Section */}
                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-6">Other Services</h2>
                                    <div className="space-y-4">
                                        {services.map((item) => (
                                            <div key={item.id} className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#08A698]/30 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <LicenseIcon type={item.icon} />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                                            {item.title}
                                                        </h3>
                                                        <div className="text-sm font-bold text-gray-700">{item.price}</div>
                                                    </div>
                                                </div>
                                                <button className="self-start sm:self-center px-6 py-2 border border-[#08A698] text-[#08A698] font-medium text-sm rounded-lg hover:bg-[#08A698] hover:text-white transition-all shadow-sm active:scale-95">
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Right Column - Billing & Cart */}
                            <div className="xl:col-span-5">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col">
                                    {/* Billing Details Header */}
                                    <div className="p-6 border-b border-gray-100">
                                        <h2 className="text-lg font-semibold text-gray-700 mb-4">Billing Details</h2>
                                        <div className="bg-gray-50 rounded-xl p-4 flex items-start justify-between group hover:bg-gray-100/80 transition-colors">
                                            {loading ? (
                                                <div className="animate-pulse flex space-x-4">
                                                    <div className="flex-1 space-y-2 py-1">
                                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm mb-0.5">{user?.name || 'Loading...'}</div>
                                                    <div className="text-sm text-gray-500">({user?.email})</div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setIsEditModalOpen(true)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 hover:shadow-sm transition-all focus:ring-2 focus:ring-gray-100"
                                                >
                                                    <PencilSquareIcon className="w-3.5 h-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setIsViewModalOpen(true)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#08A698] bg-[#08A698]/5 border border-[#08A698]/20 rounded-lg hover:bg-[#08A698]/10 transition-all focus:ring-2 focus:ring-[#08A698]/20"
                                                >
                                                    <EyeIcon className="w-3.5 h-3.5" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Subscription */}
                                    <div className="px-6 py-4 border-b border-gray-100 bg-teal-50/30">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Current Plan</h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-sm font-bold text-gray-900 capitalize">{subscription?.plan || 'Free'}</span>
                                                <div className="text-[10px] text-gray-500 mt-0.5">Status: <span className="text-green-600 font-medium">{subscription?.status || 'Active'}</span></div>
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-white border border-teal-100 text-[#08A698] rounded-md shadow-sm">
                                                {subscription?.limits?.leads || 100} Leads / Mo
                                            </span>
                                        </div>
                                    </div>

                                    {/* Transactions List */}
                                    <div className="flex-1 overflow-y-auto min-h-[300px]">
                                        <div className="p-6">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Transaction History</h3>
                                            {loading ? (
                                                <div className="space-y-4">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="animate-pulse flex items-center justify-between">
                                                            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                                                            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : transactions.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                                    <ShoppingCartIcon className="w-12 h-12 text-gray-200 mb-2" />
                                                    <span className="text-xs text-gray-400">No transactions found</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {transactions.map(t => (
                                                        <div key={t.id} className="flex flex-col p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition-colors">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-xs font-bold text-gray-900">{t.currency} {t.amount}</span>
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${t.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                                    {t.status.toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] text-gray-500">
                                                                <span>{new Date(t.created_at).toLocaleDateString()}</span>
                                                                <span className="capitalize">{t.type}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
