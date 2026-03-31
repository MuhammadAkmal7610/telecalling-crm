import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { SupabaseService } from '../../supabase/supabase.service';
import { getHigherRole } from '../../../common/roles';

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
            configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('SUPABASE_JWT_SECRET or JWT_SECRET must be set');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            passReqToCallback: true, // needed to access x-workspace-id header
            secretOrKeyProvider: (request, rawJwtToken, done) => {
                try {
                    const parts = rawJwtToken.split('.');
                    if (parts.length < 1) {
                        return done(new Error('Invalid token format'), undefined);
                    }
                    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
                    this.logger.debug(`Incoming token algorithm: ${header.alg}`);
                    if (header.alg === 'HS256') {
                        // Supabase JWT secrets are usually base64 encoded.
                        // We need to decode them to a buffer for HS256 to work correctly.
                        const decodedSecret = Buffer.from(secret, 'base64');
                        return done(null, decodedSecret);
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
        let workspaceId = request.headers['x-workspace-id'] || null;
        if (workspaceId === 'undefined' || workspaceId === 'null') {
            workspaceId = null;
        }

        // Fetch the user's current role and organization from DB (single source of truth)
        const { data: userRecord, error: fetchError } = await supabase
            .from('users')
            .select('id, email, name, role, organization_id, status')
            .eq('id', payload.sub)
            .single();

        if (fetchError) {
            this.logger.warn(`Failed to fetch user record for ${payload.sub}: ${fetchError.message}`);
        } else {
            this.logger.debug(`User record found: id=${userRecord.id}, role=${userRecord.role}, org=${userRecord.organization_id}`);
        }

        if (userRecord && (userRecord.status === 'Suspended' || userRecord.status === 'Deleted')) {
            throw new UnauthorizedException(`Your account is ${userRecord.status.toLowerCase()}. Please contact your administrator.`);
        }

        // If user not found in DB, fall back to JWT metadata (e.g. during signup flow)
        const organizationId =
            userRecord?.organization_id ||
            payload.user_metadata?.organization_id ||
            payload.user_metadata?.org_id;

        // Resolve workspace-scoped role from workspace_members
        let finalRole = userRecord?.role || payload.user_metadata?.role || 'caller';

        if (workspaceId && userRecord) {
            const { data: membership } = await supabase
                .from('workspace_members')
                .select('role')
                .eq('workspace_id', workspaceId)
                .eq('user_id', payload.sub)
                .single();

            if (membership) {
                // Pick the higher role between organization and workspace membership
                finalRole = getHigherRole(userRecord.role, membership.role);
            }
        }

        const userObj = {
            id: payload.sub,
            email: userRecord?.email || payload.email,
            name: userRecord?.name,
            role: finalRole,             // Highest role found
            orgRole: userRecord?.role,   // always the org-level role
            organizationId,
            organization_id: organizationId, // for backward compatibility
            workspaceId,
            workspace_id: workspaceId,       // for backward compatibility
            status: userRecord?.status,
        };

        this.logger.debug(`SupabaseStrategy.validate returning user: ${JSON.stringify({
            id: userObj.id,
            email: userObj.email,
            role: userObj.role,
            orgRole: userObj.orgRole,
            orgId: userObj.organizationId,
            workspaceId: userObj.workspaceId
        })}`);

        return userObj;
    }
}
