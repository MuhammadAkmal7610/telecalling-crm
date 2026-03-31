import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
import { createCipheriv, createHmac, randomBytes } from 'crypto';

@Injectable()
export class IntegrationsService {
    private readonly TABLE = 'integrations';
    private readonly encryptedPrefix = 'enc:v1:';

    constructor(private readonly supabaseService: SupabaseService) { }

    async findAll(workspaceId: string) {
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            return [];
        }

        const supabase = this.supabaseService.getAdminClient();

        const { data, error } = await supabase
            .from(this.TABLE)
            .select('id, workspace_id, organization_id, type, provider, status, metadata, created_at, updated_at')
            .eq('workspace_id', workspaceId);

        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async findOne(workspaceId: string, type: string, provider: string) {
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            return null;
        }
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('id, workspace_id, organization_id, type, provider, status, metadata, created_at, updated_at')
            .eq('workspace_id', workspaceId)
            .eq('type', type)
            .eq('provider', provider)
            .single();

        return data;
    }

    async saveIntegration(workspaceId: string, organizationId: string, data: any) {
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            throw new BadRequestException('Workspace ID is required to save integration');
        }
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
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            throw new BadRequestException('Workspace ID is required to delete integration');
        }
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

        const state = this.createOAuthState(workspaceId);
        return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;
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

        const state = this.createOAuthState(workspaceId);
        return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&response_mode=query&state=${encodeURIComponent(state)}`;
    }

    async handleGoogleCallback(code: string, state: string, organizationId?: string) {
        const workspaceId = this.verifyOAuthState(state);
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            throw new BadRequestException('Invalid workspace ID in callback');
        }
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
                config: this.encryptIntegrationConfig(tokens),
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

    async handleOutlookCallback(code: string, state: string, organizationId?: string) {
        const workspaceId = this.verifyOAuthState(state);
        if (!workspaceId || workspaceId === 'null' || workspaceId === 'undefined') {
            throw new BadRequestException('Invalid workspace ID in callback');
        }
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
                config: this.encryptIntegrationConfig(tokens),
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

    private createOAuthState(workspaceId: string): string {
        const secret = process.env.INTEGRATION_STATE_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            throw new BadRequestException('Integration state secret is not configured');
        }

        const payload = `${workspaceId}.${Date.now()}`;
        const signature = createHmac('sha256', secret).update(payload).digest('hex');
        return Buffer.from(`${payload}.${signature}`).toString('base64url');
    }

    private verifyOAuthState(state: string): string {
        const secret = process.env.INTEGRATION_STATE_SECRET || process.env.JWT_SECRET;
        if (!secret) {
            throw new BadRequestException('Integration state secret is not configured');
        }

        let decoded = '';
        try {
            decoded = Buffer.from(state, 'base64url').toString('utf8');
        } catch {
            throw new BadRequestException('Invalid OAuth state encoding');
        }

        const [workspaceId, timestamp, signature] = decoded.split('.');
        if (!workspaceId || !timestamp || !signature) {
            throw new BadRequestException('Invalid OAuth state format');
        }

        const payload = `${workspaceId}.${timestamp}`;
        const expected = createHmac('sha256', secret).update(payload).digest('hex');
        if (expected !== signature) {
            throw new BadRequestException('Invalid OAuth state signature');
        }

        const ageMs = Date.now() - Number(timestamp);
        if (!Number.isFinite(ageMs) || ageMs > 10 * 60 * 1000) {
            throw new BadRequestException('OAuth state expired');
        }

        return workspaceId;
    }

    private encryptIntegrationConfig(config: unknown): string {
        const rawKey = process.env.INTEGRATIONS_ENCRYPTION_KEY;
        if (!rawKey) {
            throw new BadRequestException('INTEGRATIONS_ENCRYPTION_KEY must be set');
        }

        const key = this.to32ByteKey(rawKey);
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', key, iv);
        const plaintext = Buffer.from(JSON.stringify(config), 'utf8');
        const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const tag = cipher.getAuthTag();

        return `${this.encryptedPrefix}${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`;
    }

    private to32ByteKey(input: string): Buffer {
        try {
            const maybeBase64 = Buffer.from(input, 'base64');
            if (maybeBase64.length === 32) {
                return maybeBase64;
            }
        } catch {
            // Fall back to hashed key derivation for non-base64 secrets.
        }

        return createHmac('sha256', input).update('integrations-key').digest();
    }
}
