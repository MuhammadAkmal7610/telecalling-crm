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
            const { data: org, error: orgError } = await supabase
                .from('organizations')
                .select('name')
                .eq('id', organizationId)
                .single();
            
            if (orgError) {
                this.logger.error(`Failed to fetch organization name for ID ${organizationId}: ${orgError.message}`);
            }
            
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

    async resendInvitation(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Get the invitation
        const { data: invitation, error: fetchError } = await supabase
            .from(this.TABLE_NAME)
            .select('*, organization:organizations(name)')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .eq('status', 'pending')
            .maybeSingle();

        if (fetchError || !invitation) {
            throw new NotFoundException('Invitation not found or already used/cancelled');
        }

        // Check expiry
        if (new Date(invitation.expires_at) < new Date()) {
            await supabase.from(this.TABLE_NAME).update({ status: 'expired' }).eq('id', invitation.id);
            throw new BadRequestException('Invitation has expired');
        }

        // Get inviter details
        const { data: inviter } = await supabase
            .from('users')
            .select('name')
            .eq('id', invitation.invited_by)
            .maybeSingle();

        // Generate new invite URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteUrl = `${frontendUrl}/invite/${invitation.token}`;
        
        const inviterName = inviter?.name || 'An admin';
        const orgName = invitation.organization?.name || 'Our Organization';

        // Get sender details
        const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@crm.com';
        const senderName = process.env.SENDER_NAME || 'CRM Invitations';

        // Send email
        try {
            await this.emailService.sendEmail({
                to: invitation.email,
                from: senderEmail,
                senderName: senderName,
                subject: `Reminder: Invitation to join ${orgName}`,
                content: `You have been invited to join ${orgName} on our CRM platform. Accept invitation: ${inviteUrl}`,
                htmlContent: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #3B82F6;">Reminder: You're invited!</h2>
                        <p>${inviterName} has invited you to join <strong>${orgName}</strong> on TeleCRM.</p>
                        <p>Click the button below to accept the invitation and set up your account:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept & Join Organization</a>
                        </div>
                        <p style="color: #666; font-size: 0.9em;">This invitation will expire on ${new Date(invitation.expires_at).toLocaleDateString()}.</p>
                        <p style="color: #666; font-size: 0.8em; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser: <br>${inviteUrl}</p>
                    </div>
                `,
            });
            this.logger.log(`Invitation email resent to ${invitation.email}`);
        } catch (emailError) {
            this.logger.error(`Failed to resend invitation email to ${invitation.email}:`, emailError);
            throw new BadRequestException('Failed to send invitation email');
        }

        // Update updated_at timestamp
        await supabase
            .from(this.TABLE_NAME)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', id);

        return { message: 'Invitation email resent successfully' };
    }

    async getSettings(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        const { data, error } = await supabase
            .from('organization_settings')
            .select('invitation_settings')
            .eq('organization_id', organizationId)
            .maybeSingle();

        if (error || !data) {
            // Return defaults
            return {
                defaultExpiryDays: 7,
                autoReminders: true,
                requireApproval: false,
                defaultRole: 'caller',
                emailTemplate: null
            };
        }

        return data.invitation_settings || {
            defaultExpiryDays: 7,
            autoReminders: true,
            requireApproval: false,
            defaultRole: 'caller',
            emailTemplate: null
        };
    }

    async updateSettings(organizationId: string, settings: any) {
        const supabase = this.supabaseService.getAdminClient();
        
        // Get existing settings
        const { data: existing } = await supabase
            .from('organization_settings')
            .select('invitation_settings')
            .eq('organization_id', organizationId)
            .maybeSingle();

        const currentSettings = existing?.invitation_settings || {
            defaultExpiryDays: 7,
            autoReminders: true,
            requireApproval: false,
            defaultRole: 'caller',
            emailTemplate: null
        };

        const updatedSettings = { ...currentSettings, ...settings };

        if (existing) {
            const { error } = await supabase
                .from('organization_settings')
                .update({ invitation_settings: updatedSettings })
                .eq('organization_id', organizationId);

            if (error) throw new BadRequestException(error.message);
        } else {
            const { error } = await supabase
                .from('organization_settings')
                .insert({
                    organization_id: organizationId,
                    invitation_settings: updatedSettings
                });

            if (error) throw new BadRequestException(error.message);
        }

        return updatedSettings;
    }

    // ==================== INVITE LINKS ====================

    async createInviteLink(dto: { name: string; role: string; maxUses?: number; expiresAt?: string; workspaceId?: string }, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const organizationId = user.organizationId || user.organization_id;

        if (!organizationId) {
            throw new BadRequestException('User is not associated with an organization');
        }

        // Generate token
        const token = crypto.randomUUID();
        
        // Set expiry (default 30 days if not provided)
        const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from('invite_links')
            .insert({
                name: dto.name,
                organization_id: organizationId,
                workspace_id: dto.workspaceId || null,
                created_by: user.id,
                role: dto.role || 'caller',
                token,
                max_uses: dto.maxUses || null,
                uses_count: 0,
                expires_at: expiresAt.toISOString(),
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Failed to create invite link: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return data;
    }

    async listInviteLinks(organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('invite_links')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });
        
        if (error) throw new BadRequestException(error.message);
        return data || [];
    }

    async getInviteLinkByToken(token: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from('invite_links')
            .select('*, organization:organizations(name)')
            .eq('token', token)
            .eq('is_active', true)
            .maybeSingle();

        if (error || !data) throw new NotFoundException('Invite link not found or inactive');

        // Check expiry
        if (new Date(data.expires_at) < new Date()) {
            throw new BadRequestException('Invite link has expired');
        }

        // Check max uses
        if (data.max_uses && data.uses_count >= data.max_uses) {
            throw new BadRequestException('Invite link has reached maximum uses');
        }

        return data;
    }

    async useInviteLink(token: string, userId: string) {
        const link = await this.getInviteLinkByToken(token);
        const supabase = this.supabaseService.getAdminClient();

        // 1. Link user to organization
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
                organization_id: link.organization_id,
                role: link.role 
            })
            .eq('id', userId);

        if (userUpdateError) throw new BadRequestException(`Failed to associate user with organization: ${userUpdateError.message}`);

        // 2. Add to workspace
        if (link.workspace_id) {
            await supabase.from('workspace_members').upsert({
                workspace_id: link.workspace_id,
                user_id: userId,
                role: link.role === 'admin' ? 'admin' : 'caller'
            }, { onConflict: 'workspace_id,user_id' });
        } else {
            // Find default workspace
            const { data: defaultWs } = await supabase
                .from('workspaces')
                .select('id')
                .eq('organization_id', link.organization_id)
                .eq('is_default', true)
                .maybeSingle();
            
            if (defaultWs) {
                await supabase.from('workspace_members').upsert({
                    workspace_id: defaultWs.id,
                    user_id: userId,
                    role: link.role === 'admin' ? 'admin' : 'caller'
                }, { onConflict: 'workspace_id,user_id' });
            }
        }

        // 3. Increment uses count
        await supabase
            .from('invite_links')
            .update({ uses_count: link.uses_count + 1 })
            .eq('id', link.id);

        return { message: 'Joined organization successfully', organizationId: link.organization_id };
    }

    async toggleInviteLink(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        
        const { data, error } = await supabase
            .from('invite_links')
            .select('is_active')
            .eq('id', id)
            .eq('organization_id', organizationId)
            .maybeSingle();

        if (error || !data) throw new NotFoundException('Invite link not found');

        const { error: updateError } = await supabase
            .from('invite_links')
            .update({ is_active: !data.is_active })
            .eq('id', id);

        if (updateError) throw new BadRequestException(updateError.message);

        return { message: `Invite link ${!data.is_active ? 'activated' : 'deactivated'}` };
    }

    async deleteInviteLink(id: string, organizationId: string) {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from('invite_links')
            .delete()
            .eq('id', id)
            .eq('organization_id', organizationId);
        
        if (error) throw new BadRequestException(error.message);
        return { message: 'Invite link deleted' };
    }

    // ==================== BULK INVITATIONS ====================

    async bulkInvite(users: Array<{ email: string; name?: string; role?: string }>, user: any) {
        const supabase = this.supabaseService.getAdminClient();
        const organizationId = user.organizationId || user.organization_id;

        if (!organizationId) {
            throw new BadRequestException('User is not associated with an organization');
        }

        const results: { success: any[]; failed: Array<{ email: string; reason: string }> } = { success: [], failed: [] };
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Get organization name
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single();
        
        if (orgError) {
            this.logger.error(`Failed to fetch organization name for ID ${organizationId}: ${orgError.message}`);
        }
        
        const orgName = org?.name || 'Our Organization';
        const senderEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER || 'noreply@crm.com';
        const senderName = process.env.SENDER_NAME || 'CRM Invitations';

        for (const userData of users) {
            try {
                // Check if user already exists
                const { data: existingUser } = await supabase
                    .from('users')
                    .select('id')
                    .eq('email', userData.email)
                    .eq('organization_id', organizationId)
                    .maybeSingle();

                if (existingUser) {
                    results.failed.push({ email: userData.email, reason: 'User already exists' });
                    continue;
                }

                // Generate token and expiry
                const token = crypto.randomUUID();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                const { data, error } = await supabase
                    .from('invitations')
                    .insert({
                        email: userData.email,
                        organization_id: organizationId,
                        invited_by: user.id,
                        role: userData.role || 'caller',
                        token,
                        expires_at: expiresAt.toISOString(),
                        status: 'pending',
                    })
                    .select()
                    .single();

                if (error) {
                    results.failed.push({ email: userData.email, reason: error.message });
                    continue;
                }

                // Send email
                const inviteUrl = `${frontendUrl}/invite/${token}`;
                try {
                    await this.emailService.sendEmail({
                        to: userData.email,
                        from: senderEmail,
                        senderName: senderName,
                        subject: `Invitation to join ${orgName}`,
                        content: `You have been invited to join ${orgName} on TeleCRM. Accept invitation: ${inviteUrl}`,
                        htmlContent: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #3B82F6;">You're invited!</h2>
                                <p>${user.name || 'An admin'} has invited you to join <strong>${orgName}</strong> on TeleCRM.</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept & Join Organization</a>
                                </div>
                            </div>
                        `,
                    });
                } catch (emailError) {
                    this.logger.warn(`Failed to send email to ${userData.email}: ${emailError.message}`);
                }

                results.success.push(data);
            } catch (err) {
                results.failed.push({ email: userData.email, reason: err.message });
            }
        }

        return results;
    }

    // ==================== INVITATION ANALYTICS ====================

    async getAnalytics(organizationId: string, timeRange: string = 'month') {
        const supabase = this.supabaseService.getAdminClient();
        
        const dateFrom = new Date();
        switch (timeRange) {
            case 'day':
                dateFrom.setDate(dateFrom.getDate() - 1);
                break;
            case 'week':
                dateFrom.setDate(dateFrom.getDate() - 7);
                break;
            case 'month':
                dateFrom.setMonth(dateFrom.getMonth() - 1);
                break;
            case 'year':
                dateFrom.setFullYear(dateFrom.getFullYear() - 1);
                break;
        }

        // Get all invitations for the organization
        const { data: invitations } = await supabase
            .from('invitations')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('created_at', dateFrom.toISOString());

        if (!invitations) {
            return {
                totalSent: 0,
                accepted: 0,
                expired: 0,
                cancelled: 0,
                pending: 0,
                acceptanceRate: 0,
                dailyStats: []
            };
        }

        const stats = {
            totalSent: invitations.length,
            accepted: invitations.filter(i => i.status === 'accepted').length,
            expired: invitations.filter(i => i.status === 'expired').length,
            cancelled: invitations.filter(i => i.status === 'cancelled').length,
            pending: invitations.filter(i => i.status === 'pending').length,
            acceptanceRate: invitations.length > 0 
                ? (invitations.filter(i => i.status === 'accepted').length / invitations.length) * 100 
                : 0
        };

        // Daily stats for the last 30 days
        const dailyStats = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayInvitations = invitations.filter(inv => 
                new Date(inv.created_at).toISOString().split('T')[0] === dateStr
            );

            dailyStats.push({
                date: dateStr,
                sent: dayInvitations.length,
                accepted: dayInvitations.filter(i => i.status === 'accepted').length
            });
        }

        return { ...stats, dailyStats };
    }
}
