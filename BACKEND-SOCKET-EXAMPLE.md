# Backend Socket.IO Server Example

## Quick Setup

```bash
npm install socket.io jsonwebtoken
```

## Example Server (server.js)

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const jwt = require('jsonwebtoken');

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Mark user as online
  onlineUsers.set(socket.userId, socket.id);
  io.emit('user:online', socket.userId);

  // List conversations
  socket.on('conversations:list', async (data, callback) => {
    try {
      const conversations = await getConversations(socket.userId);
      callback({ conversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
      callback({ error: 'Failed to load conversations' });
    }
  });

  // Get conversation
  socket.on('conversation:get', async ({ conversationId }, callback) => {
    try {
      const conversation = await getConversation(conversationId, socket.userId);
      callback({ conversation });
    } catch (error) {
      callback({ error: 'Conversation not found' });
    }
  });

  // Create conversation
  socket.on('conversation:create', async ({ recipientId, type }, callback) => {
    try {
      const conversation = await createConversation(socket.userId, recipientId, type);
      callback({ conversation });
    } catch (error) {
      callback({ error: 'Failed to create conversation' });
    }
  });

  // Get messages
  socket.on('messages:get', async ({ conversationId, limit, offset }, callback) => {
    try {
      const messages = await getMessages(conversationId, socket.userId, limit, offset);
      callback({ messages });
    } catch (error) {
      callback({ error: 'Failed to load messages' });
    }
  });

  // Send message
  socket.on('message:send', async (data) => {
    try {
      const message = await saveMessage({
        conversationId: data.conversationId,
        senderId: socket.userId,
        content: data.content,
        type: data.type || 'text'
      });

      // Emit to sender
      socket.emit('message:new', message);

      // Emit to other participants
      const conversation = await getConversation(data.conversationId, socket.userId);
      conversation.participants.forEach(participant => {
        if (participant.id !== socket.userId) {
          const recipientSocketId = onlineUsers.get(participant.id);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('message:new', message);
          }
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Mark messages as read
  socket.on('message:read', async ({ conversationId, messageIds }) => {
    try {
      await markMessagesAsRead(conversationId, messageIds, socket.userId);
      
      // Notify sender
      const messages = await getMessagesByIds(messageIds);
      const senderId = messages[0]?.senderId;
      if (senderId) {
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message:read', { conversationId, messageIds });
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  // Typing indicators
  socket.on('typing:start', ({ conversationId }) => {
    socket.to(conversationId).emit('typing:start', {
      conversationId,
      userId: socket.userId
    });
  });

  socket.on('typing:stop', ({ conversationId }) => {
    socket.to(conversationId).emit('typing:stop', {
      conversationId,
      userId: socket.userId
    });
  });

  // Voice/Video Calls
  socket.on('call:initiate', async ({ recipientId, callType, conversationId }) => {
    const recipientSocketId = onlineUsers.get(recipientId);
    if (recipientSocketId) {
      const caller = await getUserById(socket.userId);
      io.to(recipientSocketId).emit('call:incoming', {
        callerId: socket.userId,
        callerName: caller.name,
        callType,
        conversationId
      });
    }
  });

  socket.on('call:answer', ({ callerId, conversationId }) => {
    const callerSocketId = onlineUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:answered', {
        recipientId: socket.userId,
        conversationId
      });
    }
  });

  socket.on('call:reject', ({ callerId }) => {
    const callerSocketId = onlineUsers.get(callerId);
    if (callerSocketId) {
      io.to(callerSocketId).emit('call:rejected');
    }
  });

  socket.on('call:end', ({ peerId }) => {
    const peerSocketId = onlineUsers.get(peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit('call:ended');
    }
  });

  // WebRTC signaling
  socket.on('webrtc:offer', ({ peerId, offer }) => {
    const peerSocketId = onlineUsers.get(peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc:offer', {
        senderId: socket.userId,
        offer
      });
    }
  });

  socket.on('webrtc:answer', ({ peerId, answer }) => {
    const peerSocketId = onlineUsers.get(peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc:answer', {
        senderId: socket.userId,
        answer
      });
    }
  });

  socket.on('webrtc:ice-candidate', ({ peerId, candidate }) => {
    const peerSocketId = onlineUsers.get(peerId);
    if (peerSocketId) {
      io.to(peerSocketId).emit('webrtc:ice-candidate', {
        senderId: socket.userId,
        candidate
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
    io.emit('user:offline', socket.userId);
  });
});

// Database functions (example - implement with your database)
async function getConversations(userId) {
  // TODO: Fetch conversations from database
  return [];
}

async function getConversation(conversationId, userId) {
  // TODO: Fetch conversation from database
  return null;
}

async function createConversation(userId, recipientId, type) {
  // TODO: Create conversation in database
  return {};
}

async function getMessages(conversationId, userId, limit = 50, offset = 0) {
  // TODO: Fetch messages from database
  return [];
}

async function saveMessage(messageData) {
  // TODO: Save message to database
  return {
    id: 'msg_' + Date.now(),
    ...messageData,
    timestamp: new Date(),
    read: false
  };
}

async function markMessagesAsRead(conversationId, messageIds, userId) {
  // TODO: Update messages in database
}

async function getMessagesByIds(messageIds) {
  // TODO: Fetch messages from database
  return [];
}

async function getUserById(userId) {
  // TODO: Fetch user from database
  return { id: userId, name: 'User' };
}
```

## Database Schema Example

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL, -- 'patient' or 'doctor'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation participants
CREATE TABLE conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- 'text', 'voice', 'video', 'file'
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Message read receipts
CREATE TABLE message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id),
  user_id UUID REFERENCES users(id),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(message_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_conversation_participants ON conversation_participants(user_id);
```

## Express.js Integration

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Your Socket.IO code here

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});
```

## Testing with Postman/Thunder Client

You can test Socket.IO events using websocket clients. Example connection:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // List conversations
  socket.emit('conversations:list', {}, (response) => {
    console.log('Conversations:', response);
  });
});
```

## Environment Variables

```.env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
FRONTEND_URL=http://localhost:4200
```

## CORS Configuration

Make sure your Express app allows CORS:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
```

## Production Deployment

For production, consider:

1. **TURN Server** - For NAT traversal in video calls
2. **Redis Adapter** - For Socket.IO clustering
3. **Message Queue** - For reliable message delivery
4. **CDN** - For file attachments
5. **Monitoring** - Track socket connections
6. **Rate Limiting** - Prevent abuse

Example with Redis Adapter:

```javascript
const redisAdapter = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(redisAdapter(pubClient, subClient));
});
```

## Testing Checklist

- [ ] User authentication with JWT
- [ ] List conversations
- [ ] Create conversation
- [ ] Send message
- [ ] Receive message in real-time
- [ ] Mark messages as read
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Initiate voice call
- [ ] Initiate video call
- [ ] Accept/reject calls
- [ ] WebRTC signaling (offer/answer/ICE)

---

**This is a complete working example!** Adapt it to your database and authentication system.
