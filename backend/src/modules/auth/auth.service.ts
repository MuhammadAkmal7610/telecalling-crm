import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
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

        // ---added by akmal--1. Create Organization
        let org;
        try {
            org = await this.workspacesService.create(signupDto.orgName);
        } catch (error) {
            throw new BadRequestException(`Organization creation failed: ${error.message}`);
        }

        // ---added by akmal--2. Sign up user in Supabase Auth using Admin Client (Bypasses email verification)
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: signupDto.email,
            password: signupDto.password,
            email_confirm: true, // ---added by akmal--Auto-confirm email
            user_metadata: {
                full_name: signupDto.orgName,
                org_name: signupDto.orgName,
                phone: signupDto.phone,
                role: 'admin',
                organization_id: org.id,
                signup_completed: true,
            },
        });

        if (authError || !authData.user) {
            this.logger.error(`Signup error: ${authError?.message || 'User creation failed'}`);
            throw new BadRequestException(authError?.message || 'User creation failed');
        }

        // ---added by akmal--3. Create entry in users table
        const { error: userError } = await adminSupabase
            .from('users')
            .insert({
                id: authData.user.id,
                organization_id: org.id,
                email: signupDto.email,
                name: signupDto.orgName,
                role: 'admin',
            });

        if (userError) {
            this.logger.error(`User record creation error: ${userError.message}`);
        }

        return {
            message: 'Signup successful. You can now log in.',
            user: authData.user,
            organization: org,
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
}
