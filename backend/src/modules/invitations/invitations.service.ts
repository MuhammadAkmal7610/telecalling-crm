import { Injectable, Logger, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
    private readonly logger = new Logger(InvitationsService.name);
    private readonly TABLE_NAME = 'invitations';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly emailService: EmailService,
    ) { }

    async createInvitation(dto: { email: string; role: string; workspaceId?: string }, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const organizationId = user.organizationId || user.organization_id;
        const invitedBy = user.id;

        if (!organizationId) {
            throw new BadRequestException('User is not associated with an organization');
        }

        // Check if user already exists in the organization
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', dto.email)
            .eq('organization_id', organizationId)
            .maybeSingle();

        if (existingUser) {
            throw new ConflictException('User is already a member of this organization');
        }

        // Generate token and expiry (7 days)
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .insert({
                email: dto.email,
                organization_id: organizationId,
                workspace_id: dto.workspaceId || null,
                invited_by: invitedBy,
                role: dto.role || 'caller',
                token,
                expires_at: expiresAt.toISOString(),
                status: 'pending',
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Failed to create invitation record: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        // Send Email
        try {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const inviteUrl = `${frontendUrl}/invite/${token}`;
            
            // Get organization name for the email
            const { data: org } = await supabase
                .from('organizations')
                .select('name')
                .eq('id', organizationId)
                .single();
            
            const orgName = org?.name || 'Our Organization';

            // Get sender details from environment or fallback
            const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@crm.com';
            const senderName = process.env.SENDER_NAME || 'CRM Invitations';

            await this.emailService.sendEmail({
                to: dto.email,
                from: senderEmail,
                senderName: senderName,
                subject: `Invitation to join ${orgName}`,
                content: `You have been invited to join ${orgName} on our CRM platform. Accept invitation: ${inviteUrl}`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #3B82F6;">You're invited!</h2>
                        <p>${user.name || 'An admin'} has invited you to join <strong>${orgName}</strong> on TeleCRM.</p>
                        <p>Click the button below to accept the invitation and set up your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept & Join Organization</a>
                        </div>
                        <p style="color: #666; font-size: 0.9em;">This invitation will expire in 7 days.</p>
                        <p style="color: #666; font-size: 0.8em; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser: <br>${inviteUrl}</p>
                    </div>
                `,
            });
            this.logger.log(`Invitation email sent to ${dto.email}`);
        } catch (emailError) {
            this.logger.error(`Failed to send invitation email to ${dto.email}:`, emailError);
            // We don't throw here to avoid rolling back the DB entry, but we log it.
        }

        return data;
    }

    async getInvitationByToken(token: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*, organization:organizations(name)')
            .eq('token', token)
            .eq('status', 'pending')
            .maybeSingle();

        if (error || !data) throw new NotFoundException('Invitation not found or already used');

        // Check expiry
        if (new Date(data.expires_at) < new Date()) {
            await supabase.from(this.TABLE_NAME).update({ status: 'expired' }).eq('id', data.id);
            throw new BadRequestException('Invitation has expired');
        }

        return data;
    }

    async acceptInvitation(token: string, userId: string) {
        const invite = await this.getInvitationByToken(token);
        const supabase = this.supabaseService.getAdminClient();

        // 1. Link user to organization
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
                organization_id: invite.organization_id,
                role: invite.role 
            })
            .eq('id', userId);

        if (userUpdateError) throw new BadRequestException(`Failed to associate user with organization: ${userUpdateError.message}`);

        // 2. Add to workspace
        const targetWorkspaceId = invite.workspace_id;
        
        if (targetWorkspaceId) {
            await supabase.from('workspace_members').upsert({
                workspace_id: targetWorkspaceId,
                user_id: userId,
                role: invite.role === 'admin' ? 'admin' : 'caller'
            }, { onConflict: 'workspace_id,user_id' });
        } else {
            // Find default workspace of the organization
            const { data: defaultWs } = await supabase
                .from('workspaces')
                .select('id')
                .eq('organization_id', invite.organization_id)
                .eq('is_default', true)
                .maybeSingle();
            
            if (defaultWs) {
                await supabase.from('workspace_members').upsert({
                    workspace_id: defaultWs.id,
                    user_id: userId,
                    role: invite.role === 'admin' ? 'admin' : 'caller'
                }, { onConflict: 'workspace_id,user_id' });
            }
        }

        // 3. Mark invitation as accepted
        await supabase.from(this.TABLE_NAME).update({ status: 'accepted' }).eq('id', invite.id);

        return { message: 'Invitation accepted successfully', organizationId: invite.organization_id };
    }

    async listPendingInvitations(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE_NAME)
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'pending');
        
        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async cancelInvitation(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE_NAME)
            .update({ status: 'cancelled' })
            .eq('id', id)
            .eq('organization_id', organizationId);
        
        if (error) throw new BadRequestException(error.message);
        return { message: 'Invitation cancelled' };
    }
}
