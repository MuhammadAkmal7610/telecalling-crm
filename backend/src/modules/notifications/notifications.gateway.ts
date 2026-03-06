import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../supabase/supabase.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      
      // Join user to their personal room
      client.join(`user_${userId}`);
      
      // Join user to their organization room
      const orgId = decoded.organizationId;
      if (orgId) {
        client.join(`org_${orgId}`);
      }

      // Store connection
      this.connectedUsers.set(client.id, userId);
      
      console.log(`User ${userId} connected with socket ${client.id}`);
      
      // Send connection confirmation
      client.emit('connected', { status: 'connected', userId });
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`User ${userId} disconnected`);
    }
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  // Send notification to all users in organization
  sendNotificationToOrganization(organizationId: string, notification: any) {
    this.server.to(`org_${organizationId}`).emit('notification', notification);
  }

  // Send real-time updates for specific events
  sendLeadUpdate(organizationId: string, leadData: any) {
    this.server.to(`org_${organizationId}`).emit('lead_update', leadData);
  }

  sendCallUpdate(organizationId: string, callData: any) {
    this.server.to(`org_${organizationId}`).emit('call_update', callData);
  }

  sendTaskUpdate(userId: string, taskData: any) {
    this.server.to(`user_${userId}`).emit('task_update', taskData);
  }

  sendTaskUpdateToOrganization(organizationId: string, taskData: any) {
    this.server.to(`org_${organizationId}`).emit('task_update', taskData);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    client.emit('joined_room', { room: data.room });
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    client.emit('left_room', { room: data.room });
  }

  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(@MessageBody() data: { notificationId: string }, @ConnectedSocket() client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      const supabase = this.supabaseService.getAdminClient();
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', data.notificationId)
        .eq('user_id', userId);

      client.emit('notification_marked_read', { notificationId: data.notificationId });
    } catch (error) {
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  @SubscribeMessage('task_action')
  async handleTaskAction(@MessageBody() data: { taskId: string; action: string; data?: any }, @ConnectedSocket() client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (!userId) return;

    try {
      // Broadcast task action to organization
      const supabase = this.supabaseService.getAdminClient();
      const { data: user } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single();

      if (user?.organization_id) {
        this.sendTaskUpdateToOrganization(user.organization_id, {
          taskId: data.taskId,
          action: data.action,
          data: data.data,
          userId,
          timestamp: new Date().toISOString()
        });
      }

      client.emit('task_action_complete', { taskId: data.taskId, action: data.action });
    } catch (error) {
      client.emit('error', { message: 'Failed to process task action' });
    }
  }
}
