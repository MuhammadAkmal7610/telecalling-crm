import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkspacesService {
    private readonly logger = new Logger(WorkspacesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    // ─── Organization helpers ─────────────────────────────────────────────────

    async create(name: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .insert({ name })
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findByName(name: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data } = await supabase
            .from('organizations')
            .select('*')
            .eq('name', name)
            .single();
        return data;
    }

    async findById(id: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw new NotFoundException(`Organization not found`);
        return data;
    }

    // ─── Workspace CRUD ───────────────────────────────────────────────────────

    async createWorkspace(dto: { name: string; description?: string }, organizationId: string, createdBy: string) {
        const supabase = this.supabaseService.getAdminClient();

        const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                name: dto.name,
                description: dto.description || null,
                slug: `${slug}-${Date.now()}`,
                organization_id: organizationId,
                created_by: createdBy,
                is_default: false,
            })
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);

        // Auto-add creator as admin of this workspace
        await this.addMember(data.id, createdBy, 'admin');

        return data;
    }

    async createDefaultWorkspace(organizationId: string, createdBy: string, orgName: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                name: `${orgName} - Default`,
                organization_id: organizationId,
                created_by: createdBy,
                is_default: true,
                slug: `default-${organizationId.substring(0, 8)}`,
            })
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);

        // Auto-add creator as admin of default workspace
        await this.addMember(data.id, createdBy, 'admin');
        return data;
    }

    async findAllInOrg(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*, members:workspace_members(count)')
            .eq('organization_id', organizationId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: true });
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async findUserWorkspaces(userId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspace_members')
            .select('role, workspace:workspaces(id, name, description, is_default, organization_id, created_at)')
            .eq('user_id', userId)
            .eq('workspaces.organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return (data || []).map(m => ({ ...m.workspace, myRole: m.role }));
    }

    async findOneWorkspace(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .select('*, members:workspace_members(id, role, user:users(id,name,email,role))')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .single();
        if (error || !data) throw new NotFoundException(`Workspace not found`);
        return data;
    }

    async updateWorkspace(id: string, dto: Partial<{ name: string; description: string }>, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async deleteWorkspace(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        // Prevent deleting the default workspace
        const ws = await this.findOneWorkspace(id, organizationId);
        if (ws.is_default) throw new ForbiddenException('Cannot delete the default workspace');

        const { error } = await supabase
            .from('workspaces')
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Workspace deleted' };
    }

    // ─── Workspace Member Management ──────────────────────────────────────────

    async addMember(workspaceId: string, userId: string, role: string = 'caller') {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspace_members')
            .upsert({ workspace_id: workspaceId, user_id: userId, role }, { onConflict: 'workspace_id,user_id' })
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async updateMemberRole(workspaceId: string, userId: string, role: string, organizationId: string) {
        // Verify workspace belongs to org first
        await this.findOneWorkspace(workspaceId, organizationId);
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspace_members')
            .update({ role })
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async removeMember(workspaceId: string, userId: string, organizationId: string) {
        await this.findOneWorkspace(workspaceId, organizationId);
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId);
        if (error) throw new BadRequestException(error.message);
        return { message: 'Member removed from workspace' };
    }

    async getWorkspaceMembers(workspaceId: string, organizationId: string) {
        await this.findOneWorkspace(workspaceId, organizationId);
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspace_members')
            .select('id, role, user:users(id, name, email, role, status, phone)')
            .eq('workspace_id', workspaceId);
        if (error) throw new BadRequestException(error.message);
        return data;
    }
}
