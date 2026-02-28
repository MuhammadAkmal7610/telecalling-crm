import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
    private readonly logger = new Logger(SupabaseStrategy.name);

    constructor(private configService: ConfigService) {
        const supabaseUrl = configService.get<string>('SUPABASE_URL') || 'https://wjpkozfyebpiwlbpxwkw.supabase.co';
        const jwksUri = `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
        const secret =
            configService.get<string>('SUPABASE_JWT_SECRET') ||
            configService.get<string>('JWT_SECRET') ||
            'fallback-secret-please-set-env';

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true, // ---added by akmal--TEMPORARY: Enabled for demo to bypass "jwt expired" errors
            secretOrKeyProvider: (request, rawJwtToken, done) => {
                try {
                    const parts = rawJwtToken.split('.');
                    if (parts.length < 1) {
                        return done(new Error('Invalid token format'), undefined);
                    }
                    const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());

                    if (header.alg === 'HS256') {
                        this.logger.log('Verifying HS256 token (legacy/anon)');
                        return done(null, secret);
                    }

                    if (header.alg === 'ES256') {
                        this.logger.log('Verifying ES256 token via JWKS');
                        return passportJwtSecret({
                            cache: true,
                            rateLimit: true,
                            jwksRequestsPerMinute: 5,
                            jwksUri: jwksUri,
                        })(request, rawJwtToken, done);
                    }

                    this.logger.warn(`Unsupported algorithm: ${header.alg}`);
                    return done(new Error(`Unsupported algorithm: ${header.alg}`), undefined);
                } catch (e) {
                    this.logger.error(`Error in secretOrKeyProvider: ${e.message}`);
                    return done(e, undefined);
                }
            },
            algorithms: ['HS256', 'ES256'],
        });

        this.logger.log('SupabaseStrategy initialized with Multi-Algorithm support (HS256/ES256)');
        this.logger.log(`JWKS Endpoint: ${jwksUri}`);
    }

    async validate(payload: Record<string, any>) {
        if (!payload?.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role || payload.user_metadata?.role || 'user',
            appMetadata: payload.app_metadata,
            userMetadata: payload.user_metadata,
            organizationId: payload.user_metadata?.organization_id || payload.user_metadata?.org_id,
        };
    }
}
