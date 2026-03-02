import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
    private readonly logger = new Logger(SupabaseStrategy.name);

    constructor(
        private configService: ConfigService,
        private supabaseService: SupabaseService,
    ) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL') || 'https://wjpkozfyebpiwlbpxwkw.supabase.co';
        const jwksUri = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
        const secret =
            configService.get<string>('SUPABASE_JWT_SECRET') ||
            configService.get<string>('JWT_SECRET') ||
            'fallback-secret-please-set-env';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true, // TEMPORARY: for demo
            passReqToCallback: true, // needed to access x-workspace-id header
            secretOrKeyProvider: (request, rawJwtToken, done) => {
                try {
                    const parts = rawJwtToken.split('.');
                    if (parts.length < 1) {
                        return done(new Error('Invalid token format'), undefined);
                    }
                    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());

                    if (header.alg === 'HS256') {
                        return done(null, secret);
                    }

                    if (header.alg === 'ES256') {
                        return passportJwtSecret({
                            cache: true,
                            rateLimit: true,
                            jwksRequestsPerMinute: 5,
                            jwksUri: jwksUri,
                        })(request, rawJwtToken, done);
                    }

                    return done(new Error(`Unsupported algorithm: ${header.alg}`), undefined);
                } catch (e) {
                    return done(e, undefined);
                }
            },
            algorithms: ['HS256', 'ES256'],
        });

        this.logger.log('SupabaseStrategy initialized with Multi-Algorithm support (HS256/ES256)');
    }

    async validate(request: any, payload: Record<string, any>) {
        if (!payload?.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }

        const supabase = this.supabaseService.getAdminClient();
        const workspaceId = request.headers['x-workspace-id'] || null;

        // Fetch the user's current role and organization from DB (single source of truth)
        const { data: userRecord } = await supabase
            .from('users')
            .select('id, email, name, role, organization_id, status')
            .eq('id', payload.sub)
            .single();

        // If user not found in DB, fall back to JWT metadata (e.g. during signup flow)
        const organizationId =
            userRecord?.organization_id ||
            payload.user_metadata?.organization_id ||
            payload.user_metadata?.org_id;

        // If a workspace is specified, resolve workspace-scoped role from workspace_members
        let workspaceRole = userRecord?.role || payload.user_metadata?.role || 'caller';
        if (workspaceId && userRecord) {
            const { data: membership } = await supabase
                .from('workspace_members')
                .select('role')
                .eq('workspace_id', workspaceId)
                .eq('user_id', payload.sub)
                .single();

            if (membership) {
                workspaceRole = membership.role;
            }
        }

        return {
            id: payload.sub,
            email: userRecord?.email || payload.email,
            name: userRecord?.name,
            role: workspaceRole,         // workspace-scoped role (falls back to org role)
            orgRole: userRecord?.role,   // always the org-level role
            organizationId,
            workspaceId,
            status: userRecord?.status,
        };
    }
}
