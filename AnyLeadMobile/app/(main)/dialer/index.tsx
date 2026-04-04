import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
  Vibration,
  useColorScheme,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '@/src/theme/theme';
import { useAuth } from '@/src/contexts/AuthContext';
import CommunicationService, { CallActivity } from '@/src/services/CommunicationService';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';

interface IncomingCall {
  callId: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  agentId: string;
  workspaceId: string;
  organizationId: string;
  timestamp: string;
}

interface CallState {
  status: 'idle' | 'incoming' | 'dialing' | 'connected' | 'ended';
  duration: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
}

export default function DialerScreen() {
  const router = useRouter();
  const { user, session } = useAuth();
  const isDark = useColorScheme() === 'dark';
  
  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    duration: 0,
    isMuted: false,
    isSpeakerOn: false,
  });
  
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [callNotes, setCallNotes] = useState('');
  const [callStatus, setCallStatus] = useState<string>('');
  
  const durationInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    connectToTelephony();
    return () => {
      disconnectFromTelephony();
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, []);

  const connectToTelephony = () => {
    if (!user || !session?.access_token) return;

    const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const socketUrl = apiBaseUrl.replace('/api/v1', '').replace('https://', 'wss://').replace('http://', 'ws://');

    try {
      const newSocket = io(socketUrl, {
        query: {
          deviceId: Constants.installationId,
          agentId: user.id,
        },
        auth: { token: session.access_token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        path: '/socket.io',
      });

      newSocket.on('connect', () => {
        console.log('Connected to telephony gateway');
        // Register device
        registerDevice();
      });

      newSocket.on('incoming_call', (data: IncomingCall) => {
        console.log('Incoming call:', data);
        handleIncomingCall(data);
      });

      newSocket.on('call_status_update', (data: any) => {
        console.log('Call status update:', data);
        if (data.status === 'connected') {
          handleCallConnected();
        } else if (data.status === 'dialing') {
          setCallState(prev => ({ ...prev, status: 'dialing' }));
        }
      });

      newSocket.on('call_ended', (data: any) => {
        console.log('Call ended by agent:', data);
        finishCall(data.status, data.notes);
      });

      newSocket.on('end_call', (data: any) => {
        console.log('End call signal received:', data);
        finishCall(data.status, data.notes);
      });

      newSocket.on('toggle_mute', (data: any) => {
        console.log('Toggle mute:', data);
        setCallState(prev => ({ ...prev, isMuted: data.isMuted }));
      });

      newSocket.on('toggle_speaker', (data: any) => {
        console.log('Toggle speaker:', data);
        setCallState(prev => ({ ...prev, isSpeakerOn: data.isSpeakerOn }));
      });

      newSocket.on('play_dtmf', (data: any) => {
        console.log('Play DTMF:', data);
        // DTMF tone would be played here
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from telephony gateway');
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('Telephony connection error:', error);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Failed to connect to telephony gateway:', error);
    }
  };

  const disconnectFromTelephony = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  const registerDevice = async () => {
    if (!user) {
      console.warn('Cannot register device: user not authenticated');
      return;
    }
    try {
      await CommunicationService.registerDevice(user.id, Constants.installationId);
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  };

  const handleIncomingCall = (data: IncomingCall) => {
    setIncomingCall(data);
    setCallState({
      status: 'incoming',
      duration: 0,
      isMuted: false,
      isSpeakerOn: false,
    });
    
    // Start vibration and animation
    Vibration.vibrate([0, 1000, 500, 1000], true);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const acceptCall = async () => {
    if (!incomingCall || !socket) return;

    // Stop vibration
    Vibration.cancel();

    // Send accept signal
    socket.emit('accept_call', {
      callId: incomingCall.callId,
      deviceId: Constants.installationId,
    });

    // Trigger native dialer
    try {
      const formattedPhone = formatPhoneNumber(incomingCall.leadPhone);
      const supported = await Linking.canOpenURL(`tel:${formattedPhone}`);
      
      if (supported) {
        await Linking.openURL(`tel:${formattedPhone}`);
        
        // Update state to dialing
        setCallState(prev => ({ ...prev, status: 'dialing' }));
        
        // After a delay, assume call is connected (in real app, would use call detection)
        setTimeout(() => {
          handleCallConnected();
        }, 5000); // 5 second delay to simulate call connection
      }
    } catch (error) {
      console.error('Failed to open dialer:', error);
      Alert.alert('Error', 'Failed to open phone dialer');
    }
  };

  const rejectCall = () => {
    if (!incomingCall || !socket) return;

    Vibration.cancel();
    
    // Send reject signal (could be implemented as end_call with status 'rejected')
    socket.emit('call_ended', {
      callId: incomingCall.callId,
      deviceId: Constants.installationId,
      duration: 0,
      status: 'rejected',
    });

    setIncomingCall(null);
    setCallState({
      status: 'idle',
      duration: 0,
      isMuted: false,
      isSpeakerOn: false,
    });
  };

  const handleCallConnected = () => {
    if (!incomingCall || !socket) return;

    // Send connected signal
    socket.emit('call_connected', {
      callId: incomingCall.callId,
      deviceId: Constants.installationId,
    });

    // Update state
    setCallState(prev => ({ ...prev, status: 'connected' }));
    
    // Start duration timer
    durationInterval.current = setInterval(() => {
      setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);
  };

  const finishCall = (status: string, notes: string) => {
    if (!socket || !incomingCall) return;

    // Stop duration timer
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }

    // Log call activity
    try {
      CommunicationService.logCallActivity({
        leadId: incomingCall.leadId,
        phone: incomingCall.leadPhone,
        duration: callState.duration,
        status: 'completed',
        notes: notes,
        outcome: status as any || 'interested',
      });
    } catch (error) {
      console.error('Failed to log call activity:', error);
    }

    // Reset state
    setIncomingCall(null);
    setCallState({
      status: 'ended',
      duration: 0,
      isMuted: false,
      isSpeakerOn: false,
    });

    // Reset animation
    fadeAnim.setValue(0);

    // Return to idle after a brief moment
    setTimeout(() => {
      setCallState({
        status: 'idle',
        duration: 0,
        isMuted: false,
        isSpeakerOn: false,
      });
    }, 2000);
  };

  const endCall = async () => {
    if (!socket || !incomingCall) return;

    // Send end call signal
    socket.emit('call_ended', {
      callId: incomingCall.callId,
      deviceId: Constants.installationId,
      duration: callState.duration,
      status: callStatus || 'completed',
      notes: callNotes,
    });

    finishCall(callStatus || 'completed', callNotes);
  };

  const toggleMute = () => {
    if (!socket || !incomingCall) return;
    
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    
    socket.emit('toggle_mute', {
      callId: incomingCall.callId,
      isMuted: !callState.isMuted,
    });
  };

  const toggleSpeaker = () => {
    if (!socket || !incomingCall) return;
    
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
    
    socket.emit('toggle_speaker', {
      callId: incomingCall.callId,
      isSpeakerOn: !callState.isSpeakerOn,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) return `+91${cleaned}`;
    if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
    if (cleaned.startsWith('0') && cleaned.length === 11) return `+91${cleaned.substring(1)}`;
    return phone;
  };

  const getStatusColor = () => {
    switch (callState.status) {
      case 'incoming': return colors.primary;
      case 'dialing': return '#F59E0B';
      case 'connected': return '#10B981';
      case 'ended': return '#6B7280';
      default: return colors.onBackground;
    }
  };

  // Render incoming call screen
  if (callState.status === 'incoming' && incomingCall) {
    return (
      <Animated.View style={[styles.incomingContainer, { opacity: fadeAnim }]}>
        <View style={[styles.incomingCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.incomingAvatar}>
            <Ionicons name="person" size={64} color={colors.primary} />
          </View>
          
          <Text style={[styles.incomingName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {incomingCall.leadName}
          </Text>
          <Text style={[styles.incomingPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {incomingCall.leadPhone}
          </Text>
          
          <Text style={[styles.incomingLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Incoming Call...
          </Text>

          <View style={styles.incomingActions}>
            <TouchableOpacity style={styles.rejectButton} onPress={rejectCall}>
              <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
              <Ionicons name="call" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Render active call screen
  if (callState.status === 'connected' || callState.status === 'dialing') {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
        <View style={[styles.callCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
          <View style={styles.callHeader}>
            <Text style={[styles.callStatus, { color: getStatusColor() }]}>
              {callState.status === 'dialing' ? 'Dialing...' : 'Connected'}
            </Text>
          </View>

          <View style={styles.callAvatar}>
            <Ionicons name="person" size={80} color={colors.primary} />
          </View>

          <Text style={[styles.callName, { color: isDark ? colors.surface : colors.onBackground }]}>
            {incomingCall?.leadName}
          </Text>
          <Text style={[styles.callPhone, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {incomingCall?.leadPhone}
          </Text>

          {callState.status === 'connected' && (
            <Text style={[styles.callDuration, { color: isDark ? colors.surface : colors.onBackground }]}>
              {formatDuration(callState.duration)}
            </Text>
          )}

          <View style={styles.callControls}>
            <TouchableOpacity
              style={[styles.controlButton, callState.isMuted && styles.controlButtonActive]}
              onPress={toggleMute}
            >
              <Ionicons
                name={callState.isMuted ? 'mic-off' : 'mic'}
                size={24}
                color={callState.isMuted ? '#FFFFFF' : colors.onBackground}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, callState.isSpeakerOn && styles.controlButtonActive]}
              onPress={toggleSpeaker}
            >
              <Ionicons
                name="volume-high"
                size={24}
                color={callState.isSpeakerOn ? '#FFFFFF' : colors.onBackground}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
              <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          </View>

          {callState.status === 'connected' && (
            <View style={styles.callInfo}>
              <Text style={[styles.infoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Mute: {callState.isMuted ? 'On' : 'Off'} | Speaker: {callState.isSpeakerOn ? 'On' : 'Off'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Render idle/ended state
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? colors.surface : colors.onBackground }]}>
          Dialer
        </Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: socket ? '#10B981' : '#EF4444' }]} />
          <Text style={[styles.statusText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            {socket ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      </View>

      <View style={[styles.contentCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <View style={styles.emptyState}>
          <Ionicons name="call-outline" size={64} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
            Ready to Call
          </Text>
          <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Your mobile device is connected and ready to receive call requests from the web dashboard.
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {socket ? '✓' : '✗'}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              WebSocket
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {Constants.installationId ? '✓' : '✗'}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Device ID
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? colors.surface : colors.onBackground }]}>
              {Platform.OS === 'ios' || Platform.OS === 'android' ? '✓' : '✗'}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Native Dialer
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <Text style={[styles.infoTitle, { color: isDark ? colors.surface : colors.onBackground }]}>
          How It Works
        </Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="phone-portrait-outline" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoSubtitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Receive Call Requests
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              When someone initiates a call from the web dashboard, you'll receive an incoming call notification.
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoSubtitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Use Native Dialer
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Accept the call to automatically open your phone's native dialer with the lead's number.
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="stats-chart-outline" size={24} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoSubtitle, { color: isDark ? colors.surface : colors.onBackground }]}>
              Call Tracking
            </Text>
            <Text style={[styles.infoDescription, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Call duration and outcomes are automatically tracked and synced with the CRM.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.nohemi.bold,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
  },
  contentCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: fonts.nohemi.semiBold,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
    marginTop: 4,
  },
  infoCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: fonts.nohemi.semiBold,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoSubtitle: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: fonts.satoshi.regular,
    lineHeight: 20,
  },
  // Incoming call styles
  incomingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  incomingCard: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
  },
  incomingAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(8, 166, 152, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  incomingName: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 8,
  },
  incomingPhone: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 24,
  },
  incomingLabel: {
    fontSize: 14,
    fontFamily: fonts.satoshi.medium,
    marginBottom: 40,
  },
  incomingActions: {
    flexDirection: 'row',
    gap: 40,
  },
  rejectButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Active call styles
  callCard: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callHeader: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  callStatus: {
    fontSize: 16,
    fontFamily: fonts.nohemi.medium,
  },
  callAvatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(8, 166, 152, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  callName: {
    fontSize: 24,
    fontFamily: fonts.nohemi.bold,
    marginBottom: 8,
  },
  callPhone: {
    fontSize: 16,
    fontFamily: fonts.satoshi.regular,
    marginBottom: 16,
  },
  callDuration: {
    fontSize: 32,
    fontFamily: fonts.satoshi.bold,
    marginBottom: 40,
    fontVariant: ['tabular-nums'],
  },
  callControls: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: colors.onBackground,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfo: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: fonts.satoshi.medium,
  },
});