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
import { Injectable, Logger } from '@nestjs/common';
import { TelephonyService } from './telephony.service';
import { DevicesService } from '../devices/devices.service';

export interface CallSession {
  id: string;
  agentId: string;
  leadId: string;
  status: 'initiating' | 'dialing' | 'connected' | 'ended' | 'missed';
  startTime: string;
  duration: number;
  workspaceId: string;
  organizationId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'telephony',
})
@Injectable()
export class TelephonyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TelephonyGateway.name);

  // Track active call sessions
  private activeCalls = new Map<string, CallSession>();
  
  // Track connected devices: deviceId -> socketId
  private connectedDevices = new Map<string, string>();
  
  // Track connected agents: agentId -> socketId
  private connectedAgents = new Map<string, string>();

  constructor(
    private readonly telephonyService: TelephonyService,
    private readonly devicesService: DevicesService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const deviceId = client.handshake.query.deviceId as string;
    const agentId = client.handshake.query.agentId as string;

    if (deviceId) {
      this.connectedDevices.set(deviceId, client.id);
      this.logger.log(`Device ${deviceId} connected to telephony gateway`);
    }

    if (agentId) {
      this.connectedAgents.set(agentId, client.id);
      this.logger.log(`Agent ${agentId} connected to telephony gateway`);
    }

    // Send connection confirmation
    client.emit('connected', {
      status: 'connected',
      deviceId,
      agentId,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    // Remove device connection
    for (const [deviceId, socketId] of this.connectedDevices.entries()) {
      if (socketId === client.id) {
        this.connectedDevices.delete(deviceId);
        this.logger.log(`Device ${deviceId} disconnected from telephony gateway`);
        break;
      }
    }

    // Remove agent connection
    for (const [agentId, socketId] of this.connectedAgents.entries()) {
      if (socketId === client.id) {
        this.connectedAgents.delete(agentId);
        this.logger.log(`Agent ${agentId} disconnected from telephony gateway`);
        break;
      }
    }
  }

  /**
   * Initiate a call from web to mobile device
   */
  @SubscribeMessage('initiate_call')
  async handleInitiateCall(
    @MessageBody() data: {
      agentId: string;
      leadId: string;
      leadName: string;
      leadPhone: string;
      workspaceId: string;
      organizationId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { agentId, leadId, leadName, leadPhone, workspaceId, organizationId } = data;

    try {
      // Get active device for the agent
      const device = await this.devicesService.getActiveDeviceForUser(agentId);

      if (!device) {
        return {
          status: 'error',
          message: 'No active device found for agent',
        };
      }

      // Create call session
      const callSession: CallSession = {
        id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        leadId,
        status: 'initiating',
        startTime: new Date().toISOString(),
        duration: 0,
        workspaceId,
        organizationId,
      };

      this.activeCalls.set(callSession.id, callSession);

      // Send call request to mobile device
      const deviceSocketId = this.connectedDevices.get(device.id);
      if (deviceSocketId) {
        this.server.to(deviceSocketId).emit('incoming_call', {
          callId: callSession.id,
          leadId,
          leadName,
          leadPhone,
          agentId,
          workspaceId,
          organizationId,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`Call request sent to device ${device.id}`);

        return {
          status: 'success',
          callId: callSession.id,
          message: 'Call request sent to device',
        };
      } else {
        this.activeCalls.delete(callSession.id);
        return {
          status: 'error',
          message: 'Device is not connected',
        };
      }
    } catch (error: any) {
      this.logger.error(`Error initiating call: ${error.message}`);
      return {
        status: 'error',
        message: 'Failed to initiate call',
      };
    }
  }

  /**
   * Mobile device accepts incoming call
   */
  @SubscribeMessage('accept_call')
  async handleAcceptCall(
    @MessageBody() data: {
      callId: string;
      deviceId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, deviceId } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Update call status
    callSession.status = 'dialing';

    // Notify agent that call is being dialed
    const agentSocketId = this.connectedAgents.get(callSession.agentId);
    if (agentSocketId) {
      this.server.to(agentSocketId).emit('call_status_update', {
        callId,
        status: 'dialing',
        message: 'Calling...',
        timestamp: new Date().toISOString(),
      });
    }

    this.logger.log(`Call ${callId} accepted by device ${deviceId}`);

    return { status: 'success', message: 'Call accepted' };
  }

  /**
   * Mobile device reports call connected
   */
  @SubscribeMessage('call_connected')
  async handleCallConnected(
    @MessageBody() data: {
      callId: string;
      deviceId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, deviceId } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Update call status
    callSession.status = 'connected';
    callSession.startTime = new Date().toISOString();

    // Create call record in database
    try {
      const callRecord = await this.telephonyService.initiateCall(
        {
          lead_id: callSession.leadId,
          agent_id: callSession.agentId,
          status: 'connected',
          direction: 'outbound',
          workspace_id: callSession.workspaceId,
          organization_id: callSession.organizationId,
        },
        { id: callSession.agentId },
      );

      // Update call session with database ID
      callSession.id = callRecord.id;

      // Notify agent that call is connected
      const agentSocketId = this.connectedAgents.get(callSession.agentId);
      if (agentSocketId) {
        this.server.to(agentSocketId).emit('call_status_update', {
          callId: callRecord.id,
          status: 'connected',
          message: 'Call connected',
          timestamp: new Date().toISOString(),
        });
      }

      this.logger.log(`Call ${callId} connected`);
    } catch (error: any) {
      this.logger.error(`Error creating call record: ${error.message}`);
    }

    return { status: 'success', message: 'Call connected' };
  }

  /**
   * Mobile device reports call ended
   */
  @SubscribeMessage('call_ended')
  async handleCallEnded(
    @MessageBody() data: {
      callId: string;
      deviceId: string;
      duration: number;
      status: string;
      notes?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, duration, status, notes } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Update call status
    callSession.status = 'ended';
    callSession.duration = duration;

    // Update call record in database
    try {
      await this.telephonyService.updateCall(callId, {
        status: 'ended',
        duration,
        call_status: status,
        notes,
      }, callSession.agentId);

      // Notify agent that call has ended
      const agentSocketId = this.connectedAgents.get(callSession.agentId);
      if (agentSocketId) {
        this.server.to(agentSocketId).emit('call_ended', {
          callId,
          duration,
          status,
          notes,
          timestamp: new Date().toISOString(),
        });
      }

      // Clean up active call
      this.activeCalls.delete(callId);

      this.logger.log(`Call ${callId} ended - Duration: ${duration}s, Status: ${status}`);
    } catch (error: any) {
      this.logger.error(`Error updating call record: ${error.message}`);
    }

    return { status: 'success', message: 'Call ended' };
  }

  /**
   * Agent ends call from web interface
   */
  @SubscribeMessage('end_call')
  async handleAgentEndCall(
    @MessageBody() data: {
      callId: string;
      agentId: string;
      status: string;
      notes?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, agentId, status, notes } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Calculate duration
    const duration = Math.floor(
      (new Date().getTime() - new Date(callSession.startTime).getTime()) / 1000,
    );

    // Update call status
    callSession.status = 'ended';
    callSession.duration = duration;

    // Notify mobile device to end call
    const device = await this.devicesService.getActiveDeviceForUser(agentId);
    if (device) {
      const deviceSocketId = this.connectedDevices.get(device.id);
      if (deviceSocketId) {
        this.server.to(deviceSocketId).emit('end_call', {
          callId,
          status,
          notes,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Update call record in database
    try {
      await this.telephonyService.updateCall(callId, {
        status: 'ended',
        duration,
        call_status: status,
        notes,
      }, agentId);

      // Clean up active call
      this.activeCalls.delete(callId);

      this.logger.log(`Call ${callId} ended by agent - Duration: ${duration}s`);
    } catch (error: any) {
      this.logger.error(`Error updating call record: ${error.message}`);
    }

    return { status: 'success', message: 'Call ended' };
  }

  /**
   * Get active call status
   */
  @SubscribeMessage('get_call_status')
  handleGetCallStatus(
    @MessageBody() data: { callId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId } = data;
    const callSession = this.activeCalls.get(callId);

    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    return {
      status: 'success',
      call: {
        callId: callSession.id,
        status: callSession.status,
        duration: callSession.duration,
        leadId: callSession.leadId,
        agentId: callSession.agentId,
        startTime: callSession.startTime,
      },
    };
  }

  /**
   * Send DTMF tones (for IVR navigation)
   */
  @SubscribeMessage('send_dtmf')
  handleSendDTMF(
    @MessageBody() data: {
      callId: string;
      tone: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, tone } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Notify mobile device to play DTMF tone
    const device = this.devicesService.getActiveDeviceForUser(callSession.agentId)
      .then(device => {
        if (device) {
          const deviceSocketId = this.connectedDevices.get(device.id);
          if (deviceSocketId) {
            this.server.to(deviceSocketId).emit('play_dtmf', {
              callId,
              tone,
            });
          }
        }
      })
      .catch(() => {});

    return { status: 'success', message: 'DTMF tone sent' };
  }

  /**
   * Mute/unmute call
   */
  @SubscribeMessage('toggle_mute')
  handleToggleMute(
    @MessageBody() data: {
      callId: string;
      isMuted: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, isMuted } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Notify mobile device to toggle mute
    this.devicesService.getActiveDeviceForUser(callSession.agentId)
      .then(device => {
        if (device) {
          const deviceSocketId = this.connectedDevices.get(device.id);
          if (deviceSocketId) {
            this.server.to(deviceSocketId).emit('toggle_mute', {
              callId,
              isMuted,
            });
          }
        }
      })
      .catch(() => {});

    return { status: 'success', message: 'Mute toggled' };
  }

  /**
   * Toggle speaker
   */
  @SubscribeMessage('toggle_speaker')
  handleToggleSpeaker(
    @MessageBody() data: {
      callId: string;
      isSpeakerOn: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { callId, isSpeakerOn } = data;

    const callSession = this.activeCalls.get(callId);
    if (!callSession) {
      return { status: 'error', message: 'Call session not found' };
    }

    // Notify mobile device to toggle speaker
    this.devicesService.getActiveDeviceForUser(callSession.agentId)
      .then(device => {
        if (device) {
          const deviceSocketId = this.connectedDevices.get(device.id);
          if (deviceSocketId) {
            this.server.to(deviceSocketId).emit('toggle_speaker', {
              callId,
              isSpeakerOn,
            });
          }
        }
      })
      .catch(() => {});

    return { status: 'success', message: 'Speaker toggled' };
  }

  /**
   * Broadcast call analytics to dashboard
   */
  broadcastCallAnalytics(organizationId: string, analytics: any) {
    // Find all connected agents in this organization
    for (const [agentId, socketId] of this.connectedAgents.entries()) {
      this.server.to(socketId).emit('call_analytics_update', {
        organizationId,
        ...analytics,
      });
    }
  }

  /**
   * Get connected devices count
   */
  getConnectedDevicesCount(): number {
    return this.connectedDevices.size;
  }

  /**
   * Get connected agents count
   */
  getConnectedAgentsCount(): number {
    return this.connectedAgents.size;
  }

  /**
   * Get active calls count
   */
  getActiveCallsCount(): number {
    return this.activeCalls.size;
  }
}