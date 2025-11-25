# Socket.IO Event Handlers Implementation

## Overview
Complete Socket.IO event handler implementation with GameEngine validation and Redis state management.

## File Structure
```
server/src/
├── services/
│   └── game.service.ts          # GameEngine class with game logic
├── socket/
│   ├── index.ts                 # Main socket setup & connection handling
│   └── handlers/
│       ├── game.handler.ts      # Game event handlers
│       └── player.handler.ts    # Player event handlers
```

## Architecture

### GameEngine (game.service.ts)
Pure TypeScript game logic with no networking:
- `newGame()` - Create new game
- `joinGame()` - Join existing game
- `startGame()` - Deal cards and start
- `drawCard()` - Draw from deck/discard
- `playCard()` - Create melds (sets/runs)
- `discardCard()` - Discard and end turn
- `declareRami()` - Go out
- `endTurn()` - Move to next player
- `calculateScores()` - Score calculation

### State Management
- **In-Memory**: GameEngine maintains Map<gameId, GameState>
- **Redis**: Persistent storage with 24-hour expiry
- **Sync**: Handlers update both in-memory and Redis

## Event Handlers

### Socket Connection (index.ts)

#### Connection Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `authenticate` | Client → Server | Authenticate player with Discord credentials |
| `authenticated` | Server → Client | Authentication successful |
| `auth_error` | Server → Client | Authentication failed |
| `reconnect` | Client → Server | Reconnect with session ID |
| `reconnected` | Server → Client | Reconnection successful |
| `disconnect` | Auto | Player disconnected |

#### Utility Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `create_game` | Client → Server | Create new game (placeholder) |
| `get_games` | Client → Server | Get list of active games |
| `games_list` | Server → Client | Return list of games |
| `ping` | Client → Server | Heartbeat keepalive |
| `pong` | Server → Client | Heartbeat response |

### Game Events (game.handler.ts)

#### Core Game Events
| Event | Data | Validation | Response |
|-------|------|------------|----------|
| `game:join` | `{gameId, playerId, playerName, playerAvatar}` | Game exists, not full, valid lobby | `game:joined`, broadcast `game:player_joined` |
| `game:start` | `{gameId}` | Host only, min players met | Broadcast `game:started` |
| `game:draw` | `{gameId, fromDiscard?}` | Player's turn, not already drawn | `game:card_drawn` |
| `game:play` | `{gameId, cardIds, meldType}` | Valid meld, player drawn | Broadcast `game:meld_created` |
| `game:discard` | `{gameId, cardId}` | Card in hand, player drawn | Broadcast `game:card_discarded`, `game:turn_changed` |
| `game:declare` | `{gameId}` | Empty hand, has melds | Broadcast `game:rami_declared` |
| `game:end_turn` | `{gameId}` | Player's turn, has drawn | Broadcast `game:turn_ended`, `game:turn_changed` |
| `game:leave` | `{gameId}` | Player in game | `game:left`, broadcast `game:player_left` |

#### Game Broadcast Events
| Event | When | Data |
|-------|------|------|
| `game:player_joined` | Player joins | Public game state |
| `game:started` | Game starts | Player-specific views with hands |
| `game:card_drawn` | Card drawn | Drawer gets full view, others get public |
| `game:meld_created` | Meld played | Updated public state |
| `game:card_discarded` | Card discarded | Updated public state, new turn |
| `game:turn_changed` | Turn changes | Current player ID, updated views |
| `game:rami_declared` | Rami declared | Winner, scores, game over check |
| `game:round_ended` | Round ends | Round winner, scores |
| `game:over` | Game ends | Final winner, all scores |
| `game:player_left` | Player leaves | Updated public state |

#### Error Events
| Event | Code | Message |
|-------|------|---------|
| `game:error` | `GAME_NOT_FOUND` | Game not found |
| `game:error` | `NOT_AUTHENTICATED` | Not authenticated |
| `game:error` | `NOT_HOST` | Only host can start |
| `game:error` | `JOIN_FAILED` | Failed to join game |
| `game:error` | `START_FAILED` | Failed to start game |
| `game:error` | `DRAW_FAILED` | Failed to draw card |
| `game:error` | `PLAY_FAILED` | Failed to play cards |
| `game:error` | `DISCARD_FAILED` | Failed to discard card |
| `game:error` | `DECLARE_FAILED` | Failed to declare Rami |
| `game:error` | `END_TURN_FAILED` | Failed to end turn |

### Player Events (player.handler.ts)

#### Player Status Events
| Event | Data | Validation | Response |
|-------|------|------------|----------|
| `player:ready` | `{gameId}` | In lobby, player in game | Broadcast `player:ready`, `player:all_ready` if all ready |
| `player:not_ready` | `{gameId}` | In lobby, player in game | Broadcast `player:not_ready` |
| `player:typing` | `{gameId, isTyping}` | Player in game | Broadcast to others `player:typing` |
| `player:message` | `{gameId, message}` | Message valid (1-500 chars) | Broadcast `player:message`, store in Redis |
| `player:emote` | `{gameId, emote}` | Valid emote | Broadcast `player:emote` |
| `player:status` | `{gameId, status}` | Valid status | Broadcast to others `player:status` |
| `player:get_messages` | `{gameId, limit?}` | Player in game | `player:messages` with history |

#### Player Broadcast Events
| Event | When | Data |
|-------|------|------|
| `player:ready` | Player ready | `{playerId, playerName, allReady}` |
| `player:not_ready` | Player not ready | `{playerId, playerName}` |
| `player:all_ready` | All ready | `{gameId, canStart: true}` |
| `player:message` | Chat message | `{playerId, playerName, message, timestamp}` |
| `player:messages` | Message history | `{gameId, messages[]}` |
| `player:typing` | Player typing | `{playerId, playerName, isTyping}` |
| `player:emote` | Emote sent | `{playerId, playerName, emote, timestamp}` |
| `player:status` | Status change | `{playerId, status, timestamp}` |
| `player:disconnected` | Player disconnects | `{playerId, playerName, timestamp}` |
| `player:reconnected` | Player reconnects | `{playerId, playerName, timestamp}` |

#### Error Events
| Event | Code | Message |
|-------|------|---------|
| `player:error` | `NOT_AUTHENTICATED` | Not authenticated |
| `player:error` | `GAME_NOT_FOUND` | Game not found |
| `player:error` | `PLAYER_NOT_FOUND` | Player not in game |
| `player:error` | `GAME_IN_PROGRESS` | Cannot change ready during game |
| `player:error` | `EMPTY_MESSAGE` | Message cannot be empty |
| `player:error` | `MESSAGE_TOO_LONG` | Message too long (max 500) |
| `player:error` | `INVALID_EMOTE` | Invalid emote |

## State Synchronization

### Flow
1. **Client sends event** → Socket handler receives
2. **Validate** → Check authentication, turn, game phase
3. **Engine processes** → GameEngine validates and updates state
4. **Redis saves** → Persistent storage with TTL
5. **Broadcast** → Emit updates to room

### Room Management
- Room format: `game:{gameId}`
- Players auto-join on `game:join`
- Players leave on `game:leave` or disconnect
- Broadcasts use `io.to('game:${gameId}')` or `socket.to('game:${gameId}')`

### Privacy Levels
1. **Public State** (`GameStatePublic`): All players see
   - Player names, avatars, card counts
   - Discard pile (top 3 cards)
   - Draw pile count
   - Table melds
   - Current turn info
   
2. **Player View** (`PlayerGameView`): Individual player only
   - Own hand
   - Own melds
   - Legal moves
   - Can Rami status

## Redis Storage

### Keys
```typescript
REDIS_KEYS = {
  GAME_STATE: 'game:{gameId}:state',
  GAME_PLAYERS: 'game:{gameId}:players',
  PLAYER_SESSION: 'player:{playerId}:session',
  ACTIVE_GAMES: 'games:active',
  LOBBY_GAMES: 'games:lobby',
  PLAYER_GAMES: 'player:{playerId}:games',
  TURN_TIMER: 'game:{gameId}:timer',
}
```

### TTL (Time To Live)
- Game state: 24 hours
- Player session: 24 hours (1 hour after disconnect)
- Messages: 24 hours (last 100 kept)

## Error Handling

### Strategy
1. **Try-catch** all async operations
2. **Emit errors** to originating socket
3. **Log errors** to console
4. **Silent fail** for non-critical (typing indicators)
5. **Graceful degradation** (Redis → in-memory fallback)

### Error Format
```typescript
{
  message: string,    // Human-readable error
  code: string,       // Machine-readable code
  details?: any       // Optional debug info
}
```

## Security Considerations

### Current Implementation
- ✅ Authentication required for all game actions
- ✅ Turn validation (only current player can act)
- ✅ Host-only game start
- ✅ Message length limits (500 chars)
- ✅ Valid emote whitelist
- ✅ Player in game verification

### Future Enhancements
- 🔄 Discord token validation
- 🔄 Rate limiting per player
- 🔄 IP-based abuse prevention
- 🔄 Encrypted game state
- 🔄 Signed game actions

## Testing Checklist

### Game Flow
- [ ] Create game
- [ ] Join game (multiple players)
- [ ] Ready up
- [ ] Start game
- [ ] Draw card (deck)
- [ ] Draw card (discard)
- [ ] Play meld (set)
- [ ] Play meld (run)
- [ ] Discard card
- [ ] End turn
- [ ] Declare Rami
- [ ] Calculate scores
- [ ] Game over

### Player Interactions
- [ ] Chat messages
- [ ] Typing indicators
- [ ] Emotes
- [ ] Ready status
- [ ] Disconnect handling
- [ ] Reconnect handling

### Edge Cases
- [ ] Join full game (reject)
- [ ] Start with <2 players (reject)
- [ ] Draw when not your turn (reject)
- [ ] Play invalid meld (reject)
- [ ] Discard before drawing (reject)
- [ ] Declare Rami with cards in hand (reject)
- [ ] Deck empty (reshuffle)
- [ ] All players disconnect
- [ ] Redis connection lost

## Performance Optimizations

### Current
- ✅ Room-based broadcasting (not global)
- ✅ Redis connection pooling
- ✅ In-memory game state caching
- ✅ Minimal data in broadcasts (no full state)
- ✅ Player-specific views (hide others' hands)

### Future
- 🔄 Batch updates for multiple state changes
- 🔄 Debounced typing indicators
- 🔄 Compressed game state in Redis
- 🔄 WebSocket compression
- 🔄 CDN for static assets

## Integration

### Client Usage Example
```typescript
// Connect
socket.emit('authenticate', {
  playerId: 'user123',
  playerName: 'Alice',
  playerAvatar: 'https://...'
});

// Join game
socket.emit('game:join', {
  gameId: 'game456',
  playerId: 'user123',
  playerName: 'Alice',
  playerAvatar: 'https://...'
});

// Listen for game state
socket.on('game:joined', ({ game }) => {
  console.log('My hand:', game.myHand);
});

// Draw card
socket.emit('game:draw', {
  gameId: 'game456',
  fromDiscard: false
});

// Play meld
socket.emit('game:play', {
  gameId: 'game456',
  cardIds: ['card1', 'card2', 'card3'],
  meldType: 'SET'
});

// Send chat
socket.emit('player:message', {
  gameId: 'game456',
  message: 'Good game!'
});
```

## Logging

### Log Levels
- ✅ Connection/disconnection
- ✅ Authentication
- ✅ Game state changes
- ✅ Player actions
- ✅ Errors with stack traces
- ✅ Chat messages (truncated)

### Format
```
✅ Success events (green checkmark)
❌ Errors (red X)
💬 Chat messages
📡 Network events
🎮 Game actions
```

## Next Steps

### Immediate
1. Add Discord OAuth validation
2. Implement turn timers
3. Add spectator mode
4. Create admin commands

### Future
1. Game replays
2. Statistics tracking
3. Matchmaking system
4. Tournament mode
5. AI opponents
6. Mobile push notifications

## Dependencies
- `socket.io` - WebSocket library
- `redis` - State persistence
- `uuid` - ID generation
- Shared types from `/shared/types/`

## Notes
- All handlers are async for Redis operations
- Fallback to in-memory if Redis fails
- Broadcasts include both public state and player views
- Chat history stored in Redis (last 100 messages)
- Player sessions persist for 1 hour after disconnect for reconnection
