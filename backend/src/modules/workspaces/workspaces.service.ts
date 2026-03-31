import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class WorkspacesService {
    private readonly logger = new Logger(WorkspacesService.name);

    constructor(private readonly supabaseService: SupabaseService) { }

    private async assertWorkspaceAccess(
        userId: string,
        workspaceId: string,
        organizationId: string,
        isOrgAdminOrRoot: boolean,
    ) {
        // Workspace must exist and belong to the organization
        await this.findOneWorkspace(workspaceId, organizationId);

        // Org admins can manage any workspace in the org
        if (isOrgAdminOrRoot) return;

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspace_members')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new ForbiddenException('Not a member of this workspace');
    }

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

    async createWorkspace(dto: { name: string; description?: string }, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { id: userId, organizationId, email, name } = user;

        // Defensive: Ensure user record exists in DB to satisfy FK constraints
        if (userId && organizationId) {
            await supabase.from('users').upsert({
                id: userId,
                organization_id: organizationId,
                email: email || 'unknown@example.com',
                name: name || 'User',
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
        }

        const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const { data, error } = await supabase
            .from('workspaces')
            .insert({
                name: dto.name,
                description: dto.description || null,
                slug: `${slug}-${Date.now()}`,
                organization_id: organizationId,
                created_by: userId,
                is_default: false,
            })
            .select()
            .single();
        if (error) throw new BadRequestException(error.message);

        // Auto-add creator as admin of this workspace
        await this.addMember(data.id, userId, 'admin');

        // Initialize default lead stages for this workspace
        await this.initializeDefaultStages(data.id, organizationId);

        return data;
    }

    async createDefaultWorkspace(organizationId: string, createdBy: string, orgName: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Defensive: Ensure user record exists in DB
        // Note: For signup flow, we might not have all user metadata in 'user' object if it's passed differently
        // but here createdBy is the ID.
        if (createdBy && organizationId) {
            await supabase.from('users').upsert({
                id: createdBy,
                organization_id: organizationId,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
        }

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

        // Initialize default lead stages for this workspace
        await this.initializeDefaultStages(data.id, organizationId);

        return data;
    }

    private async initializeDefaultStages(workspaceId: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const defaultStages = [
            { name: 'New', type: 'fresh', color: '#3B82F6', position: 0, is_default: true },
            { name: 'Contacted', type: 'active', color: '#F59E0B', position: 1, is_default: false },
            { name: 'Qualified', type: 'active', color: '#10B981', position: 2, is_default: false },
            { name: 'Proposal Sent', type: 'active', color: '#8B5CF6', position: 3, is_default: false },
            { name: 'Won', type: 'won', color: '#059669', position: 4, is_default: false },
            { name: 'Lost', type: 'lost', color: '#EF4444', position: 5, is_default: false },
        ];

        const stagesToInsert = defaultStages.map(s => ({
            ...s,
            organization_id: organizationId,
            workspace_id: workspaceId
        }));

        await supabase.from('lead_stages').insert(stagesToInsert);

        const defaultLostReasons = [
            { name: 'Price too high', position: 0 },
            { name: 'Not interested', position: 1 },
            { name: 'Competitor chosen', position: 2 },
            { name: 'No response', position: 3 },
        ];

        const reasonsToInsert = defaultLostReasons.map(r => ({
            ...r,
            organization_id: organizationId,
            workspace_id: workspaceId
        }));

        await supabase.from('lost_reasons').insert(reasonsToInsert);
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

        // Check for active data
        const [leads, tasks, campaigns, activities] = await Promise.all([
            supabase.from('leads').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
            supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
            supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
            supabase.from('activities').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
        ]);

        if ((leads.count ?? 0) > 0 || (tasks.count ?? 0) > 0 || (campaigns.count ?? 0) > 0 || (activities.count ?? 0) > 0) {
            throw new BadRequestException('Cannot delete workspace: This workspace contains active leads, tasks, or campaigns. Please delete or migrate all data before attempting to remove the workspace.');
        }

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

    async getMySettings(
        userId: string,
        workspaceId: string,
        organizationId: string,
        isOrgAdminOrRoot: boolean,
    ): Promise<any> {
        await this.assertWorkspaceAccess(userId, workspaceId, organizationId, isOrgAdminOrRoot);

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .select('settings')
            .eq('id', workspaceId)
            .eq('organization_id', organizationId)
            .single();

        if (error) throw new BadRequestException(error.message);
        return data?.settings || {};
    }

    async updateMySettings(
        userId: string,
        workspaceId: string,
        organizationId: string,
        isOrgAdminOrRoot: boolean,
        dto: any,
    ): Promise<any> {
        await this.assertWorkspaceAccess(userId, workspaceId, organizationId, isOrgAdminOrRoot);

        const current = await this.getMySettings(userId, workspaceId, organizationId, isOrgAdminOrRoot);
        const next = {
            ...(current || {}),
            ...(dto || {}),
            toggles: {
                ...((current && current.toggles) || {}),
                ...((dto && dto.toggles) || {}),
            },
        };

        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('workspaces')
            .update({
                settings: next,
                updated_at: new Date().toISOString(),
            })
            .eq('id', workspaceId)
            .eq('organization_id', organizationId)
            .select('settings')
            .single();

        if (error) throw new BadRequestException(error.message);
        return data?.settings || next;
    }
}
