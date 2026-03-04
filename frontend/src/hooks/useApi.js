/**
 * useApi - a lightweight wrapper around fetch that automatically injects
 * the Authorization header and x-workspace-id from WorkspaceContext.
 *
 * Falls back to localStorage('crm_workspace_id') if the context hasn't
 * loaded currentWorkspace yet (race condition on first render).
 */
import { useWorkspace } from '../context/WorkspaceContext';
import { supabase } from '../lib/supabaseClient';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const STORAGE_KEY = 'crm_workspace_id';

export function useApi() {
    const { currentWorkspace } = useWorkspace();

    /**
     * Fetch with auto-injected auth + workspace headers.
     * @param {string} path  - e.g. '/leads' or '/leads?page=1'
     * @param {RequestInit} options - standard fetch options (method, body, etc.)
     */
    const apiFetch = async (path, options = {}) => {
        const { data: { session } } = await supabase.auth.getSession();

        // Use context workspace if loaded, otherwise fall back to localStorage
        const workspaceId = currentWorkspace?.id || localStorage.getItem(STORAGE_KEY);

        const headers = {
            'Authorization': `Bearer ${session?.access_token || ''}`,
            'Content-Type': 'application/json',
            ...(workspaceId ? { 'x-workspace-id': workspaceId } : {}),
            ...(options.headers || {}),
        };

        return fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
        });
    };

    return { apiFetch };
}
