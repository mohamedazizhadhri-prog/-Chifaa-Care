const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const TunisianRamiEngine = require('./rami-engine');

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
  res.json({ message: 'Tunisian Rami Server', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Game engine
const engine = new TunisianRamiEngine({
  aceValue: 1,
  jokerValue: 20,
  winBonus: -40,
  targetScore: 201
});

// Store games and players
const games = new Map();
const players = new Map();

// Game phases
const PHASE = {
  LOBBY: 'lobby',
  DRAW: 'draw',
  MELD: 'meld',
  DISCARD: 'discard',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over'
};

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // AUTHENTICATE
  socket.on('authenticate', (data) => {
    console.log('🔐 Player authenticated:', data);
    players.set(socket.id, {
      id: data.playerId,
      name: data.playerName,
      avatar: data.playerAvatar,
      socketId: socket.id,
      totalScore: 0
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
      players: [{ ...player, hand: [], melds: [], hasDrawn: false, drewFromDiscard: false, drawnCardId: null }],
      status: PHASE.LOBBY,
      currentPlayerIndex: 0,
      deck: [],
      discardPile: [],
      currentPhase: PHASE.LOBBY,
      roundNumber: 1,
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
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          totalScore: p.totalScore,
          isReady: false
        })),
        status: PHASE.LOBBY
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
    
    if (game.status !== PHASE.LOBBY) {
      socket.emit('game:error', { message: 'Game already started' });
      return;
    }
    
    if (game.players.length >= 4) {
      socket.emit('game:error', { message: 'Game is full' });
      return;
    }
    
    game.players.push({ ...player, hand: [], melds: [], hasDrawn: false, drewFromDiscard: false, drawnCardId: null, isReady: false });
    socket.join(`game:${data.gameId}`);
    
    console.log(`👤 ${player.name} joined game ${data.gameId}`);
    
    socket.emit('game:joined', {
      game: {
        id: game.id,
        hostId: game.hostId,
        players: game.players.map(p => ({
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          totalScore: p.totalScore,
          isReady: p.isReady || false
        })),
        status: game.status
      }
    });
    
    io.to(`game:${data.gameId}`).emit('game:player_joined', {
      player: { id: player.id, name: player.name, avatar: player.avatar },
      playerCount: game.players.length
    });
  });
  
  // PLAYER READY
  socket.on('player:ready', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(data.gameId);
    if (!game) return;
    
    const gamePlayer = game.players.find(p => p.id === player.id);
    if (gamePlayer) {
      gamePlayer.isReady = true;
      console.log(`✅ ${player.name} is ready`);
      
      io.to(`game:${data.gameId}`).emit('player:ready', {
        playerId: player.id,
        playerName: player.name
      });
      
      // Check if all ready
      const allReady = game.players.every(p => p.isReady);
      if (allReady && game.players.length >= 2) {
        io.to(`game:${data.gameId}`).emit('player:all_ready');
      }
    }
  });
  
  // START GAME
  socket.on('game:start', (data) => {
    const game = games.get(data.gameId);
    if (!game) return;
    
    const player = players.get(socket.id);
    if (!player || player.id !== game.hostId) {
      socket.emit('game:error', { message: 'Only host can start game' });
      return;
    }
    
    // Initialize game
    game.deck = engine.createDeck();
    const hands = engine.dealCards(game.deck, game.players.length);
    
    game.players.forEach((p, index) => {
      p.hand = hands[index];
      p.melds = [];
      p.hasDrawn = false;
      p.drewFromDiscard = false;
      p.drawnCardId = null;
    });
    
    // Start discard pile
    game.discardPile = [game.deck.pop()];
    game.status = PHASE.DRAW;
    game.currentPhase = PHASE.DRAW;
    game.currentPlayerIndex = 0;
    
    console.log(`🎮 Game ${data.gameId} started! Round ${game.roundNumber}`);
    
    // Send game started event to each player with their hand
    game.players.forEach(p => {
      const playerSocket = Array.from(io.sockets.sockets.values())
        .find(s => players.get(s.id)?.id === p.id);
      
      if (playerSocket) {
        playerSocket.emit('game:started', {
          gameId: data.gameId,
          status: PHASE.DRAW,
          currentPlayer: {
            id: game.players[0].id,
            name: game.players[0].name
          },
          deckSize: game.deck.length,
          myHand: p.hand,
          myMelds: [],
          discardPile: game.discardPile,
          phase: PHASE.DRAW,
          roundNumber: game.roundNumber,
          players: game.players.map(player => ({
            id: player.id,
            name: player.name,
            avatar: player.avatar,
            totalScore: player.totalScore,
            handSize: player.hand.length,
            melds: player.melds
          }))
        });
      }
    });
  });
  
  // DRAW CARD
  socket.on('game:draw', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(data.gameId);
    if (!game) return;
    
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== player.id) {
      socket.emit('game:error', { message: 'Not your turn' });
      return;
    }
    
    if (game.currentPhase !== PHASE.DRAW) {
      socket.emit('game:error', { message: 'Not in draw phase' });
      return;
    }
    
    if (currentPlayer.hasDrawn) {
      socket.emit('game:error', { message: 'Already drew a card this turn' });
      return;
    }
    
    let drawnCard;
    
    if (data.fromDiscard) {
      // Draw from discard pile
      if (game.discardPile.length === 0) {
        socket.emit('game:error', { message: 'Discard pile is empty' });
        return;
      }
      drawnCard = game.discardPile.pop();
      currentPlayer.drewFromDiscard = true;
      console.log(`🎴 ${player.name} drew from discard: ${drawnCard.rank}${drawnCard.suit || ''}`);
    } else {
      // Draw from deck
      if (game.deck.length === 0) {
        // Reshuffle discard pile
        const topCard = game.discardPile.pop();
        game.deck = engine.shuffleDeck(game.discardPile);
        game.discardPile = [topCard];
      }
      drawnCard = game.deck.pop();
      console.log(`🎴 ${player.name} drew from deck`);
    }
    
    currentPlayer.hand.push(drawnCard);
    currentPlayer.hasDrawn = true;
    currentPlayer.drawnCardId = drawnCard.id;
    game.currentPhase = PHASE.MELD;
    
    // Send updated hand to current player
    socket.emit('game:card_drawn', {
      card: drawnCard,
      myHand: currentPlayer.hand,
      fromDiscard: data.fromDiscard,
      phase: PHASE.MELD,
      deckSize: game.deck.length
    });
    
    // Notify others
    socket.to(`game:${data.gameId}`).emit('game:card_drawn', {
      player: { id: player.id, name: player.name },
      fromDiscard: data.fromDiscard,
      deckSize: game.deck.length,
      discardPile: game.discardPile
    });
  });
  
  // CREATE MELD
  socket.on('game:create_meld', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(data.gameId);
    if (!game) return;
    
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== player.id) {
      socket.emit('game:error', { message: 'Not your turn' });
      return;
    }
    
    if (game.currentPhase !== PHASE.MELD) {
      socket.emit('game:error', { message: 'Not in meld phase' });
      return;
    }
    
    // Validate card IDs
    const meldCards = data.cardIds.map(id => currentPlayer.hand.find(c => c.id === id)).filter(Boolean);
    
    if (meldCards.length !== data.cardIds.length) {
      socket.emit('game:error', { message: 'Invalid cards in meld' });
      return;
    }
    
    // Validate meld
    if (!engine.isValidMeld(meldCards)) {
      socket.emit('game:error', { message: 'Invalid meld combination' });
      return;
    }
    
    // Check if drew from discard - must use that card
    if (currentPlayer.drewFromDiscard && currentPlayer.drawnCardId) {
      if (!meldCards.some(c => c.id === currentPlayer.drawnCardId)) {
        socket.emit('game:error', { message: 'Must use card drawn from discard pile' });
        return;
      }
    }
    
    // Create meld
    const meldId = `meld_${Date.now()}_${currentPlayer.melds.length}`;
    const newMeld = {
      id: meldId,
      playerId: player.id,
      cards: meldCards,
      type: engine.isValidSet(meldCards) ? 'SET' : 'RUN'
    };
    
    currentPlayer.melds.push(newMeld);
    
    // Remove cards from hand
    data.cardIds.forEach(id => {
      const index = currentPlayer.hand.findIndex(c => c.id === id);
      if (index !== -1) currentPlayer.hand.splice(index, 1);
    });
    
    console.log(`✨ ${player.name} created a ${newMeld.type} meld`);
    
    // Update all players
    game.players.forEach(p => {
      const playerSocket = Array.from(io.sockets.sockets.values())
        .find(s => players.get(s.id)?.id === p.id);
      
      if (playerSocket) {
        playerSocket.emit('game:meld_created', {
          player: { id: player.id, name: player.name },
          meld: {
            id: meldId,
            playerId: player.id,
            cards: newMeld.cards,
            type: newMeld.type
          },
          myHand: p.hand,
          myMelds: p.melds,
          allMelds: game.players.flatMap(pl => pl.melds.map(m => ({
            ...m,
            playerName: pl.name
          })))
        });
      }
    });
  });
  
  // LAY OFF CARD
  socket.on('game:layoff', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(data.gameId);
    if (!game) return;
    
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== player.id) {
      socket.emit('game:error', { message: 'Not your turn' });
      return;
    }

    // Must be in meld phase
    if (game.currentPhase !== PHASE.MELD) {
      socket.emit('game:error', { message: 'Can only lay off during meld phase' });
      return;
    }

    // Player must have melded at least once before
    if (currentPlayer.melds.length === 0) {
      socket.emit('game:error', { message: 'You must create your first meld before laying off cards' });
      return;
    }

    // Must have drawn a card first
    if (!currentPlayer.hasDrawn) {
      socket.emit('game:error', { message: 'You must draw a card first' });
      return;
    }
    
    // Find the meld
    let targetMeld = null;
    let targetPlayer = null;
    
    for (const p of game.players) {
      const meld = p.melds.find(m => m.id === data.meldId);
      if (meld) {
        targetMeld = meld;
        targetPlayer = p;
        break;
      }
    }
    
    if (!targetMeld) {
      socket.emit('game:error', { message: 'Meld not found' });
      return;
    }
    
    // Find card in player's hand
    const card = currentPlayer.hand.find(c => c.id === data.cardId);
    if (!card) {
      socket.emit('game:error', { message: 'Card not in hand' });
      return;
    }
    
    // Validate lay off
    const validation = engine.canLayOff(card, targetMeld);
    if (!validation.valid) {
      socket.emit('game:error', { message: validation.message || 'Card cannot be added to this meld' });
      return;
    }
    
    // Lay off the card (adds it in correct position)
    const result = engine.layOffCard(card, targetMeld);
    if (!result.success) {
      socket.emit('game:error', { message: result.message });
      return;
    }
    
    // Remove from hand
    const index = currentPlayer.hand.findIndex(c => c.id === data.cardId);
    currentPlayer.hand.splice(index, 1);
    
    console.log(`➕ ${player.name} laid off ${card.rank}${card.suit || ''} on ${targetPlayer.name}'s ${targetMeld.type} meld`);
    
    // Update all players
    game.players.forEach(p => {
      const playerSocket = Array.from(io.sockets.sockets.values())
        .find(s => players.get(s.id)?.id === p.id);
      
      if (playerSocket) {
        playerSocket.emit('game:card_laid_off', {
          player: { id: player.id, name: player.name },
          targetPlayer: { id: targetPlayer.id, name: targetPlayer.name },
          meldId: targetMeld.id,
          card: card,
          meldType: targetMeld.type,
          position: validation.position,
          myHand: p.hand,
          allMelds: game.players.flatMap(pl => pl.melds.map(m => ({
            ...m,
            playerName: pl.name
          })))
        });
      }
    });
  });
  
  // DISCARD CARD
  socket.on('game:discard', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    const game = games.get(data.gameId);
    if (!game) return;
    
    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== player.id) {
      socket.emit('game:error', { message: 'Not your turn' });
      return;
    }
    
    if (game.currentPhase !== PHASE.MELD) {
      socket.emit('game:error', { message: 'Must draw first' });
      return;
    }
    
    const cardIndex = currentPlayer.hand.findIndex(c => c.id === data.cardId);
    if (cardIndex === -1) {
      socket.emit('game:error', { message: 'Card not in hand' });
      return;
    }
    
    const discardedCard = currentPlayer.hand.splice(cardIndex, 1)[0];
    
    // Check if player is going out
    const isGoingOut = currentPlayer.hand.length === 0;
    
    if (isGoingOut) {
      // Round ends - calculate scores
      game.discardPile.push(discardedCard);
      game.status = PHASE.ROUND_END;
      
      console.log(`🏆 ${player.name} goes out! Round ${game.roundNumber} ends`);
      
      const roundScores = engine.calculateRoundScores(game.players, player.id);
      
      // Update total scores
      game.players.forEach(p => {
        p.totalScore += roundScores[p.id];
      });
      
      // Check game over
      const gameOver = engine.isGameOver(game.players.map(p => p.totalScore));
      
      if (gameOver) {
        game.status = PHASE.GAME_OVER;
        const winner = game.players.reduce((min, p) => 
          p.totalScore < min.totalScore ? p : min
        );
        
        io.to(`game:${data.gameId}`).emit('game:over', {
          winner: { id: winner.id, name: winner.name, totalScore: winner.totalScore },
          finalScores: game.players.map(p => ({
            id: p.id,
            name: p.name,
            totalScore: p.totalScore
          }))
        });
      } else {
        // Next round
        io.to(`game:${data.gameId}`).emit('game:round_end', {
          winnerId: player.id,
          winnerName: player.name,
          roundScores,
          totalScores: game.players.map(p => ({
            id: p.id,
            name: p.name,
            roundScore: roundScores[p.id],
            totalScore: p.totalScore
          })),
          nextRound: game.roundNumber + 1
        });
      }
    } else {
      // Normal discard - next player's turn
      game.discardPile.push(discardedCard);
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
      game.currentPhase = PHASE.DRAW;
      
      const nextPlayer = game.players[game.currentPlayerIndex];
      
      // Reset turn state
      currentPlayer.hasDrawn = false;
      currentPlayer.drewFromDiscard = false;
      currentPlayer.drawnCardId = null;
      
      console.log(`🗑️ ${player.name} discarded. Next: ${nextPlayer.name}`);
      
      // Update all players
      game.players.forEach(p => {
        const playerSocket = Array.from(io.sockets.sockets.values())
          .find(s => players.get(s.id)?.id === p.id);
        
        if (playerSocket) {
          playerSocket.emit('game:card_discarded', {
            player: { id: player.id, name: player.name },
            discardedCard: discardedCard,
            discardPile: game.discardPile,
            myHand: p.hand,
            phase: PHASE.DRAW,
            currentPlayer: { id: nextPlayer.id, name: nextPlayer.name }
          });
        }
      });
    }
  });
  
  // CHAT
  socket.on('player:message', (data) => {
    const player = players.get(socket.id);
    if (!player) return;
    
    io.to(`game:${data.gameId}`).emit('player:message', {
      playerId: player.id,
      playerName: player.name,
      message: data.message,
      timestamp: new Date().toISOString()
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

const PORT = 3001;

httpServer.listen(PORT, () => {
  console.log('================================================');
  console.log(`🚀 Tunisian Rami Server running!`);
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('================================================');
  console.log('');
  console.log('🎮 Official Tunisian Rami Rules:');
  console.log('   • 2-4 players, 14 cards each');
  console.log('   • 2 decks + 4 Jokers = 108 cards');
  console.log('   • Turn: Draw → Meld (optional) → Discard');
  console.log('   • Win: All cards in melds + discard last card');
  console.log('   • Winner: -40 points, Others: card values');
  console.log('================================================');
});
