import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';

@Injectable()
export class IntegrationsService {
    private readonly TABLE = 'integrations';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(workspaceId: string) {
        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async findOne(workspaceId: string, type: string, provider: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('workspace_id', workspaceId)
            .eq('type', type)
            .eq('provider', provider)
            .single();

        return data;
    }

    async saveIntegration(workspaceId: string, organizationId: string, data: any) {
        const supabase = this.supabaseService.getAdminClient();
        const { data: result, error } = await supabase
            .from(this.TABLE)
            .upsert({
                ...data,
                workspace_id: workspaceId,
                organization_id: organizationId,
                updated_at: new Date()
            }, { 
                onConflict: 'workspace_id,type,provider' 
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        return result;
    }

    async deleteIntegration(workspaceId: string, id: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .delete()
            .eq('id', id)
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return { success: true };
    }

    // OAuth2 Methods
    getGoogleAuthUrl(workspaceId: string) {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/google`;
        const scope = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.send',
            'https://www.googleapis.com/auth/gmail.modify'
        ].join(' ');

        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${workspaceId}`;
    }

    getOutlookAuthUrl(workspaceId: string) {
        const clientId = process.env.OUTLOOK_CLIENT_ID;
        const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/outlook`;
        const scope = [
            'openid',
            'profile',
            'offline_access',
            'User.Read',
            'Mail.ReadWrite',
            'Mail.Send'
        ].join(' ');

        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&response_mode=query&state=${workspaceId}`;
    }

    async handleGoogleCallback(code: string, workspaceId: string, organizationId?: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Fetch organizationId if not provided
        if (!organizationId) {
            const { data: workspace } = await supabase
                .from('workspaces')
                .select('organization_id')
                .eq('id', workspaceId)
                .single();
            organizationId = workspace?.organization_id;
        }

        if (!organizationId) {
            throw new BadRequestException('Invalid workspace ID or organization not found');
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID as string,
            process.env.GOOGLE_CLIENT_SECRET as string,
            `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/google`
        );

        try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);

            // Get user info (optional but good for metadata)
            const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
            const { data: userInfo } = await oauth2.userinfo.get();

            const integrationData = {
                type: 'email',
                provider: 'gmail',
                status: 'active',
                config: tokens,
                metadata: {
                    email: userInfo.email,
                    name: userInfo.name,
                    picture: userInfo.picture
                }
            };

            await this.saveIntegration(workspaceId, organizationId, integrationData);
            return { success: true, message: 'Google account connected successfully' };
        } catch (error) {
            console.error('Google OAuth Error:', error);
            throw new BadRequestException('Failed to exchange Google OAuth code');
        }
    }

    async handleOutlookCallback(code: string, workspaceId: string, organizationId?: string) {
        const supabase = this.supabaseService.getAdminClient();

        // Fetch organizationId if not provided
        if (!organizationId) {
            const { data: workspace } = await supabase
                .from('workspaces')
                .select('organization_id')
                .eq('id', workspaceId)
                .single();
            organizationId = workspace?.organization_id;
        }

        if (!organizationId) {
            throw new BadRequestException('Invalid workspace ID or organization not found');
        }

        const clientId = process.env.OUTLOOK_CLIENT_ID as string;
        const clientSecret = process.env.OUTLOOK_CLIENT_SECRET as string;
        const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/integrations/callback/outlook`;

        try {
            // Exchange code for tokens
            const params = new URLSearchParams();
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);
            params.append('code', code);
            params.append('redirect_uri', redirectUri);
            params.append('grant_type', 'authorization_code');
            params.append('scope', 'openid profile offline_access User.Read Mail.ReadWrite Mail.Send');

            const response = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            const tokens = await response.json();
            if (tokens.error) {
                throw new Error(tokens.error_description || tokens.error);
            }

            // Get user info
            const client = Client.init({
                authProvider: (done) => done(null, tokens.access_token)
            });
            const userInfo = await client.api('/me').get();

            const integrationData = {
                type: 'email',
                provider: 'outlook',
                status: 'active',
                config: tokens,
                metadata: {
                    email: userInfo.mail || userInfo.userPrincipalName,
                    name: userInfo.displayName
                }
            };

            await this.saveIntegration(workspaceId, organizationId, integrationData);
            return { success: true, message: 'Outlook account connected successfully' };
        } catch (error) {
            console.error('Outlook OAuth Error:', error);
            throw new BadRequestException('Failed to exchange Outlook OAuth code');
        }
    }
}
