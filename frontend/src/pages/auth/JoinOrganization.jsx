import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Users, ArrowRight } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function JoinOrganization() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { apiFetch } = useApi();
    const { user, isAuthenticated } = useAuth();
    
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchInvitation = async () => {
            try {
                // Public endpoint to verify token
                const data = await apiFetch(`/invitations/${token}`);
                setInvitation(data);
            } catch (err) {
                console.error('Error fetching invitation:', err);
                setError(err.message || 'Invitation not found or expired');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInvitation();
        }
    }, [token, apiFetch]);

    const handleJoin = async () => {
        if (!isAuthenticated) {
            // Redirect to signup with invite token
            navigate(`/signup?invite=${token}&email=${encodeURIComponent(invitation?.email || '')}`);
            return;
        }

        // If user is already logged in, check if it's the right email
        // (Optional: TeleCRM allows joining even if email differs, but usually it should match)
        
        setJoining(true);
        try {
            await apiFetch(`/invitations/${token}/accept`, {
                method: 'POST'
            });
            toast.success(`Succesfully joined ${invitation?.organization?.name}!`);
            // Redirect to dashboard or logout/login to refresh session if needed
            // Since we updated the user record in DB, we should probably refetch user info
            window.location.href = '/dashboard'; 
        } catch (err) {
            toast.error(err.message || 'Failed to join organization');
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                        <h2 className="mt-6 text-2xl font-bold text-gray-900">Oops!</h2>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <div className="mt-6">
                            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <Users className="h-10 w-10 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    You're invited!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join <span className="font-bold text-gray-900">{invitation?.organization?.name}</span> on TeleCRM
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                            <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Invite details</p>
                                <p className="text-xs text-blue-700">Invited: {invitation?.email}</p>
                                <p className="text-xs text-blue-700">Role: {invitation?.role}</p>
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-4">
                                    You are currently logged in as <span className="font-medium">{user?.email}</span>.
                                </p>
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {joining ? 'Joining...' : `Yes, Join ${invitation?.organization?.name}`}
                                </button>
                                <p className="mt-4 text-xs text-gray-500">
                                    Not you? <button className="text-blue-600 hover:underline" onClick={() => window.location.href='/login'}>Switch account</button>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <button
                                    onClick={handleJoin}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
                                >
                                    Login to Accept <ArrowRight className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/signup?invite=${token}&email=${encodeURIComponent(invitation?.email || '')}`)}
                                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Create New Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
