# Doctor-to-Doctor Messaging System with Video/Audio Calling

## Overview
This implementation provides a complete doctor-to-doctor messaging system with real-time chat and WebRTC-based audio/video calling capabilities.

## Features

### 1. **Real-Time Messaging**
- Send and receive text messages between doctors in real-time
- Message read receipts (✓ = sent, ✓✓ = read)
- Unread message count badges
- Search functionality to find specific conversations
- Online/offline status indicators
- Message timestamps

### 2. **Doctor Discovery**
- Browse all available doctors in the system
- Start new conversations with any doctor
- View doctor specializations
- Filter conversations by doctor name or message content

### 3. **Audio/Video Calling**
- **Audio-only calls**: Voice communication without video
- **Video + Audio calls**: Full video conferencing with audio
- Incoming call notifications with accept/decline options
- Ringing sound effects for both caller and receiver
- Call status indicators (Ringing, In Call, etc.)
- Picture-in-picture video layout
- Mirrored local video for natural viewing

### 4. **WebRTC Integration**
- Peer-to-peer connection using RTCPeerConnection
- STUN server configuration for NAT traversal
- ICE candidate exchange for optimal connection
- Media stream management (camera/microphone)
- Automatic cleanup on call end

## Architecture

### Components

#### 1. **DoctorMessagesWrapperComponent**
- Tab-based interface switching between:
  - Patient Messages (existing functionality)
  - Doctor Messages (new functionality)
- Location: `src/app/portals/doctor/messages/doctor-messages-wrapper.component.ts`

#### 2. **DoctorDoctorMessagesComponent**
- Main component for doctor-doctor messaging
- Handles chat list, message display, and call functionality
- Location: `src/app/portals/doctor/doctor-messages/`

### Services Used

1. **AuthService**: User authentication and current user management
2. **MessageService**: HTTP API calls for messages (send, receive, read)
3. **DoctorService**: Fetch doctor list and profiles
4. **SocketService**: WebSocket connection for real-time events

### Backend API Endpoints

The system uses the following existing endpoints:

```typescript
GET  /api/v1/messages/conversations/:userId    // Get all conversations
GET  /api/v1/messages/thread?userId=&otherUserId=  // Get message thread
POST /api/v1/messages/send                     // Send new message
PATCH /api/v1/messages/mark-read              // Mark messages as read
```

### Socket Events

#### Messaging Events
- `message:new` - Receive new messages
- `message:sent` - Confirmation of sent messages
- `presence:update` - Online/offline status changes

#### Call Signaling Events
- `call:request` - Initiate call
- `call:incoming` - Receive call notification
- `call:accept` - Accept incoming call
- `call:decline` - Decline incoming call
- `call:offer` - WebRTC offer (SDP)
- `call:answer` - WebRTC answer (SDP)
- `call:ice-candidate` - ICE candidate exchange
- `call:started` - Call successfully started
- `call:ended` - Call terminated
- `call:end` - Request to end call

## Usage Guide

### For End Users

#### Starting a New Conversation
1. Navigate to Doctor Portal → Messages
2. Click "Messages with Doctors" tab
3. Click "New chat" button
4. Select a doctor from the list
5. Start typing and sending messages

#### Making a Call
1. Open a conversation with a doctor
2. Click "Request Call" button in the chat header
3. Choose "Voice only" or "Video + Voice"
4. Wait for the other doctor to accept
5. Once accepted, the call interface will appear
6. Click "End Call" to terminate

#### Receiving a Call
1. When another doctor calls you, an orange banner will appear
2. You'll hear a ringing sound
3. Click "Accept" to answer or "Decline" to reject
4. If accepted, the call interface will open automatically

### For Developers

#### Component Structure

```
doctor-messages/
├── doctor-messages-wrapper.component.ts  # Tab navigation
├── doctor-messages.component.ts          # Patient messages
└── doctor-messages/
    ├── doctor-doctor-messages.component.ts    # Main component
    ├── doctor-doctor-messages.component.html  # Template
    └── doctor-doctor-messages.component.scss  # Styles
```

#### Key Methods

```typescript
// Message Management
loadConversations()  // Load all doctor conversations
loadMessages(chatId) // Load specific conversation thread
sendMessage()        // Send a new message
markAsRead(chatId)   // Mark conversation as read

// Call Management
startCall(type)      // Initiate audio or video call
acceptIncoming()     // Accept incoming call
declineIncoming()    // Decline incoming call
endCall()            // Terminate active call
preparePeer(type)    // Setup WebRTC connection
cleanupCall()        // Cleanup call resources

// UI Management
selectChat(chatId)   // Open a conversation
filterChats()        // Search/filter conversations
toggleDoctorPicker() // Show/hide doctor selection
```

#### Adding New Features

**To add file attachments:**
```typescript
attachFile(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    // Handle file upload
  };
  input.click();
}
```

**To add message reactions:**
```typescript
addReaction(messageId: string, emoji: string): void {
  this.messageService.addReaction(messageId, emoji).subscribe(
    response => {
      // Update UI
    }
  );
}
```

## Configuration

### WebRTC Configuration

The current configuration uses Google's public STUN server:

```typescript
new RTCPeerConnection({ 
  iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] 
});
```

For production, consider adding TURN servers for better connectivity:

```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:your-turn-server.com:3478',
    username: 'username',
    credential: 'password'
  }
]
```

### Media Constraints

Current constraints:
- **Audio**: `{ audio: true, video: false }`
- **Video**: `{ audio: true, video: true }`

To customize video quality:
```typescript
{
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  }
}
```

## Troubleshooting

### Common Issues

1. **Messages not appearing**
   - Check WebSocket connection status
   - Verify backend is running
   - Check browser console for errors

2. **Call not connecting**
   - Ensure camera/microphone permissions granted
   - Check firewall settings
   - Verify STUN/TURN server accessibility
   - Check browser compatibility (Chrome, Firefox, Safari recommended)

3. **Video not displaying**
   - Grant camera permissions in browser
   - Check if another app is using the camera
   - Restart browser

4. **No sound during call**
   - Check system volume
   - Verify microphone is not muted
   - Check browser audio permissions

### Browser Compatibility

- ✅ Chrome 74+
- ✅ Firefox 66+
- ✅ Safari 12.1+
- ✅ Edge 79+
- ❌ Internet Explorer (not supported)

## Security Considerations

1. **Message Encryption**: Messages are transmitted over WebSocket. Consider adding end-to-end encryption for sensitive data.

2. **Media Permissions**: Always request user consent before accessing camera/microphone.

3. **Call Privacy**: Implement authorization checks to ensure only authorized doctors can call each other.

4. **Data Storage**: Consider HIPAA compliance if storing medical communications.

## Future Enhancements

1. **Group Calls**: Support multiple doctors in a single call
2. **Screen Sharing**: Share medical images or documents during calls
3. **Call Recording**: Record calls for documentation (with consent)
4. **Message Encryption**: End-to-end encryption for messages
5. **File Sharing**: Share documents, images, and lab results
6. **Message Reactions**: Add emoji reactions to messages
7. **Voice Messages**: Record and send voice notes
8. **Call History**: Track call duration and history
9. **Push Notifications**: Mobile push notifications for new messages/calls
10. **Scheduled Calls**: Set up calls in advance

## Testing

### Manual Testing Checklist

- [ ] Send and receive text messages
- [ ] Search conversations
- [ ] Start new conversation
- [ ] Mark messages as read
- [ ] Initiate audio call
- [ ] Initiate video call
- [ ] Accept incoming call
- [ ] Decline incoming call
- [ ] End active call
- [ ] Check online/offline status
- [ ] View unread count
- [ ] Test on mobile browser

### Automated Testing

Add unit tests for:
```typescript
describe('DoctorDoctorMessagesComponent', () => {
  it('should load conversations on init', () => {
    // Test implementation
  });
  
  it('should send message successfully', () => {
    // Test implementation
  });
  
  it('should handle incoming call', () => {
    // Test implementation
  });
});
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Review WebSocket connection in Network tab
3. Verify backend logs
4. Contact development team

## License

This code is part of the Chifaa Care platform.

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintainer**: Development Team
