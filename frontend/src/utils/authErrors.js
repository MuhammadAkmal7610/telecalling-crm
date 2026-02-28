/**
 * Maps Supabase auth error codes to user-friendly messages.
 * Ensures "no margin of error" in interpreting backend failures.
 * 
 * @param {object} error - The error object returned from Supabase
 * @returns {string} - A clean, user-facing error message
 */
export const getAuthErrorMessage = (error) => {
    if (!error) return '';

    // Log the raw error for debugging purposes
    console.warn('Auth Error:', error);

    // Normalize error message and status
    const message = error.message?.toLowerCase() || '';
    const status = error.status || 0;

    // Check specific Supabase error strings/codes
    if (message.includes('invalid login credentials')) {
        return 'Incorrect email or password. Please try again.';
    }
    if (message.includes('user already registered') || message.includes('already registered')) {
        return 'This email is already registered. Please sign in instead.';
    }
    if (message.includes('password should be at least')) {
        return 'Password is too short. It must be at least 6 characters.';
    }
    if (message.includes('send_email_rate_limit') || status === 429) {
        return 'Too many attempts. Please check your email or wait a moment.';
    }
    if (message.includes('weak_password')) {
        return 'Password is too weak. Please use a stronger password.';
    }
    if (message.includes('check your email to confirm your account')) {
        return 'Please confirm your email address before signing in.';
    }

    // Default fallback (returns the raw message if cleaner, or a generic one)
    return error.message || 'An unexpected authentication error occurred.';
};
