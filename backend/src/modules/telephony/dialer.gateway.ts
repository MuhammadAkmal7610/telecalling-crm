import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { TelephonyService } from './telephony.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'dialer',
})
export class DialerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active sessions: agent_id -> socket_id
  private activeSessions = new Map<string, string>();

  constructor(private readonly telephonyService: TelephonyService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.activeSessions.set(userId, client.id);
      console.log(`Agent ${userId} connected to dialer gateway`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.activeSessions.entries()) {
      if (socketId === client.id) {
        this.activeSessions.delete(userId);
        console.log(`Agent ${userId} disconnected from dialer gateway`);
        break;
      }
    }
  }

  @SubscribeMessage('start_session')
  handleStartSession(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { userId, workspaceId } = data;
    this.activeSessions.set(userId, client.id);
    return { status: 'success', message: 'Dialer session started' };
  }

  @SubscribeMessage('push_lead')
  handlePushLead(@MessageBody() data: any) {
    const { agentId, leadId, leadName, leadPhone } = data;
    const socketId = this.activeSessions.get(agentId);

    if (socketId) {
      this.server.to(socketId).emit('new_lead_to_call', {
        leadId,
        leadName,
        leadPhone,
      });
      return { status: 'success', message: 'Lead pushed to agent' };
    } else {
      return { status: 'error', message: 'Agent not online' };
    }
  }

  @SubscribeMessage('call_result')
  async handleCallResult(@MessageBody() data: any) {
    const { leadId, agentId, status, duration, notes, workspaceId, organization_id } = data;
    
    // Log the call in the database
    await this.telephonyService.logCall({
      lead_id: leadId,
      agent_id: agentId,
      status: status,
      duration: duration,
      notes: notes,
      direction: 'outbound',
      workspace_id: workspaceId,
      organization_id: organization_id,
    });

    return { status: 'success' };
  }
}
