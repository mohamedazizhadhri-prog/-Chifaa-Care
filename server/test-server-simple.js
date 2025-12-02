const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Rami Test Server', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Store games in memory
const games = new Map();
const players = new Map();

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // AUTHENTICATE
  socket.on('authenticate', (data) => {
    console.log('🔐 Player authenticated:', data);
    players.set(socket.id, {
      id: data.playerId,
      name: data.playerName,
      avatar: data.playerAvatar,
      socketId: socket.id
    });
    
    socket.emit('authenticated', {
      playerId: data.playerId,
      playerName: data.playerName,
      sessionId: socket.id
    });
  });
  
  // CREATE GAME
  socket.on('game:create', (data) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit('game:error', { message: 'Not authenticated' });
      return;
    }
    
    const gameId = 'game_' + Date.now();
    const game = {
      id: gameId,
      hostId: player.id,
      players: [player],
      status: 'lobby',
      createdAt: new Date().toISOString()
    };
    
    games.set(gameId, game);
    socket.join(`game:${gameId}`);
    
    console.log(`🎮 Game created: ${gameId} by ${player.name}`);
    
    socket.emit('game:created', {
      gameId,
      game: {
        id: gameId,
        hostId: player.id,
        players: game.players,
        status: 'lobby'
      }
    });
  });
  
  // JOIN GAME
  socket.on('game:join', (data) => {
    const player = players.get(socket.id);
    if (!player) {
      socket.emit('game:error', { message: 'Not authenticated' });
      return;
    }
    
    const game = games.get(data.gameId);
    if (!game) {
      socket.emit('game:error', { message: 'Game not found' });
      return;
    }
    
    game.players.push(player);
    socket.join(`game:${data.gameId}`);
    
    console.log(`👤 ${player.name} joined game ${data.gameId}`);
    
    socket.emit('game:joined', { game });
    io.to(`game:${data.gameId}`).emit('game:player_joined', {
      player,
      playerCount: game.players.length
    });
  });
  
  // PLAYER READY
  socket.on('player:ready', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    player.isReady = true;
    console.log(`✅ ${player.name} is ready`);
    
    io.to(`game:${data.gameId}`).emit('player:ready', {
      playerId: player.id,
      playerName: player.name
    });
  });
  
  // START GAME
  socket.on('game:start', (data) => {
    const game = games.get(data.gameId);
    if (!game) return;
    
    game.status = 'playing';
    console.log(`🎮 Game ${data.gameId} started!`);
    
    // Simple hand for testing
    const myHand = [
      { id: 'c1', rank: 'A', suit: 'HEARTS' },
      { id: 'c2', rank: '2', suit: 'DIAMONDS' },
      { id: 'c3', rank: '3', suit: 'CLUBS' },
      { id: 'c4', rank: '4', suit: 'SPADES' },
      { id: 'c5', rank: '5', suit: 'HEARTS' }
    ];
    
    io.to(`game:${data.gameId}`).emit('game:started', {
      gameId: data.gameId,
      status: 'playing',
      currentPlayer: game.players[0],
      deckSize: 50,
      myHand,
      discardPile: [{ id: 'c0', rank: 'K', suit: 'SPADES' }]
    });
  });
  
  // DRAW CARD
  socket.on('game:draw', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const newCard = {
      id: 'c' + Date.now(),
      rank: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'][Math.floor(Math.random() * 13)],
      suit: ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'][Math.floor(Math.random() * 4)]
    };
    
    console.log(`🎴 ${player.name} drew a card from ${data.fromDiscard ? 'discard' : 'deck'}`);
    
    socket.emit('game:card_drawn', {
      player: { id: player.id, name: player.name },
      myHand: [newCard] // In real game, send full hand
    });
    
    io.to(`game:${data.gameId}`).emit('game:card_drawn', {
      player: { id: player.id, name: player.name }
    });
  });
  
  // DISCARD CARD
  socket.on('game:discard', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    console.log(`🗑️ ${player.name} discarded card ${data.cardId}`);
    
    const discardedCard = {
      id: data.cardId,
      rank: 'Q',
      suit: 'HEARTS'
    };
    
    io.to(`game:${data.gameId}`).emit('game:card_discarded', {
      player: { id: player.id, name: player.name },
      discardPile: [discardedCard]
    });
    
    // Switch turn to next player
    const game = games.get(data.gameId);
    if (game && game.players.length > 1) {
      const currentIndex = game.players.findIndex(p => p.id === player.id);
      const nextIndex = (currentIndex + 1) % game.players.length;
      const nextPlayer = game.players[nextIndex];
      
      io.to(`game:${data.gameId}`).emit('game:turn_changed', {
        player: { id: nextPlayer.id, name: nextPlayer.name }
      });
    }
  });
  
  // CHAT
  socket.on('player:message', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    console.log(`💬 ${player.name}: ${data.message}`);
    
    io.to(`game:${data.gameId}`).emit('player:message', {
      playerId: player.id,
      playerName: player.name,
      message: data.message
    });
  });
  
  // DISCONNECT
  socket.on('disconnect', () => {
    const player = players.get(socket.id);
    console.log('❌ Client disconnected:', socket.id);
    
    if (player) {
      console.log(`   Player: ${player.name}`);
      players.delete(socket.id);
    }
  });
});

const PORT = 3001; // Using different port to avoid conflicts

httpServer.listen(PORT, () => {
  console.log('================================================');
  console.log(`🚀 Simple test server running!`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('================================================');
  console.log('');
  console.log('📝 Instructions:');
  console.log('   1. Open test-client.html in 2 browser windows');
  console.log('   2. Make sure Server URL is: http://localhost:3001');
  console.log('   3. Connect both players');
  console.log('   4. Player 1: Create game');
  console.log('   5. Player 2: Join with game ID');
  console.log('   6. Both: Mark ready');
  console.log('   7. Player 1: Start game');
  console.log('   8. Test drawing/discarding cards!');
  console.log('================================================');
});
