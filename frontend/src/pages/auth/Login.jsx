import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo from '../../assets/Logo.png';
import { getAuthErrorMessage } from '../../utils/authErrors';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const toastId = toast.loading('Signing in...');

        try {
            const { data, error } = await signIn(email, password);

            if (!error) {
                toast.success('Welcome back!', { id: toastId });
                navigate('/dashboard');
            } else {
                const userMessage = getAuthErrorMessage(error);
                toast.error(userMessage, { id: toastId });
                setError(userMessage);
            }
        } catch (err) {
            console.error('Unexpected error during login:', err);
            const userMessage = getAuthErrorMessage(err);
            toast.error(userMessage, { id: toastId });
            setError(userMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(#0f766e 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }}></div>
            </div>

            {/* Content Container */}
            <div className="max-w-md w-full p-8 bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700 relative z-10">
                <div className="text-center mb-8">
                    <img src={Logo} alt="WeWave Logo" className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold" style={{ color: 'white' }}>Welcome Back</h2>
                    <p className="text-slate-300 mt-2">Sign in to your CRM account</p>
                </div>



                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-100"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-slate-100"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition duration-200 shadow-lg shadow-teal-500/20"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-slate-400 text-sm space-y-2">
                    <div>
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-medium">
                            Sign up
                        </Link>
                    </div>
                    <div>
                        Need help?{' '}
                        <a href="mailto:support@wewave.com" className="text-white hover:text-slate-200 font-medium transition-colors">
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
