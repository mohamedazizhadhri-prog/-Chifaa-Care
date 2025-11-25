# 🏗️ Rami Game - System Architecture

## Overview
```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (React + Socket.IO Client - Your Implementation)           │
└─────────────────┬───────────────────────────────────────────┘
                  │ Socket.IO Events
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    SOCKET.IO SERVER                          │
│                  (socket/index.ts)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Connection Management                                │  │
│  │  • Authentication                                     │  │
│  │  • Heartbeat (ping/pong)                             │  │
│  │  • Reconnection                                       │  │
│  │  • Disconnect handling                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Event Handlers                                       │  │
│  │  ├─ game.handler.ts                                  │  │
│  │  │  • game:create                                     │  │
│  │  │  • game:join                                       │  │
│  │  │  • game:start                                      │  │
│  │  │  • game:draw                                       │  │
│  │  │  • game:play                                       │  │
│  │  │  • game:discard                                    │  │
│  │  │  • game:declare                                    │  │
│  │  │  • game:leave                                      │  │
│  │  │                                                     │  │
│  │  └─ player.handler.ts                                │  │
│  │     • player:ready                                    │  │
│  │     • player:message                                  │  │
│  │     • player:emote                                    │  │
│  │     • player:typing                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────┬────────────────────────────┬──────────────────┘
              │                            │
              ▼                            ▼
┌─────────────────────────┐  ┌─────────────────────────────┐
│    GAME ENGINE          │  │     REDIS STORAGE           │
│  (game.service.ts)      │  │   (config/redis.ts)         │
│                         │  │                             │
│  • Game Logic           │  │  • Game State              │
│  • Meld Validation      │  │  • Player Sessions         │
│  • Score Calculation    │  │  • Chat History            │
│  • Turn Management      │  │  • Active Games List       │
│  • Deck Management      │  │                             │
│  • Pure TypeScript      │  │  TTL: 24 hours             │
│  • No Networking        │  │  Fallback: In-Memory       │
└─────────────────────────┘  └─────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│   GAME CREATOR          │
│ (game-creator.service)  │
│                         │
│  • Game Presets         │
│  • Settings Validation  │
│  • Quick/Standard/etc.  │
└─────────────────────────┘
```

---

## Data Flow

### Creating a Game
```
Client                Socket Handler              GameEngine              Redis
  │                         │                         │                     │
  ├─ authenticate ─────────>│                         │                     │
  │<─ authenticated ────────┤                         │                     │
  │                         │                         │                     │
  ├─ game:create ──────────>│                         │                     │
  │                         ├─ newGame() ──────────>│                     │
  │                         │<─ GameState ───────────┤                     │
  │                         ├─ saveGameState() ──────────────────────────>│
  │                         │                         │                     │
  │<─ game:created ─────────┤                         │                     │
  │                         │                         │                     │
```

### Joining a Game
```
Client 2              Socket Handler              GameEngine              Redis
  │                         │                         │                     │
  ├─ authenticate ─────────>│                         │                     │
  │<─ authenticated ────────┤                         │                     │
  │                         │                         │                     │
  ├─ game:join ────────────>│                         │                     │
  │                         ├─ getGameState() ───────────────────────────>│
  │                         │<─ GameState ────────────────────────────────┤
  │                         ├─ joinGame() ───────────>│                     │
  │                         │<─ GameState ────────────┤                     │
  │                         ├─ saveGameState() ──────────────────────────>│
  │                         │                         │                     │
  │<─ game:joined ──────────┤                         │                     │
  │                         │                         │                     │
[Broadcast to room] <───────┤                         │                     │
  game:player_joined        │                         │                     │
```

### Playing a Turn
```
Client                Socket Handler              GameEngine              Redis
  │                         │                         │                     │
  ├─ game:draw ────────────>│                         │                     │
  │                         ├─ drawCard() ───────────>│                     │
  │                         │<─ GameState ────────────┤                     │
  │                         ├─ saveGameState() ──────────────────────────>│
  │                         │                         │                     │
  │<─ game:card_drawn ──────┤                         │                     │
[Broadcast] <───────────────┤                         │                     │
  │                         │                         │                     │
  ├─ game:play ────────────>│                         │                     │
  │                         ├─ playCard() ────────────>│                     │
  │                         │<─ GameState ────────────┤                     │
  │                         ├─ saveGameState() ──────────────────────────>│
[Broadcast] <───────────────┤                         │                     │
  game:meld_created         │                         │                     │
  │                         │                         │                     │
  ├─ game:discard ─────────>│                         │                     │
  │                         ├─ discardCard() ─────────>│                     │
  │                         │<─ GameState ────────────┤                     │
  │                         ├─ saveGameState() ──────────────────────────>│
[Broadcast] <───────────────┤                         │                     │
  game:turn_changed         │                         │                     │
```

---

## Room-Based Broadcasting

```
┌─────────────────────────────────────────────────────────┐
│                   Socket.IO Server                       │
└─────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
   Room: game:1     Room: game:2    Room: game:3
   │                │                │
   ├─ Player 1      ├─ Player 3      ├─ Player 6
   ├─ Player 2      └─ Player 4      ├─ Player 7
   └─ Spectators                     └─ Player 8

When Player 1 draws a card:
  ✅ Broadcast to room:game:1 (Player 1, Player 2)
  ❌ NOT broadcast to game:2 or game:3

When Player 3 sends chat:
  ✅ Broadcast to room:game:2 (Player 3, Player 4)
  ❌ NOT broadcast to other rooms
```

---

## State Privacy Levels

### Public State (GameStatePublic)
```typescript
{
  id: "game_123",
  players: [
    {
      id: "player_1",
      username: "Alice",
      cardCount: 7,        // Number only, not cards
      meldCount: 2,
      score: 45
    },
    // ... other players
  ],
  currentPlayerId: "player_1",
  topDiscardCard: { suit: "HEARTS", rank: "KING" },
  drawPileCount: 82,
  tableMelds: [...],     // Visible melds
  // NO player hands!
}
```

### Player-Specific View (PlayerGameView)
```typescript
{
  ...publicState,
  myHand: [              // Only your cards
    { suit: "SPADES", rank: "ACE" },
    { suit: "HEARTS", rank: "2" },
    // ... rest of hand
  ],
  myMelds: [...],        // Your melds
  canRami: false,
  myLegalMoves: {...}
}
```

---

## Error Handling Flow

```
                    ┌─────────────────┐
                    │  Client Event   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Try-Catch      │
                    └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                   ▼                   ▼
          ┌────────────────┐   ┌────────────────┐
          │   Success      │   │    Error       │
          └───────┬────────┘   └───────┬────────┘
                  │                    │
                  ▼                    ▼
     ┌────────────────────┐   ┌────────────────┐
     │ Update GameEngine  │   │  Emit Error    │
     └───────┬────────────┘   │  Event         │
             │                │  • message     │
             ▼                │  • code        │
     ┌────────────────────┐   │  • details     │
     │  Save to Redis     │   └────────────────┘
     └───────┬────────────┘            │
             │                         │
             ▼                         ▼
     ┌────────────────────┐   ┌────────────────┐
     │ Broadcast Update   │   │  Log Error     │
     └────────────────────┘   └────────────────┘
```

---

## Authentication Flow

```
┌──────────┐                                           ┌──────────┐
│  Client  │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     ├─ connect() ─────────────────────────────────────────>│
     │                                                      │
     │<──────────────────────────────── socket.on('connect')┤
     │                                                      │
     ├─ emit('authenticate', {                             │
     │    playerId, playerName, playerAvatar              │
     │  }) ─────────────────────────────────────────────────>│
     │                                                      │
     │                           ┌─────────────────────┐   │
     │                           │ Validate Credentials│   │
     │                           │ Store in socket.data│   │
     │                           │ Create Redis session│   │
     │                           └─────────────────────┘   │
     │                                                      │
     │<─────────────────── emit('authenticated', {...}) ───┤
     │                                                      │
     ├─ Now can use game events                            │
     │                                                      │
```

---

## Reconnection Flow

```
┌──────────┐                                           ┌──────────┐
│  Client  │                                           │  Server  │
└────┬─────┘                                           └────┬─────┘
     │                                                      │
     │  [Connection lost]                                  │
     │                                                      │
     ├─ disconnect ◄────────────────────────────────────────┤
     │                                                      │
     │                           ┌─────────────────────┐   │
     │                           │ Mark player offline │   │
     │                           │ Keep session 1hr    │   │
     │                           │ Notify other players│   │
     │                           └─────────────────────┘   │
     │                                                      │
     │  [Reconnect attempt]                                │
     │                                                      │
     ├─ connect() ─────────────────────────────────────────>│
     │                                                      │
     ├─ emit('reconnect', {                                │
     │    playerId, sessionId                              │
     │  }) ─────────────────────────────────────────────────>│
     │                                                      │
     │                           ┌─────────────────────┐   │
     │                           │ Verify session      │   │
     │                           │ Restore state       │   │
     │                           │ Rejoin rooms        │   │
     │                           │ Mark online         │   │
     │                           │ Notify players      │   │
     │                           └─────────────────────┘   │
     │                                                      │
     │<──────────────────── emit('reconnected', {...}) ────┤
     │                                                      │
     │  [Game state restored]                              │
     │                                                      │
```

---

## Chat System Architecture

```
┌─────────────────────────────────────────────────────┐
│                Chat System                           │
└─────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
  Send Message      Get History       Typing
        │                │                │
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Validate     │  │ Redis LRANGE │  │ Broadcast    │
│ • Length     │  │ Last 100     │  │ To Others    │
│ • Content    │  │ Messages     │  │ Only         │
└──────┬───────┘  └──────┬───────┘  └──────────────┘
       │                 │
       ▼                 │
┌──────────────┐         │
│ Store Redis  │         │
│ • RPUSH      │         │
│ • LTRIM 100  │         │
│ • EXPIRE 24h │         │
└──────┬───────┘         │
       │                 │
       ▼                 ▼
┌─────────────────────────────┐
│  Broadcast to Room           │
│  player:message              │
└─────────────────────────────┘
```

---

## Game State Synchronization

```
┌──────────────────────────────────────────────────────┐
│              Synchronization Strategy                 │
└──────────────────────────────────────────────────────┘

In-Memory (GameEngine)           Redis
┌────────────────────┐          ┌────────────────────┐
│ Map<gameId, State> │  ◄─────► │ game:id:state     │
│                    │   sync   │                    │
│ • Fast reads       │          │ • Persistent       │
│ • Local access     │          │ • 24hr TTL         │
│ • No latency       │          │ • Survives restart │
└────────────────────┘          └────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
    ┌─────────────────────────────────────────┐
    │  On Every State Change:                 │
    │  1. Update in-memory (GameEngine)       │
    │  2. Save to Redis                       │
    │  3. Broadcast to room                   │
    │                                         │
    │  On Fetch:                              │
    │  1. Try Redis first                     │
    │  2. Fallback to in-memory               │
    │  3. Convert date strings                │
    └─────────────────────────────────────────┘
```

---

## Performance Considerations

```
┌─────────────────────────────────────────────────────┐
│                  Optimization                        │
└─────────────────────────────────────────────────────┘

Room-Based Broadcasting
├─ Only players in game receive updates
├─ No global broadcasts
└─ Scales well with many games

State Diffing
├─ Public state (all players)
├─ Player view (individual)
└─ Minimize data sent

Redis Strategy
├─ Connection pooling
├─ Batch operations
├─ TTL for auto-cleanup
└─ Fallback to memory

In-Memory Cache
├─ Fast reads
├─ No database calls
└─ Periodic sync to Redis
```

---

## Scaling Strategy

```
┌────────────────────────────────────────────┐
│         Current (Single Server)             │
└────────────────────────────────────────────┘
              │
              ▼
     ┌─────────────────┐
     │ Socket.IO Server│
     └────────┬────────┘
              │
     ┌────────┴────────┐
     │                 │
     ▼                 ▼
┌─────────┐      ┌──────────┐
│  Redis  │      │ GameEngine│
└─────────┘      └──────────┘

┌────────────────────────────────────────────┐
│         Future (Load Balanced)              │
└────────────────────────────────────────────┘
              │
              ▼
     ┌─────────────────┐
     │  Load Balancer  │
     └────────┬────────┘
              │
     ┌────────┴────────┬────────┐
     ▼                 ▼        ▼
┌─────────┐      ┌─────────┐  ...
│ Server 1│      │ Server 2│
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ▼
     ┌─────────────────┐
     │  Redis Cluster  │
     │  (Sticky Sessions)│
     └─────────────────┘
```

---

This architecture provides:
- ✅ Real-time multiplayer gameplay
- ✅ State persistence
- ✅ Scalability
- ✅ Privacy & security
- ✅ Error resilience
- ✅ Reconnection handling
- ✅ Performance optimization
