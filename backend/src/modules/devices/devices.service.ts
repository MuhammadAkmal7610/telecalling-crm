import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

export interface RegisterDeviceDto {
    deviceToken: string;
    deviceType: 'ios' | 'android' | 'web';
    deviceName?: string;
    pushToken?: string;
}

export interface DeviceInfo {
    id: string;
    user_id: string;
    device_token: string;
    device_type: string;
    device_name: string;
    push_token: string;
    is_active: boolean;
    last_seen_at: string;
    created_at: string;
}

@Injectable()
export class DevicesService {
    private readonly logger = new Logger(DevicesService.name);
    private readonly TABLE = 'devices';

    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async registerDevice(userId: string, dto: RegisterDeviceDto): Promise<DeviceInfo> {
        const supabase = this.supabaseService.getAdminClient();

        // Check if device already exists
        const { data: existingDevice } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('device_token', dto.deviceToken)
            .single();

        if (existingDevice) {
            // Update existing device
            const { data, error } = await supabase
                .from(this.TABLE)
                .update({
                    is_active: true,
                    last_seen_at: new Date().toISOString(),
                    push_token: dto.pushToken || existingDevice.push_token,
                    device_name: dto.deviceName || existingDevice.device_name,
                })
                .eq('id', existingDevice.id)
                .select()
                .single();

            if (error) throw new BadRequestException(error.message);
            this.logger.log(`Device updated: ${data.id}`);
            return data;
        }

        // Create new device
        const { data, error } = await supabase
            .from(this.TABLE)
            .insert({
                user_id: userId,
                device_token: dto.deviceToken,
                device_type: dto.deviceType,
                device_name: dto.deviceName || `${dto.deviceType} Device`,
                push_token: dto.pushToken,
                is_active: true,
                last_seen_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
        this.logger.log(`Device registered: ${data.id}`);
        return data;
    }

    async unregisterDevice(deviceId: string): Promise<void> {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .update({ is_active: false, last_seen_at: new Date().toISOString() })
            .eq('id', deviceId);

        if (error) throw new BadRequestException(error.message);
        this.logger.log(`Device unregistered: ${deviceId}`);
    }

    async getActiveDeviceForUser(userId: string): Promise<DeviceInfo | null> {
        const supabase = this.supabaseService.getAdminClient();
        const { data } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('last_seen_at', { ascending: false })
            .limit(1)
            .single();

        return data || null;
    }

    async getAllActiveDevicesForUser(userId: string): Promise<DeviceInfo[]> {
        const supabase = this.supabaseService.getAdminClient();
        const { data, error } = await supabase
            .from(this.TABLE)
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('last_seen_at', { ascending: false });

        if (error) return [];
        return data || [];
    }

    async updateDeviceStatus(deviceId: string, isOnline: boolean): Promise<void> {
        const supabase = this.supabaseService.getAdminClient();
        const { error } = await supabase
            .from(this.TABLE)
            .update({
                is_active: isOnline,
                last_seen_at: new Date().toISOString(),
            })
            .eq('id', deviceId);

        if (error) throw new BadRequestException(error.message);
    }

    async sendCallRequestToDevice(
        userId: string,
        callData: {
            leadId: string;
            leadName: string;
            leadPhone: string;
            workspaceId: string;
            organizationId: string;
        },
    ): Promise<{ success: boolean; deviceId?: string; message: string }> {
        // Get active device for user
        const device = await this.getActiveDeviceForUser(userId);

        if (!device) {
            return {
                success: false,
                message: 'No active device found for user',
            };
        }

        // Send via WebSocket if device is connected
        this.notificationsGateway.sendCallRequestToDevice(device.id, {
            action: 'initiate_call',
            leadId: callData.leadId,
            leadName: callData.leadName,
            leadPhone: callData.leadPhone,
            workspaceId: callData.workspaceId,
            organizationId: callData.organizationId,
            timestamp: new Date().toISOString(),
        });

        this.logger.log(`Call request sent to device ${device.id} for user ${userId}`);

        return {
            success: true,
            deviceId: device.id,
            message: 'Call request sent to device',
        };
    }

    async cleanupInactiveDevices(): Promise<number> {
        const supabase = this.supabaseService.getAdminClient();
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from(this.TABLE)
            .update({ is_active: false })
            .lt('last_seen_at', oneHourAgo)
            .eq('is_active', true)
            .select();

        if (error) return 0;
        return data?.length || 0;
    }
}