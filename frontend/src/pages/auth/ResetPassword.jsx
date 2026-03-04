import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/Logo.png';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setIsLoading(true);
        const toastId = toast.loading('Resetting password...');

        try {
            const { error } = await resetPassword(password);
            if (!error) {
                toast.success('Password reset successful!', { id: toastId });
                navigate('/login');
            } else {
                toast.error(error.message || 'Failed to reset password', { id: toastId });
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
                    <h2 className="text-3xl font-bold text-white">Create New Password</h2>
                    <p className="text-slate-300 mt-2">Enter your new secure password</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-100"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? "Resetting..." : "Update Password"}
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-400 text-sm">
                    <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
