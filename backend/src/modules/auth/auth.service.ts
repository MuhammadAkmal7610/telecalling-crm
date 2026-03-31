import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private supabaseService: SupabaseService,
        private workspacesService: WorkspacesService,
    ) { }

    async signup(signupDto: SignupDto) {
        const adminSupabase = this.supabaseService.getAdminClient();

        // 0. Check if user already exists to prevent orphans
        const { data, error: listError } = await adminSupabase.auth.admin.listUsers();
        if (listError) {
            this.logger.error(`Error listing users: ${listError.message}`);
        }

        const existingUser = data?.users?.find(u => (u as any).email === signupDto.email);
        if (existingUser) {
            throw new BadRequestException('A user with this email address has already been registered. Please log in.');
        }

        // Only allow signup if orgName is provided (org creation), otherwise block (no public signup)
        if (!signupDto.orgName) {
            throw new BadRequestException('Signup is only allowed for organization owners. Team members must use their invite link.');
        }

        // 0b. Check if organization name exists
        const existingOrg = await this.workspacesService.findByName(signupDto.orgName);
        if (existingOrg) {
            throw new BadRequestException(`An organization with the name "${signupDto.orgName}" already exists. Please choose a different name.`);
        }

        // 1. Create Organization
        let org;
        try {
            org = await this.workspacesService.create(signupDto.orgName);
        } catch (error) {
            throw new BadRequestException(`Organization creation failed: ${error.message}`);
        }

        // 2. Sign up user in Supabase Auth using Admin Client
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: signupDto.email,
            password: signupDto.password,
            email_confirm: true,
            user_metadata: {
                full_name: signupDto.name || signupDto.orgName,
                org_name: signupDto.orgName,
                phone: signupDto.phone,
                role: 'root',          // Org founder is always root
                organization_id: org.id,
                signup_completed: true,
            },
        });

        if (authError || !authData.user) {
            // Clean up the created org if user creation fails
            await adminSupabase.from('organizations').delete().eq('id', org.id);
            this.logger.error(`Signup error: ${authError?.message || 'User creation failed'}`);
            throw new BadRequestException(authError?.message || 'User creation failed');
        }

        // 3. Create entry in users table
        const { error: userError } = await adminSupabase
            .from('users')
            .insert({
                id: authData.user.id,
                organization_id: org.id,
                email: signupDto.email,
                name: signupDto.name || signupDto.orgName,
                role: 'root',          // Org founder = root
                status: 'Working',
            });

        if (userError) {
            this.logger.error(`User record creation error: ${userError.message}`);
        }

        // 4. Create a default workspace for this org and enroll the owner
        let defaultWorkspace: any = null;
        try {
            defaultWorkspace = await this.workspacesService.createDefaultWorkspace(
                org.id,
                authData.user.id,
                signupDto.orgName,
            );
        } catch (wsError) {
            this.logger.warn(`Default workspace creation failed: ${wsError.message}`);
        }

        return {
            message: 'Signup successful. You can now log in.',
            user: authData.user,
            organization: org,
            defaultWorkspace,
        };
    }


    async login(loginDto: LoginDto) {
        const supabase = this.supabaseService.getClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginDto.email,
            password: loginDto.password,
        });

        if (error) {
            this.logger.error(`Login failed for email: ${loginDto.email}. Error: ${error.message}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: data.user,
        };
    }

    async signOut() {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.auth.signOut();
        if (error) throw new BadRequestException(error.message);
        return { message: 'Signed out successfully' };
    }

    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordDto.email, {
            redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password`,
        });

        if (error) {
            this.logger.error(`Forgot password error: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return { message: 'Password reset link sent to your email' };
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase.auth.updateUser({
            password: resetPasswordDto.password,
        });

        if (error) {
            this.logger.error(`Reset password error: ${error.message}`);
            throw new BadRequestException(error.message);
        }

        return { message: 'Password has been reset successfully' };
    }

    async signupInvite(signupDto: any, token: string) {
        const adminSupabase = this.supabaseService.getAdminClient();

        // 1. Verify invitation
        const { data: invite, error: inviteError } = await adminSupabase
            .from('invitations')
            .select('*')
            .eq('token', token)
            .eq('status', 'pending')
            .maybeSingle();

        if (inviteError || !invite) {
            throw new BadRequestException('Invalid or expired invitation token');
        }

        // 2. Sign up user in Supabase Auth
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: signupDto.email,
            password: signupDto.password,
            email_confirm: true,
            user_metadata: {
                full_name: signupDto.name,
                phone: signupDto.phone,
                role: invite.role,
                organization_id: invite.organization_id,
                signup_completed: true,
            },
        });

        if (authError || !authData?.user) {
            this.logger.error(`Signup error: ${authError?.message || 'User creation failed'}`);
            throw new BadRequestException(authError?.message || 'User creation failed');
        }

        const userId = authData.user.id;

        // 3. Create entry in users table
        const { error: userError } = await adminSupabase
            .from('users')
            .insert({
                id: userId,
                organization_id: invite.organization_id,
                email: signupDto.email,
                name: signupDto.name,
                role: invite.role,
                status: 'Working',
            });

        if (userError) {
            this.logger.error(`User record creation error: ${userError.message}`);
        }

        // 4. Link to workspace if specified in invitation
        if (invite.workspace_id) {
            await adminSupabase.from('workspace_members').upsert({
                workspace_id: invite.workspace_id,
                user_id: userId,
                role: invite.role === 'admin' ? 'admin' : 'caller'
            }, { onConflict: 'workspace_id,user_id' });
        } else {
             // Find default workspace of the organization
             const { data: defaultWs } = await adminSupabase
             .from('workspaces')
             .select('id')
             .eq('organization_id', invite.organization_id)
             .eq('is_default', true)
             .maybeSingle();
         
             if (defaultWs) {
                 await adminSupabase.from('workspace_members').upsert({
                     workspace_id: defaultWs.id,
                     user_id: userId,
                     role: invite.role === 'admin' ? 'admin' : 'caller'
                 }, { onConflict: 'workspace_id,user_id' });
             }
        }

        // 5. Mark invitation as accepted
        await adminSupabase.from('invitations').update({ status: 'accepted' }).eq('id', invite.id);

        return {
            message: 'Signup successful. You can now log in.',
            user: authData.user,
        };
    }
}
