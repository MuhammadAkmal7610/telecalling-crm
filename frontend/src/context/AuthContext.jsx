import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setUser({
                        ...session.user,
                        organizationId: session.user.user_metadata?.organization_id || session.user.user_metadata?.org_id,
                    });
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking session:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    ...session.user,
                    organizationId: session.user.user_metadata?.organization_id || session.user.user_metadata?.org_id,
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password, extraData = {}) => {
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    orgName: extraData.orgName || extraData.full_name || 'My CRM',
                    phone: extraData.phone || ''
                })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message || 'Signup failed');

            // Signup usually requires email verification depending on Supabase settings
            return { data: result, error: null };
        } catch (error) {
            console.error('Signup error:', error);
            return { data: null, error };
        }
    };

    const signIn = async (email, password) => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await res.json();

            // Format result if wrapped in TransformInterceptor
            const data = result.data || result;
            if (!res.ok) throw new Error(data.message || 'Login failed');

            if (data.access_token && data.refresh_token) {
                const { data: { user: sessionUser }, error: sessionError } = await supabase.auth.setSession({
                    access_token: data.access_token,
                    refresh_token: data.refresh_token
                });

                if (sessionError) throw sessionError;

                if (sessionUser) {
                    setUser({
                        ...sessionUser,
                        organizationId: sessionUser.user_metadata?.organization_id || sessionUser.user_metadata?.org_id,
                    });
                }
                return { data, error: null };
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error('Login error:', error);
            return { data: null, error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const value = {
        signUp,
        signIn,
        signOut,
        user,
        loading,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
