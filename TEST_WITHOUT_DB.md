# 🚀 Quick Test Setup - No Database/Redis Required

## Step 1: Copy Test Environment
```bash
cd server
cp .env.test .env
```

## Step 2: Install Dependencies (if not done)
```bash
npm install
```

## Step 3: Start Server
```bash
npm run dev
```

You should see:
```
⚠️  Skipping database initialization (DATABASE_URL not set)
⚠️  Skipping Redis initialization (REDIS_URL not set)
🚀 Server running on http://localhost:3001
🎮 Socket.IO server ready
```

## Step 4: Test in Browser Console

### Open 2 Browser Tabs

**Tab 1 - Player 1 (Host):**
```javascript
// Connect
const socket = io('http://localhost:3001');

// Authenticate
socket.emit('authenticate', {
  playerId: 'player_1',
  playerName: 'Alice',
  playerAvatar: 'https://i.imgur.com/avatar1.png'
});

// Listen for events
socket.on('authenticated', (data) => {
  console.log('✅ Player 1 authenticated:', data);
  
  // Create game
  socket.emit('game:create', { preset: 'QUICK_2P' });
});

socket.on('game:created', ({ gameId, game }) => {
  console.log('✅ Game created!');
  console.log('Game ID:', gameId);
  console.log('My hand:', game.myHand);
  
  // Save gameId globally
  window.gameId = gameId;
  
  // Mark ready
  socket.emit('player:ready', { gameId });
});

socket.on('game:player_joined', (data) => {
  console.log('✅ Player 2 joined:', data.player.name);
});

socket.on('player:all_ready', () => {
  console.log('✅ All players ready! Starting game...');
  socket.emit('game:start', { gameId: window.gameId });
});

socket.on('game:started', (data) => {
  console.log('✅ GAME STARTED!');
  console.log('Current turn:', data.currentPlayer.name);
  console.log('My hand:', data.myHand);
  console.log('Deck size:', data.deckSize);
});

socket.on('game:turn_changed', (data) => {
  console.log('🔄 Turn changed to:', data.player.name);
});

socket.on('game:card_drawn', (data) => {
  console.log('🎴 Card drawn by:', data.player.name);
});

socket.on('game:card_discarded', (data) => {
  console.log('🗑️ Card discarded by:', data.player.name);
  console.log('Top discard:', data.discardPile[0]);
});

socket.on('game:error', (err) => {
  console.error('❌ Error:', err.message);
});

socket.on('player:message', (data) => {
  console.log(`💬 ${data.playerName}: ${data.message}`);
});

console.log('Player 1 setup complete. Waiting for Player 2...');
```

**Tab 2 - Player 2:**
```javascript
// Connect
const socket = io('http://localhost:3001');

// Authenticate
socket.emit('authenticate', {
  playerId: 'player_2',
  playerName: 'Bob',
  playerAvatar: 'https://i.imgur.com/avatar2.png'
});

socket.on('authenticated', () => {
  console.log('✅ Player 2 authenticated');
  
  // Get gameId from Player 1's console (copy/paste it)
  const gameId = prompt('Enter Game ID from Player 1:');
  window.gameId = gameId;
  
  // Join game
  socket.emit('game:join', {
    gameId: gameId,
    playerId: 'player_2',
    playerName: 'Bob',
    playerAvatar: 'https://i.imgur.com/avatar2.png'
  });
});

socket.on('game:joined', ({ game }) => {
  console.log('✅ Joined game!');
  console.log('My hand:', game.myHand);
  
  // Mark ready
  socket.emit('player:ready', { gameId: window.gameId });
});

socket.on('game:started', (data) => {
  console.log('✅ GAME STARTED!');
  console.log('Current turn:', data.currentPlayer.name);
  console.log('My hand:', data.myHand);
});

socket.on('game:turn_changed', (data) => {
  console.log('🔄 Turn changed to:', data.player.name);
});

socket.on('game:card_drawn', (data) => {
  console.log('🎴 Card drawn');
});

socket.on('game:card_discarded', (data) => {
  console.log('🗑️ Card discarded');
  console.log('Top discard:', data.discardPile[0]);
});

socket.on('game:error', (err) => {
  console.error('❌ Error:', err.message);
});

socket.on('player:message', (data) => {
  console.log(`💬 ${data.playerName}: ${data.message}`);
});

console.log('Player 2 setup complete.');
```

## Step 5: Play the Game

**When it's your turn:**

### Draw a card:
```javascript
// Draw from deck
socket.emit('game:draw', {
  gameId: window.gameId,
  fromDiscard: false
});
```

### Discard a card:
```javascript
// Look at your hand first (from game:started or game:card_drawn event)
// Then discard using actual card ID
socket.emit('game:discard', {
  gameId: window.gameId,
  cardId: 'CARD_ID_FROM_YOUR_HAND'  // Replace with actual ID
});
```

### Send a chat message:
```javascript
socket.emit('player:message', {
  gameId: window.gameId,
  message: 'Good luck!'
});
```

### Play a meld (3+ cards of same rank or sequence):
```javascript
socket.emit('game:play', {
  gameId: window.gameId,
  cardIds: ['card1', 'card2', 'card3'],  // Replace with actual IDs
  meldType: 'SET'  // or 'RUN'
});
```

## Step 6: Helper Functions (Optional)

Add these to make testing easier:

```javascript
// Quick draw
function draw(fromDiscard = false) {
  socket.emit('game:draw', { gameId: window.gameId, fromDiscard });
}

// Quick discard (use first card in hand)
function discard(cardId) {
  socket.emit('game:discard', { gameId: window.gameId, cardId });
}

// Send message
function say(message) {
  socket.emit('player:message', { gameId: window.gameId, message });
}

console.log('Helper functions loaded: draw(), discard(cardId), say(message)');
```

## Troubleshooting

### "Socket.io is not defined"
Add this to browser console first:
```javascript
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
document.head.appendChild(script);
// Wait 2 seconds, then run your code
```

### "Not authenticated"
Make sure you emit `authenticate` before any game action.

### "Not your turn"
Check the console for "Turn changed to:" messages.

### Server not starting
- Make sure port 3001 is free
- Check for syntax errors in console

## What's Working (In-Memory Mode)

✅ Game creation  
✅ Player joining  
✅ Turn-based gameplay  
✅ Drawing/discarding cards  
✅ Creating melds  
✅ Chat system  
✅ Multiple concurrent games  

## What's Limited (Without Database/Redis)

⚠️ No persistence (games lost on server restart)  
⚠️ No reconnection after disconnect  
⚠️ No game history  
⚠️ Limited to server memory  

## Next Steps

Once you're happy with testing:
1. Set up PostgreSQL for persistence
2. Set up Redis for better performance
3. Update `.env` with actual database URLs
4. Run migrations: `npm run migrate`
