import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center bg-slate-900 text-teal-500">Loading...</div>;
    }

    if (!user) return <Navigate to="/login" replace />;


    // Role Check
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to home or unauthorized page if role doesn't match
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
