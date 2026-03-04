import {
    Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — enforces @Roles() decorator on controllers/routes.
 * Must be used AFTER JwtAuthGuard (which populates request.user).
 *
 * The user object must have a `role` property (string).
 * If no @Roles() decorator is present on the route, access is allowed.
 *
 * Role hierarchy: root > admin > manager > marketing > caller
 */
const ROLE_HIERARCHY: Record<string, number> = {
    root: 100,
    billing_admin: 90,
    admin: 80,
    manager: 60,
    marketing: 40,
    caller: 20,
};

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private readonly reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        // No @Roles() decorator → open to any authenticated user
        if (!requiredRoles || requiredRoles.length === 0) return true;

        const { user } = ctx.switchToHttp().getRequest();
        if (!user) {
            throw new ForbiddenException('No user found in request');
        }

        const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
        const hasAccess = requiredRoles.some((role) => {
            // Root always gets permission
            if (user.role === 'root') return true;

            // Strict Isolation for Billing Admin
            if (role === 'billing_admin') {
                return user.role === 'billing_admin';
            }

            // If the route requires anything Else (admin, manager, etc.), 
            // billing_admin should NOT have access.
            if (user.role === 'billing_admin') {
                return false;
            }

            // Strict Isolation for Org Admin (admin)
            // admin should NOT have access to billing (handled above by role === 'billing_admin' check)

            // Otherwise, check hierarchy for operations (manager > marketing > caller)
            const requiredLevel = ROLE_HIERARCHY[role] ?? 0;
            return userLevel >= requiredLevel;
        });

        if (!hasAccess) {
            this.logger.warn(
                `Access denied: user role "${user.role}" is insufficient for [${requiredRoles.join(', ')}]`,
            );
            throw new ForbiddenException(
                `Insufficient permissions. Required: ${requiredRoles.join(' or ')}`,
            );
        }

        return true;
    }
}
