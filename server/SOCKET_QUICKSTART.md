# Socket.IO Implementation - Quick Start Guide

## What Was Implemented

### 1. GameEngine Service (`/server/src/services/game.service.ts`)
Complete game logic engine with:
- ✅ Full deck creation (2 decks + jokers = 108 cards)
- ✅ Card shuffling and dealing
- ✅ Turn-based gameplay phases
- ✅ Meld validation (Sets and Runs with Joker support)
- ✅ Score calculation
- ✅ Game state management
- ✅ No networking code (pure logic)

### 2. Game Event Handlers (`/server/src/socket/handlers/game.handler.ts`)
Socket.IO handlers for all game events:
- ✅ `game:join` - Join existing game
- ✅ `game:start` - Start game (host only)
- ✅ `game:draw` - Draw from deck/discard
- ✅ `game:play` - Create melds
- ✅ `game:discard` - Discard card and end turn
- ✅ `game:declare` - Declare Rami
- ✅ `game:end_turn` - End turn manually
- ✅ `game:leave` - Leave game

### 3. Player Event Handlers (`/server/src/socket/handlers/player.handler.ts`)
Socket.IO handlers for player interactions:
- ✅ `player:ready` - Mark ready in lobby
- ✅ `player:not_ready` - Mark not ready
- ✅ `player:message` - Send chat messages
- ✅ `player:typing` - Typing indicators
- ✅ `player:emote` - Send emotes/reactions
- ✅ `player:get_messages` - Retrieve chat history
- ✅ `player:status` - Update player status

### 4. Socket Server Setup (`/server/src/socket/index.ts`)
Main Socket.IO initialization with:
- ✅ Connection handling
- ✅ Authentication
- ✅ Reconnection logic
- ✅ Heartbeat/ping-pong
- ✅ Disconnect handling
- ✅ Get active games list

## Key Features

### State Management
- **Dual Storage**: In-memory (GameEngine) + Redis persistence
- **Privacy Levels**: Public state vs player-specific views
- **Sync Strategy**: All updates go to both in-memory and Redis

### Validation
Every action is validated:
1. ✅ Player authentication
2. ✅ Game exists and in correct status
3. ✅ Player's turn (for game actions)
4. ✅ Game phase (draw → play → discard)
5. ✅ Valid moves (meld validation, card ownership)

### Broadcasting
- **Room-based**: Only players in game receive updates
- **Selective**: Different data for different players
- **Privacy**: Other players' hands are hidden

## How to Use

### Server Side (Already Done)
The handlers are already integrated into your Socket.IO server setup.

### Client Side Example

```typescript
import { io, Socket } from 'socket.io-client';

// Connect to server
const socket: Socket = io('http://localhost:3001');

// 1. Authenticate
socket.emit('authenticate', {
  playerId: 'discord_user_123',
  playerName: 'Alice',
  playerAvatar: 'https://cdn.discordapp.com/avatars/...'
});

socket.on('authenticated', ({ playerId }) => {
  console.log('Authenticated:', playerId);
});

// 2. Join a game
socket.emit('game:join', {
  gameId: 'game_abc_123',
  playerId: 'discord_user_123',
  playerName: 'Alice',
  playerAvatar: 'https://...'
});

socket.on('game:joined', ({ game }) => {
  console.log('Joined game!');
  console.log('My hand:', game.myHand);
  console.log('Players:', game.players);
});

// 3. Mark ready (in lobby)
socket.emit('player:ready', {
  gameId: 'game_abc_123'
});

socket.on('player:all_ready', ({ canStart }) => {
  if (canStart) {
    console.log('All players ready! Host can start.');
  }
});

// 4. Start game (host only)
socket.emit('game:start', {
  gameId: 'game_abc_123'
});

socket.on('game:started', ({ game }) => {
  console.log('Game started!');
  console.log('My hand:', game.myHand);
  console.log('Current player:', game.currentPlayerId);
});

// 5. Draw a card (on your turn)
socket.emit('game:draw', {
  gameId: 'game_abc_123',
  fromDiscard: false // true to draw from discard pile
});

socket.on('game:card_drawn', ({ game }) => {
  console.log('Drew a card!');
  console.log('Updated hand:', game.myHand);
});

// 6. Play a meld
socket.emit('game:play', {
  gameId: 'game_abc_123',
  cardIds: ['card1_id', 'card2_id', 'card3_id'],
  meldType: 'SET' // or 'RUN'
});

socket.on('game:meld_created', ({ game }) => {
  console.log('Meld created!');
});

// 7. Discard a card
socket.emit('game:discard', {
  gameId: 'game_abc_123',
  cardId: 'card_to_discard_id'
});

socket.on('game:turn_changed', ({ currentPlayerId, game }) => {
  console.log('Turn changed to:', currentPlayerId);
});

// 8. Declare Rami (when hand is empty)
socket.emit('game:declare', {
  gameId: 'game_abc_123'
});

socket.on('game:rami_declared', ({ playerId, roundScores }) => {
  console.log(`${playerId} declared Rami!`);
  console.log('Round scores:', roundScores);
});

// 9. Chat
socket.emit('player:message', {
  gameId: 'game_abc_123',
  message: 'Good game everyone!'
});

socket.on('player:message', ({ playerName, message, timestamp }) => {
  console.log(`${playerName}: ${message}`);
});

// 10. Handle errors
socket.on('game:error', ({ message, code }) => {
  console.error('Game error:', message, code);
});

socket.on('player:error', ({ message, code }) => {
  console.error('Player error:', message, code);
});
```

## Testing Flow

### 1. Setup (2+ clients needed)
```bash
# Terminal 1 - Player 1
npm run dev

# Terminal 2 - Player 2 (separate browser/incognito)
npm run dev
```

### 2. Test Sequence

**Player 1 (Host):**
1. Authenticate
2. Create/Join game
3. Wait for Player 2

**Player 2:**
1. Authenticate
2. Join same game
3. Mark ready

**Both Players:**
1. Mark ready

**Player 1 (Host):**
1. Start game

**Game Loop (Players take turns):**
1. Current player draws card
2. (Optional) Play melds
3. Discard card
4. Repeat until someone declares Rami

### 3. Test Chat
```typescript
// Any time during game
socket.emit('player:message', {
  gameId: 'game_abc_123',
  message: 'Nice move!'
});

socket.emit('player:emote', {
  gameId: 'game_abc_123',
  emote: '👍'
});
```

## Events Reference

### Listen For (Client)

**Game Events:**
- `game:joined` - Successfully joined
- `game:player_joined` - Another player joined
- `game:started` - Game started
- `game:card_drawn` - Card drawn
- `game:meld_created` - Meld created
- `game:card_discarded` - Card discarded
- `game:turn_changed` - Turn changed
- `game:rami_declared` - Rami declared
- `game:round_ended` - Round ended
- `game:over` - Game over
- `game:player_left` - Player left
- `game:error` - Game error

**Player Events:**
- `player:ready` - Player ready
- `player:not_ready` - Player not ready
- `player:all_ready` - All players ready
- `player:message` - Chat message
- `player:messages` - Chat history
- `player:typing` - Player typing
- `player:emote` - Emote received
- `player:disconnected` - Player disconnected
- `player:reconnected` - Player reconnected
- `player:error` - Player error

**Connection Events:**
- `authenticated` - Authentication success
- `auth_error` - Authentication failed
- `reconnected` - Reconnection success
- `pong` - Heartbeat response
- `games_list` - List of games

## Common Issues & Solutions

### 1. "Not authenticated" error
**Solution:** Always emit `authenticate` after connecting

```typescript
socket.on('connect', () => {
  socket.emit('authenticate', { ... });
});
```

### 2. "Not your turn" error
**Solution:** Check `game.currentPlayerId` before actions

```typescript
socket.on('game:turn_changed', ({ currentPlayerId }) => {
  if (currentPlayerId === myPlayerId) {
    // Now it's my turn
  }
});
```

### 3. "Already drew a card this turn"
**Solution:** Track `hasDrawn` state

```typescript
let hasDrawn = false;

socket.on('game:card_drawn', () => {
  hasDrawn = true;
});

socket.on('game:turn_changed', () => {
  hasDrawn = false;
});
```

### 4. "Invalid meld" error
**Solution:** Validate melds client-side before sending

```typescript
// Sets: Same rank, different suits (3+ cards)
const isValidSet = (cards) => {
  const rank = cards[0].rank;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.rank === rank) && 
         suits.size === cards.length &&
         cards.length >= 3;
};

// Runs: Sequential ranks, same suit (3+ cards)
const isValidRun = (cards) => {
  const suit = cards[0].suit;
  const sortedCards = [...cards].sort((a, b) => 
    getRankValue(a.rank) - getRankValue(b.rank)
  );
  // Check sequential and same suit
};
```

### 5. Redis connection issues
**Solution:** Handlers automatically fallback to in-memory

```typescript
// The handlers already handle this:
try {
  const game = await getGameState(gameId);
} catch {
  return gameEngine.getGame(gameId); // Fallback
}
```

## Next Steps

1. **Add to Client Context**
   ```typescript
   // In GameContext.tsx
   import { useSocket } from '../hooks/useSocket';
   
   const GameContext = () => {
     const socket = useSocket();
     
     const joinGame = (gameId: string) => {
       socket.emit('game:join', { gameId, ... });
     };
     
     useEffect(() => {
       socket.on('game:joined', handleGameJoined);
       socket.on('game:turn_changed', handleTurnChanged);
       // ... other listeners
       
       return () => {
         socket.off('game:joined');
         socket.off('game:turn_changed');
       };
     }, []);
   };
   ```

2. **Create React Hooks**
   ```typescript
   // useGame.ts
   export const useGame = (gameId: string) => {
     const [gameState, setGameState] = useState<GameState | null>(null);
     const socket = useSocket();
     
     const drawCard = (fromDiscard: boolean) => {
       socket.emit('game:draw', { gameId, fromDiscard });
     };
     
     const playMeld = (cardIds: string[], meldType: 'SET' | 'RUN') => {
       socket.emit('game:play', { gameId, cardIds, meldType });
     };
     
     const discardCard = (cardId: string) => {
       socket.emit('game:discard', { gameId, cardId });
     };
     
     return { gameState, drawCard, playMeld, discardCard };
   };
   ```

3. **Build UI Components**
   - Game board
   - Player hand
   - Discard pile
   - Chat window
   - Turn indicator

## Documentation
- Full API reference: `/server/SOCKET_HANDLERS.md`
- Game types: `/shared/types/game.types.ts`
- Card types: `/shared/types/card.types.ts`
- Player types: `/shared/types/player.types.ts`

## Support
Check the console logs for detailed error messages and event flow.
All handlers log successful operations with ✅ and errors with ❌.
