import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict endpoint access by user role.
 * Works in conjunction with RolesGuard.
 *
 * @example
 * @Roles('admin', 'manager')
 * @Delete(':id')
 * remove(...) {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
