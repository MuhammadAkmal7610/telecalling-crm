import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/Logo.png';

const Signup = () => {
    const navigate = useNavigate();
    const { signUp } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fade, setFade] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        orgName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const updateFormData = (fields) => {
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const nextStep = (next) => {
        setFade(false);
        setTimeout(() => {
            setStep(next);
            setFade(true);
        }, 200);
    };

    const handleOrgSubmit = (e) => {
        e.preventDefault();
        if (!formData.orgName.trim()) return toast.error("Organization name is required");
        nextStep(2);
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!formData.email.trim()) return toast.error("Valid email is required");
        nextStep(3);
    };

    const handlePhoneSubmit = (e) => {
        e.preventDefault();
        if (!formData.phone.trim()) return toast.error("Phone number is required");
        nextStep(4);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match");
        if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

        setLoading(true);
        const toastId = toast.loading("Creating your organization...");

        try {
            const { data, error } = await signUp(formData.email, formData.password, {
                orgName: formData.orgName,
                phone: formData.phone
            });

            if (error) throw error;

            toast.success("Account created! Please check your email or login.", { id: toastId });
            nextStep(5);
        } catch (error) {
            console.error("Signup failed:", error);
            toast.error(error.message || "Failed to create account", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { id: 1, label: "Organization" },
        { id: 2, label: "Email" },
        { id: 3, label: "Phone" },
        { id: 4, label: "Security" },
        { id: 5, label: "Done" }
    ];

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4">
            <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>
            </div>

            <div className={`w-full max-w-[480px] z-10 transition-all duration-500 ease-out transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                {/* Progress Bar */}
                <div className="flex justify-between mb-12 px-4">
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.id ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-700 text-slate-500'
                                }`}>
                                {step > s.id ? '✓' : s.id}
                            </div>
                            <span className={`text-[10px] mt-2 uppercase tracking-wider ${step === s.id ? 'text-teal-400 font-bold' : 'text-slate-500'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-8">
                    <img src={Logo} alt="Logo" className="w-12 h-12 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {step === 1 && "Start Your Agency"}
                        {step === 2 && "Connect Email"}
                        {step === 3 && "Mobile Number"}
                        {step === 4 && "Set Password"}
                        {step === 5 && "Verification Sent"}
                    </h1>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-2xl">
                    {step === 1 && (
                        <form onSubmit={handleOrgSubmit}>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Workspace Name</label>
                            <input
                                autoFocus
                                type="text"
                                className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white text-lg transition-all"
                                value={formData.orgName}
                                onChange={e => updateFormData({ orgName: e.target.value })}
                                placeholder="e.g. Acme CRM"
                            />
                            <button className="w-full mt-6 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all">
                                Continue
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleEmailSubmit}>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Professional Email</label>
                            <input
                                autoFocus
                                type="email"
                                className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white text-lg transition-all"
                                value={formData.email}
                                onChange={e => updateFormData({ email: e.target.value })}
                                placeholder="name@company.com"
                            />
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => nextStep(1)} className="px-6 py-4 text-slate-400">Back</button>
                                <button className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all">
                                    Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handlePhoneSubmit}>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                            <input
                                autoFocus
                                type="tel"
                                className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white text-lg transition-all"
                                value={formData.phone}
                                onChange={e => updateFormData({ phone: e.target.value })}
                                placeholder="+92 300 1234567"
                            />
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => nextStep(2)} className="px-6 py-4 text-slate-400">Back</button>
                                <button className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all">
                                    Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleFinalSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Create Password</label>
                                    <input
                                        autoFocus
                                        type="password"
                                        className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white text-lg"
                                        value={formData.password}
                                        onChange={e => updateFormData({ password: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="w-full px-5 py-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white text-lg"
                                        value={formData.confirmPassword}
                                        onChange={e => updateFormData({ confirmPassword: e.target.value })}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button type="button" onClick={() => nextStep(3)} className="px-6 py-4 text-slate-400">Back</button>
                                <button disabled={loading} className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-all disabled:opacity-50">
                                    {loading ? 'Creating Account...' : 'Complete Signup'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 5 && (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-400 text-2xl">✓</div>
                            <p className="text-lg mb-6">Verification link sent to <strong>{formData.email}</strong></p>
                            <Link to="/login" className="block w-full py-4 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all text-center">
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>

                {step === 1 && (
                    <p className="mt-8 text-center text-slate-500">
                        Work for an agency? <Link to="/login" className="text-teal-400 hover:underline">Log in instead</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Signup;
