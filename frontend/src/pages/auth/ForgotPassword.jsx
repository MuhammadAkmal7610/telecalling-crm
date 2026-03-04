import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/Logo.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Sending reset link...');

        try {
            const { error } = await forgotPassword(email);
            if (!error) {
                toast.success('Reset link sent!', { id: toastId });
                setIsSent(true);
            } else {
                toast.error(error.message || 'Failed to send reset link', { id: toastId });
            }
        } catch (err) {
            toast.error('An unexpected error occurred', { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>
            </div>

            <div className="max-w-md w-full p-8 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 relative z-10">
                <div className="text-center mb-8">
                    <img src={Logo} alt="Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="text-slate-300 mt-2">
                        {isSent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-sm">
                            If an account exists for {email}, you will receive a password reset link shortly.
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center text-slate-400 text-sm">
                    <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
