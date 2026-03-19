import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake.query?.token as string || client.handshake.headers?.authorization?.split(' ')[1];

      if (!authToken) {
        throw new WsException('Missing authentication token');
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET,
      });

      // Attach user to client for later use
      client.data.user = payload;
      return true;
    } catch (err) {
      this.logger.error(`WS Authentication failed: ${err.message}`);
      throw new WsException('Unauthorized access');
    }
  }
}
