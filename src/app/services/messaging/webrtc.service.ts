import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth.service';

export interface CallState {
  isActive: boolean;
  isIncoming: boolean;
  callType: 'voice' | 'video';
  peerId: string;
  peerName: string;
  conversationId: string;
  startTime?: Date;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private socket: Socket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  
  private callStateSubject = new BehaviorSubject<CallState | null>(null);
  private localStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private remoteStreamSubject = new BehaviorSubject<MediaStream | null>(null);
  private callErrorSubject = new Subject<string>();

  callState$ = this.callStateSubject.asObservable();
  localStream$ = this.localStreamSubject.asObservable();
  remoteStream$ = this.remoteStreamSubject.asObservable();
  callError$ = this.callErrorSubject.asObservable();

  private readonly SOCKET_URL = environment.socketUrl || 'http://localhost:3000';
  private readonly ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  constructor(private authService: AuthService) {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.socket = io(this.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('call:incoming', async (data: any) => {
      console.log('📞 Incoming call:', data);
      
      const callState: CallState = {
        isActive: false,
        isIncoming: true,
        callType: data.callType,
        peerId: data.callerId,
        peerName: data.callerName,
        conversationId: data.conversationId
      };
      
      this.callStateSubject.next(callState);
    });

    this.socket.on('call:answered', async (data: any) => {
      console.log('✅ Call answered');
      await this.handleCallAnswered(data);
    });

    this.socket.on('call:rejected', () => {
      console.log('❌ Call rejected');
      this.endCall();
      this.callErrorSubject.next('Call was rejected');
    });

    this.socket.on('call:ended', () => {
      console.log('📴 Call ended by peer');
      this.endCall();
    });

    this.socket.on('webrtc:offer', async (data: any) => {
      await this.handleOffer(data);
    });

    this.socket.on('webrtc:answer', async (data: any) => {
      await this.handleAnswer(data);
    });

    this.socket.on('webrtc:ice-candidate', async (data: any) => {
      await this.handleIceCandidate(data);
    });
  }

  // Initiate a call
  async initiateCall(recipientId: string, recipientName: string, conversationId: string, callType: 'voice' | 'video'): Promise<void> {
    try {
      // Get local media stream
      await this.getLocalStream(callType);

      // Create peer connection
      this.createPeerConnection();

      // Set call state
      const callState: CallState = {
        isActive: true,
        isIncoming: false,
        callType,
        peerId: recipientId,
        peerName: recipientName,
        conversationId,
        startTime: new Date()
      };
      this.callStateSubject.next(callState);

      // Notify recipient
      this.socket?.emit('call:initiate', {
        recipientId,
        callType,
        conversationId
      });

      console.log('📞 Call initiated');
    } catch (error) {
      console.error('Failed to initiate call:', error);
      this.callErrorSubject.next('Failed to access camera/microphone');
      this.endCall();
    }
  }

  // Answer incoming call
  async answerCall(callType: 'voice' | 'video'): Promise<void> {
    try {
      const currentState = this.callStateSubject.value;
      if (!currentState) return;

      // Get local media stream
      await this.getLocalStream(callType);

      // Create peer connection
      this.createPeerConnection();

      // Update call state
      currentState.isActive = true;
      currentState.startTime = new Date();
      this.callStateSubject.next({ ...currentState });

      // Notify caller
      this.socket?.emit('call:answer', {
        callerId: currentState.peerId,
        conversationId: currentState.conversationId
      });

      console.log('✅ Call answered');
    } catch (error) {
      console.error('Failed to answer call:', error);
      this.callErrorSubject.next('Failed to access camera/microphone');
      this.rejectCall();
    }
  }

  // Reject incoming call
  rejectCall(): void {
    const currentState = this.callStateSubject.value;
    if (!currentState) return;

    this.socket?.emit('call:reject', {
      callerId: currentState.peerId,
      conversationId: currentState.conversationId
    });

    this.endCall();
  }

  // End call
  endCall(): void {
    // Notify peer
    const currentState = this.callStateSubject.value;
    if (currentState && currentState.isActive) {
      this.socket?.emit('call:end', {
        peerId: currentState.peerId,
        conversationId: currentState.conversationId
      });
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this.localStreamSubject.next(null);
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Clear remote stream
    this.remoteStream = null;
    this.remoteStreamSubject.next(null);

    // Clear call state
    this.callStateSubject.next(null);

    console.log('📴 Call ended');
  }

  // Toggle microphone
  toggleMicrophone(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  // Toggle camera
  toggleCamera(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  // Switch camera (front/back on mobile)
  async switchCamera(): Promise<void> {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const currentFacingMode = videoTrack.getSettings().facingMode;
      const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode },
        audio: true
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      
      // Replace track in peer connection
      if (this.peerConnection) {
        const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(newVideoTrack);
        }
      }

      // Stop old track
      videoTrack.stop();

      // Update local stream
      this.localStream.removeTrack(videoTrack);
      this.localStream.addTrack(newVideoTrack);
      this.localStreamSubject.next(this.localStream);

    } catch (error) {
      console.error('Failed to switch camera:', error);
    }
  }

  // Private methods

  private async getLocalStream(callType: 'voice' | 'video'): Promise<void> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStreamSubject.next(this.localStream);
    } catch (error) {
      console.error('Failed to get local stream:', error);
      throw error;
    }
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.ICE_SERVERS
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.remoteStreamSubject.next(this.remoteStream);
        console.log('📹 Remote stream received');
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const currentState = this.callStateSubject.value;
        if (currentState) {
          this.socket?.emit('webrtc:ice-candidate', {
            peerId: currentState.peerId,
            candidate: event.candidate
          });
        }
      }
    };

    // Handle connection state
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      
      if (this.peerConnection?.connectionState === 'failed' || 
          this.peerConnection?.connectionState === 'disconnected') {
        this.callErrorSubject.next('Connection failed');
        this.endCall();
      }
    };

    // Create and send offer
    this.createOffer();
  }

  private async createOffer(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const currentState = this.callStateSubject.value;
      if (currentState) {
        this.socket?.emit('webrtc:offer', {
          peerId: currentState.peerId,
          offer
        });
      }
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }

  private async handleOffer(data: any): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.socket?.emit('webrtc:answer', {
        peerId: data.senderId,
        answer
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  }

  private async handleAnswer(data: any): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  private async handleIceCandidate(data: any): Promise<void> {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  private async handleCallAnswered(data: any): Promise<void> {
    // Call was answered, peer connection should already be set up
    console.log('Call connected');
  }
}
