import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const WorkspaceContext = createContext({});

export const useWorkspace = () => useContext(WorkspaceContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const STORAGE_KEY = 'crm_workspace_id';

export const WorkspaceProvider = ({ children }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [loading, setLoading] = useState(true);
    const [switchingWorkspace, setSwitchingWorkspace] = useState(null);
    const [workspaceSwitcherOpen, setWorkspaceSwitcherOpen] = useState(false);
    const switchTimestampRef = useRef(0);

    // Load workspaces the user is a member of
    const fetchWorkspaces = useCallback(async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) { setLoading(false); return; }

            let storedId = localStorage.getItem(STORAGE_KEY);
            if (storedId === 'undefined' || storedId === 'null') {
                storedId = null;
                localStorage.removeItem(STORAGE_KEY);
            }

            const res = await fetch(`${API_URL}/workspaces/my`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!res.ok) { setLoading(false); return; }
            const result = await res.json();
            const list = result.data || result || [];
            setWorkspaces(list);

            // Restore last-used workspace or fall back to default
            const stored = list.find(w => w.id === storedId);
            const defaultWs = list.find(w => w.is_default) || list[0];
            const active = stored || defaultWs || null;
            setCurrentWorkspace(active);
            if (active) localStorage.setItem(STORAGE_KEY, active.id);
        } catch (err) {
            if (err.name === 'AbortError') return;
            console.error('WorkspaceContext: failed to load workspaces', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWorkspaces();

        // Re-fetch when auth state changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') fetchWorkspaces();
            if (event === 'SIGNED_OUT') {
                setWorkspaces([]);
                setCurrentWorkspace(null);
                localStorage.removeItem(STORAGE_KEY);
            }
        });
        return () => subscription.unsubscribe();
    }, [fetchWorkspaces]);

    const switchWorkspace = useCallback((workspaceId) => {
        // Prevent rapid switching (debounce - max 1 switch per 500ms)
        const now = Date.now();
        if (now - switchTimestampRef.current < 500) {
            return;
        }
        switchTimestampRef.current = now;

        const workspace = workspaces.find(w => w.id === workspaceId);
        if (!workspace) return;

        setSwitchingWorkspace(workspaceId);
        setCurrentWorkspace(workspace);
        localStorage.setItem(STORAGE_KEY, workspace.id);
        
        // Clear switching state after a short delay to show loading feedback
        setTimeout(() => {
            setSwitchingWorkspace(null);
        }, 800);
    }, [workspaces]);

    const toggleWorkspaceSwitcher = useCallback(() => {
        setWorkspaceSwitcherOpen(prev => !prev);
    }, []);

    const closeWorkspaceSwitcher = useCallback(() => {
        setWorkspaceSwitcherOpen(false);
    }, []);

    const openWorkspaceSwitcher = useCallback(() => {
        setWorkspaceSwitcherOpen(true);
    }, []);

    /**
     * Convenience: returns headers to attach to every API call.
     * Usage: fetch(url, { headers: await getApiHeaders() })
     */
    const getApiHeaders = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json',
            ...(currentWorkspace ? { 'x-workspace-id': currentWorkspace.id } : {}),
        };
    };

    return (
        <WorkspaceContext.Provider value={{
            workspaces,
            currentWorkspace,
            loading,
            switchingWorkspace,
            workspaceSwitcherOpen,
            switchWorkspace,
            fetchWorkspaces,
            getApiHeaders,
            toggleWorkspaceSwitcher,
            closeWorkspaceSwitcher,
            openWorkspaceSwitcher,
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};
