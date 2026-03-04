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
            this.logger.error(`Login error: ${error.message}`);
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
}
