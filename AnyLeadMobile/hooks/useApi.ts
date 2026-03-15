import { supabase } from '../src/lib/supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * useApi – provides an authenticated `apiFetch` wrapper that mirrors the
 * native `fetch` API but automatically attaches the Supabase JWT and the
 * correct Content-Type header.
 */
export function useApi() {
  const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token || ''}`,
      ...(options.headers || {}),
    };

    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  };

  return { apiFetch };
}
