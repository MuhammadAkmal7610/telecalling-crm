import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Role hierarchy — higher = more permissions
 * root > admin > manager > marketing > caller
 */
const ROLE_LEVEL = {
    root: 100,
    billing_admin: 90,
    admin: 80,
    manager: 60,
    marketing: 40,
    caller: 20,
};

/**
 * Permission map — what each role is allowed to do.
 * A role inherits all permissions of roles below it via ROLE_LEVEL comparison.
 */
const PERMISSION_MAP = {
    manage_users: 'admin',   // Add/delete/invite users
    manage_workspaces: 'admin',   // Create/delete workspaces
    manage_billing: 'billing_admin', // Access billing page/actions
    view_billing: 'billing_admin',   // Billing page visibility
    delete_leads: 'manager', // Bulk delete / single delete
    import_leads: 'manager', // CSV import
    view_all_leads: 'manager', // See all leads, not just own
    export_data: 'manager', // Download reports/exports
    view_reports: 'marketing',
    create_tasks: 'caller',
    create_schedules: 'caller',
    view_own_leads: 'caller',
};

/**
 * usePermission hook
 *
 * Returns:
 *   - can(permission): boolean
 *   - role: current workspace-scoped role string
 *   - isAdmin, isManager, isCaller: convenience booleans
 *
 * @example
 * const { can, isAdmin } = usePermission();
 * {can('manage_users') && <button>Add User</button>}
 */
export const usePermission = () => {
    const { user } = useAuth();
    // 1. Get the "Global" role from Supabase user metadata (set during signup/invite)
    const globalRole = user?.user_metadata?.role || user?.app_metadata?.role;

    // 2. Get the "Contextual" role (could be passed via WorkspaceContext in the future)
    // For now, if the user object has a role property directly, use it (populated by some pages)
    const currentRole = user?.role || globalRole || 'caller';

    const userLevel = ROLE_LEVEL[currentRole] ?? 0;
    const globalLevel = ROLE_LEVEL[globalRole] ?? 0;

    const can = (permission) => {
        const requiredRole = PERMISSION_MAP[permission];
        if (!requiredRole) return false;
        const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;

        // Root always has access
        if (globalLevel >= ROLE_LEVEL.root || userLevel >= ROLE_LEVEL.root) return true;

        // Special case: Billing is ONLY for billing_admin (and root, handled above)
        if (permission === 'view_billing' || permission === 'manage_billing') {
            return currentRole === 'billing_admin' || globalRole === 'billing_admin';
        }

        // Special case: Billing Admin CANNOT do anything else (leads, users, etc.)
        if (currentRole === 'billing_admin' || globalRole === 'billing_admin') {
            return false;
        }

        // Otherwise use level-based hierarchy for Org Admin, Manager, etc.
        return userLevel >= requiredLevel;
    };

    return {
        can,
        role: currentRole,
        isRoot: globalLevel >= ROLE_LEVEL.root,
        isBillingAdmin: currentRole === 'billing_admin' || globalLevel >= ROLE_LEVEL.root,
        isOrgAdmin: currentRole === 'admin' || globalLevel >= ROLE_LEVEL.root,
        isAdmin: userLevel >= ROLE_LEVEL.admin || globalLevel >= ROLE_LEVEL.root,
        isManager: userLevel >= ROLE_LEVEL.manager || globalLevel >= ROLE_LEVEL.root,
        isMarketing: userLevel >= ROLE_LEVEL.marketing || globalLevel >= ROLE_LEVEL.root,
        isCaller: userLevel >= ROLE_LEVEL.caller,
    };
};
