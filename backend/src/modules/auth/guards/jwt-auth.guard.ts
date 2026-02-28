import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('supabase') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            this.logger.error(`Authentication failed: ${info?.message || err?.message || 'Unknown error'}`);
            if (info) {
                this.logger.debug(`Passport info: ${JSON.stringify(info)}`);
            }
            throw err || new UnauthorizedException('Unauthorized access');
        }
        return user;
    }
}
