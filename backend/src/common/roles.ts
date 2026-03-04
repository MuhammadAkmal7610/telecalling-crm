/**
 * Role hierarchy for the CRM system.
 * Higher number means more permissions.
 */
export const ROLE_HIERARCHY: Record<string, number> = {
    root: 100,
    billing_admin: 90,
    admin: 80,
    manager: 60,
    marketing: 40,
    caller: 20,
};

/**
 * Compares two roles and returns the one with higher permissions.
 */
export function getHigherRole(role1: string, role2: string): string {
    const level1 = ROLE_HIERARCHY[role1] ?? 0;
    const level2 = ROLE_HIERARCHY[role2] ?? 0;
    return level1 >= level2 ? role1 : role2;
}
