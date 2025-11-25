# 🎮 Rami Socket.IO - Quick Reference Card

## 🚀 Getting Started (30 seconds)

```typescript
// 1. Connect
const socket = io('http://localhost:3001');

// 2. Authenticate
socket.emit('authenticate', {
  playerId: 'user_123',
  playerName: 'Alice',
  playerAvatar: 'https://...'
});

// 3. Create game
socket.emit('game:create', { preset: 'QUICK_2P' });

// 4. Listen for game
socket.on('game:created', ({ gameId, game }) => {
  console.log('Game ready!', gameId);
});
```

---

## 📡 Essential Events

### Create & Join
```typescript
// Create
socket.emit('game:create', { preset: 'QUICK_2P' });
socket.on('game:created', ({ gameId, game }) => {...});

// Join
socket.emit('game:join', { gameId, playerId, playerName, playerAvatar });
socket.on('game:joined', ({ game }) => {...});

// Ready
socket.emit('player:ready', { gameId });
socket.on('player:all_ready', () => {...});

// Start
socket.emit('game:start', { gameId });
socket.on('game:started', ({ game }) => {...});
```

### Gameplay
```typescript
// Draw
socket.emit('game:draw', { gameId, fromDiscard: false });
socket.on('game:card_drawn', ({ game }) => {...});

// Play meld
socket.emit('game:play', { 
  gameId, 
  cardIds: ['id1', 'id2', 'id3'],
  meldType: 'SET' // or 'RUN'
});
socket.on('game:meld_created', ({ game }) => {...});

// Discard
socket.emit('game:discard', { gameId, cardId });
socket.on('game:turn_changed', ({ currentPlayerId, game }) => {...});

// Rami
socket.emit('game:declare', { gameId });
socket.on('game:rami_declared', ({ playerId, roundScores }) => {...});
```

### Chat
```typescript
// Send
socket.emit('player:message', { gameId, message: 'GG!' });
socket.on('player:message', ({ playerName, message }) => {...});

// Emote
socket.emit('player:emote', { gameId, emote: '👍' });
socket.on('player:emote', ({ playerName, emote }) => {...});
```

---

## 🎲 Game Presets

```typescript
'QUICK_2P'      // 2P, 101pts, 45s
'STANDARD_4P'   // 4P, 201pts, 60s
'MARATHON'      // 4P, 501pts, 90s
'CASUAL'        // 4P, 201pts, no timer
'BLITZ'         // 4P, 101pts, 30s
```

---

## 🎯 Game State Structure

```typescript
// Public (all players see)
game: {
  id: string,
  status: 'LOBBY' | 'PLAYING' | 'FINISHED',
  players: Array<{
    id: string,
    username: string,
    cardCount: number,      // Not actual cards!
    score: number
  }>,
  currentPlayerId: string,
  topDiscardCard: Card,
  drawPileCount: number,
  tableMelds: Meld[]
}

// Player view (only you see)
game: {
  ...publicState,
  myHand: Card[],           // Your cards
  myMelds: Meld[],
  canRami: boolean
}
```

---

## ✅ Validation Checklist

```typescript
// Before drawing
if (game.currentPlayerId === myPlayerId &&
    game.phase === 'WAITING_FOR_DRAW') {
  socket.emit('game:draw', {...});
}

// Before playing meld
if (hasDrawn && isValidMeld(cards)) {
  socket.emit('game:play', {...});
}

// Before discarding
if (hasDrawn && 
    game.phase === 'WAITING_FOR_DISCARD') {
  socket.emit('game:discard', {...});
}

// Before Rami
if (myHand.length === 0 && 
    myMelds.length > 0) {
  socket.emit('game:declare', {...});
}
```

---

## 🔐 Error Handling

```typescript
// Always handle errors
socket.on('game:error', ({ message, code }) => {
  console.error(message);
  showToast(message);
});

socket.on('player:error', ({ message, code }) => {
  console.error(message);
  showToast(message);
});

// Common codes
'NOT_AUTHENTICATED'   // Need to authenticate
'NOT_YOUR_TURN'       // Wait for your turn
'GAME_NOT_FOUND'      // Invalid game ID
'INVALID_MOVE'        // Move not legal
'NOT_HOST'            // Only host can do this
```

---

## 🔄 Reconnection

```typescript
// On connection
socket.on('connect', () => {
  socket.emit('authenticate', {...});
});

// On disconnect
socket.on('disconnect', () => {
  showMessage('Connection lost...');
});

// Auto-reconnect (built-in)
socket.on('reconnect', () => {
  showMessage('Reconnected!');
  // Socket.IO handles rejoining rooms
});
```

---

## 💡 Pro Tips

```typescript
// 1. Check turn before every action
const isMyTurn = game.currentPlayerId === myPlayerId;

// 2. Track draw state
const [hasDrawn, setHasDrawn] = useState(false);
socket.on('game:card_drawn', () => setHasDrawn(true));
socket.on('game:turn_changed', () => setHasDrawn(false));

// 3. Clean up listeners
useEffect(() => {
  socket.on('game:started', handleStart);
  return () => socket.off('game:started');
}, []);

// 4. Validate client-side first
if (!isValidMeld(cards)) {
  showError('Invalid meld');
  return; // Don't emit
}

// 5. Use game phase
switch (game.phase) {
  case 'WAITING_FOR_DRAW':
    // Show draw button
  case 'WAITING_FOR_PLAY':
    // Show play/discard buttons
  case 'WAITING_FOR_DISCARD':
    // Show discard button
}
```

---

## 🧪 Testing Flow

```
Player 1              Player 2
   │                     │
   ├─ authenticate       ├─ authenticate
   │                     │
   ├─ create game        │
   │                     │
   │                     ├─ join game
   │                     │
   ├─ ready              ├─ ready
   │                     │
   ├─ start game         │
   │                     │
   ├─ draw card          │
   ├─ (play meld)        │
   ├─ discard            │
   │                     │
   │                     ├─ draw card
   │                     ├─ discard
   │                     │
   ├─ draw card          │
   ├─ play meld          │
   ├─ discard            │
   │                     │
   ...                  ...
   │                     │
   ├─ declare Rami       │
   │                     │
   └─ Game Over!         └─ Game Over!
```

---

## 📊 Meld Validation

```typescript
// SET: Same rank, different suits, 3+ cards
const isValidSet = (cards: Card[]) => {
  const rank = cards[0].rank;
  const suits = new Set(cards.map(c => c.suit));
  return cards.length >= 3 &&
         cards.every(c => c.rank === rank) &&
         suits.size === cards.length;
};

// RUN: Sequential ranks, same suit, 3+ cards
const isValidRun = (cards: Card[]) => {
  const suit = cards[0].suit;
  const sorted = [...cards].sort((a, b) => 
    getRankValue(a) - getRankValue(b)
  );
  
  // Check same suit
  if (!sorted.every(c => c.suit === suit)) return false;
  
  // Check sequential
  for (let i = 1; i < sorted.length; i++) {
    if (getRankValue(sorted[i]) !== 
        getRankValue(sorted[i-1]) + 1) {
      return false;
    }
  }
  
  return sorted.length >= 3;
};
```

---

## 🎨 UI State Management

```typescript
// Game context
const [gameState, setGameState] = useState<GameState | null>(null);
const [isMyTurn, setIsMyTurn] = useState(false);
const [hasDrawn, setHasDrawn] = useState(false);
const [selectedCards, setSelectedCards] = useState<string[]>([]);

// Update on events
socket.on('game:state_update', ({ game }) => {
  setGameState(game);
  setIsMyTurn(game.currentPlayerId === myPlayerId);
});

socket.on('game:card_drawn', ({ game }) => {
  setGameState(game);
  setHasDrawn(true);
});

socket.on('game:turn_changed', ({ game }) => {
  setGameState(game);
  setHasDrawn(false);
  setSelectedCards([]);
  setIsMyTurn(game.currentPlayerId === myPlayerId);
});

// Render conditionally
{isMyTurn && !hasDrawn && (
  <button onClick={handleDraw}>Draw Card</button>
)}

{isMyTurn && hasDrawn && (
  <button onClick={handleDiscard}>Discard</button>
)}
```

---

## 📦 Complete Hook Example

```typescript
export const useGame = (gameId: string) => {
  const socket = useSocket();
  const [game, setGame] = useState<GameState | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const handleUpdate = ({ game }: any) => {
      setGame(game);
      setIsMyTurn(game.currentPlayerId === myPlayerId);
    };

    const handleDrawn = ({ game }: any) => {
      setGame(game);
      setHasDrawn(true);
    };

    const handleTurnChanged = ({ game }: any) => {
      setGame(game);
      setHasDrawn(false);
      setIsMyTurn(game.currentPlayerId === myPlayerId);
    };

    socket.on('game:state_update', handleUpdate);
    socket.on('game:card_drawn', handleDrawn);
    socket.on('game:turn_changed', handleTurnChanged);

    return () => {
      socket.off('game:state_update');
      socket.off('game:card_drawn');
      socket.off('game:turn_changed');
    };
  }, [gameId, socket]);

  const drawCard = (fromDiscard: boolean) => {
    socket.emit('game:draw', { gameId, fromDiscard });
  };

  const playMeld = (cardIds: string[], meldType: 'SET' | 'RUN') => {
    socket.emit('game:play', { gameId, cardIds, meldType });
  };

  const discardCard = (cardId: string) => {
    socket.emit('game:discard', { gameId, cardId });
  };

  const declareRami = () => {
    socket.emit('game:declare', { gameId });
  };

  return {
    game,
    isMyTurn,
    hasDrawn,
    drawCard,
    playMeld,
    discardCard,
    declareRami,
  };
};
```

---

## 🔗 Quick Links

- **Full API**: `/server/SOCKET_HANDLERS.md`
- **Quick Start**: `/server/SOCKET_QUICKSTART.md`
- **Architecture**: `/ARCHITECTURE.md`
- **Types**: `/shared/types/`

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| Not authenticated | Emit `authenticate` after connect |
| Not your turn | Check `currentPlayerId === myPlayerId` |
| Invalid meld | Validate client-side first |
| Card not in hand | Refresh game state |
| Redis error | Server auto-fallbacks to memory |

---

**Need help? Check the docs!** 📚
