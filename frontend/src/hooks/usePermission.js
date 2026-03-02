import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Role hierarchy — higher = more permissions
 * root > admin > manager > marketing > caller
 */
const ROLE_LEVEL = {
    root: 100,
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
    view_billing: 'admin',   // Billing page
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
    // Role is workspace-scoped (stored in user.role after SupabaseStrategy enrichment)
    // Fall back to user_metadata role for pages that don't use workspace context
    const role = user?.role || user?.user_metadata?.role || 'caller';
    const userLevel = ROLE_LEVEL[role] ?? 0;

    const can = (permission) => {
        const requiredRole = PERMISSION_MAP[permission];
        if (!requiredRole) return false;
        const requiredLevel = ROLE_LEVEL[requiredRole] ?? 0;
        return userLevel >= requiredLevel;
    };

    return {
        can,
        role,
        isRoot: userLevel >= ROLE_LEVEL.root,
        isAdmin: userLevel >= ROLE_LEVEL.admin,
        isManager: userLevel >= ROLE_LEVEL.manager,
        isMarketing: userLevel >= ROLE_LEVEL.marketing,
        isCaller: userLevel >= ROLE_LEVEL.caller,
    };
};
