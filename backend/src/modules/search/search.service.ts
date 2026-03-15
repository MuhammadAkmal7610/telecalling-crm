import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async globalSearch(query: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();
    const workspaceId = user.workspace_id;
    const organizationId = user.organization_id;

    if (!query || query.length < 2) {
      return { leads: [], users: [], tasks: [], campaigns: [] };
    }

    try {
      // Search Leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, phone, email, status')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('organization_id', organizationId)
        .limit(10);

      // Search Users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('organization_id', organizationId)
        .limit(5);

      // Search Tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, status, due_date')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('organization_id', organizationId)
        .limit(10);

      // Search Campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status')
        .ilike('name', `%${query}%`)
        .eq('organization_id', organizationId)
        .limit(5);

      if (leadsError) this.logger.error('Error searching leads:', leadsError);
      if (usersError) this.logger.error('Error searching users:', usersError);
      if (tasksError) this.logger.error('Error searching tasks:', tasksError);
      if (campaignsError) this.logger.error('Error searching campaigns:', campaignsError);

      return {
        leads: leads || [],
        users: users || [],
        tasks: tasks || [],
        campaigns: campaigns || [],
      };
    } catch (error) {
      this.logger.error('Global search unexpected error:', error);
      return { leads: [], users: [], tasks: [], campaigns: [] };
    }
  }
}
