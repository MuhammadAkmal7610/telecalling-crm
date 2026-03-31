import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { InviteUserDto, UpdateUserDto, AssignLicenseDto, UserQueryDto } from './dto/user.dto';
import { UserSettingsDto } from './dto/user-settings.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    private readonly TABLE = 'users';

    constructor(private readonly supabaseService: SupabaseService) { }

    /** Invite a new user via Supabase Auth (sends invitation email or creates directly) */
    async invite(dto: InviteUserDto, invitedBy: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        let userId: string = '';          // initialized; will be set before use
        let authData: any;
        let authUserWasNew = false;   // tracks if WE created the auth user (for rollback)
        // Set redirect URL for invite email
        const INVITE_REDIRECT_URL = process.env.INVITE_REDIRECT_URL || 'https://app.telecrm.in/signup';

        // ── Step 1: Check if a DB record already exists ─────────────────────────
        const { data: existingDbUser } = await supabase
            .from(this.TABLE)
            .select('id, email')
            .eq('email', dto.email)
            .maybeSingle();

        if (existingDbUser) {
            throw new BadRequestException(`A user with the email "${dto.email}" already exists in this organization.`);
        }

        // ── Step 2: Check if an orphaned Auth user exists (partial previous failure) ─
        let orphanedAuthId: string | null = null;
        const { data: authList } = await supabase.auth.admin.listUsers();
        const existingAuthUser = authList?.users?.find((u: any) => u.email === dto.email);
        if (existingAuthUser) {
            this.logger.warn(`Orphaned auth user found for ${dto.email} (id: ${existingAuthUser.id}). Reusing for DB record.`);
            orphanedAuthId = existingAuthUser.id;
            userId = existingAuthUser.id;
            authData = { user: existingAuthUser };
        }

        // ── Step 3: Create Auth user only if no orphan found ────────────────────
        if (!orphanedAuthId) {
            if (dto.password) {
                // Direct creation if password is provided
                const { data, error: authError } = await supabase.auth.admin.createUser({
                    email: dto.email,
                    password: dto.password,
                    email_confirm: true,
                    user_metadata: {
                        name: dto.name,
                        role: dto.role ?? 'caller',
                        invited_by: invitedBy,
                        organization_id: organizationId,
                    },
                });
                if (authError) throw new BadRequestException(authError.message);
                userId = data.user.id;
                authData = data;
                authUserWasNew = true;
            } else {
                // Invite via email with redirectTo
                const { data, error: authError } = await supabase.auth.admin.inviteUserByEmail(dto.email, {
                    data: {
                        name: dto.name,
                        role: dto.role ?? 'caller',
                        invited_by: invitedBy,
                        organization_id: organizationId,
                    },
                    redirectTo: INVITE_REDIRECT_URL,
                });
                if (authError) throw new BadRequestException(authError.message);
                userId = data.user.id;
                authData = data;
                authUserWasNew = true;
            }
        }

        // ── Step 4: Create profile record in users table ─────────────────────────
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                id: userId,
                email: dto.email,
                name: dto.name ?? '',
                initials: dto.initials,
                phone: dto.phone,
                role: dto.role ?? 'caller',
                status: dto.password ? 'Working' : 'Invited',
                permission_template_id: dto.permissionTemplateId || null,
                license_type: dto.licenseType || null,
                invited_by: invitedBy,
                organization_id: organizationId,
            })
            .select()
            .single();

        if (error) {
            // ── Rollback: remove the Auth user we just created so retry is clean ──
            if (authUserWasNew && userId) {
                this.logger.error(`DB insert failed for ${dto.email}. Rolling back Auth user ${userId}.`);
                await supabase.auth.admin.deleteUser(userId);
            }
            throw new BadRequestException(error.message);
        }

        return { message: dto.password ? 'User created successfully' : 'Invitation sent', user: data };
    }

    async findAll(query: UserQueryDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { page = 1, limit = 20, search, role, status, licenseType } = query;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let q = supabase
            .from(this.TABLE)
            .select('*, permission_template:permission_templates(id,name)', { count: 'exact' })
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (search) {
            q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
        }
        if (role) q = q.eq('role', role);
        if (status) q = q.eq('status', status);
        if (licenseType) q = q.eq('license_type', licenseType);

        const { data, error, count } = await q;
        if (error) throw new BadRequestException(error.message);
        return { data, total: count, page, limit };
    }

    async findOne(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*, permission_template:permission_templates(id,name)')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .single();

        if (error || !data) throw new NotFoundException(`User ${id} not found`);
        return data;
    }

    async update(id: string, dto: UpdateUserDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);

        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async remove(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(id, organizationId);

        // ---added by akmal--Soft-delete: set status to Deleted
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ status: 'Deleted', updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // ---added by akmal--Also disable auth user
        await supabase.auth.admin.deleteUser(id);
        return { message: 'User removed', user: data };
    }

    async assignLicense(dto: AssignLicenseDto, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        await this.findOne(dto.userId, organizationId);
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({
                license_type: dto.licenseType,
                license_expiry: dto.expiryDate,
                updated_at: new Date().toISOString(),
            })
            .eq('id', dto.userId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async getAvailableLicenses(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('licenses')
            .select('*')
            .eq('status', 'Available')
            .eq('organization_id', organizationId);

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async getMe(userId: string, organizationId: string) {
        return this.findOne(userId, organizationId);
    }

    async updateMe(userId: string, dto: { name?: string; phone?: string; initials?: string; workspace_id?: string }, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const updates: any = {
            updated_at: new Date().toISOString(),
        };
        if (dto.name !== undefined) updates.name = dto.name;
        if (dto.phone !== undefined) updates.phone = dto.phone;
        if (dto.initials !== undefined) updates.initials = dto.initials;
        if (dto.workspace_id !== undefined) updates.workspace_id = dto.workspace_id;

        const { data, error } = await supabase
            .from(this.TABLE)
            .update(updates)
            .eq('id', userId)
            .eq('organization_id', organizationId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async getMySettings(userId: string, organizationId: string): Promise<any> {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select('settings')
            .eq('id', userId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw new BadRequestException(error.message);
        return data?.settings || {};
    }

    async updateMySettings(userId: string, organizationId: string, dto: UserSettingsDto): Promise<any> {
        // Ensure user exists in the org
        await this.findOne(userId, organizationId);

        const current = await this.getMySettings(userId, organizationId);
        const next = {
            ...current,
            ...(dto || {}),
            notifications: {
                ...(current?.notifications || {}),
                ...(dto?.notifications || {}),
            },
        };

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .update({
                settings: next,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
            .eq('organization_id', organizationId)
            .select('settings')
            .single();

        if (error) throw new BadRequestException(error.message);
        return data?.settings || next;
    }

    async getUserActivity(userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('activities')
            .select(`
                *,
                lead:leads(id, name)
            `)
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw new BadRequestException(error.message);
        return data;
    }
}
