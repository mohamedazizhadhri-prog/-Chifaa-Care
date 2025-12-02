# 🎮 Complete Testing Plan for Rami Discord Activity

## 📋 Overview

This guide provides a complete testing strategy from local development to Discord deployment.

---

## 🧪 Testing Phase 1: Local Development (No Discord)

**Time Required:** 10-15 minutes  
**Requirements:** Node.js installed  
**Goal:** Verify core game functionality

### Quick Test with Simple Client (Recommended First)

1. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   cd ../shared && npm install
   cd ..
   ```

2. **Start server:**
   ```bash
   cd server
   npm run dev
   ```
   
   Wait for: `🚀 Server running on http://localhost:3000`

3. **Open test client:**
   - Open `test-client.html` in 2 browser windows
   - Or use: Double-click → Right-click → Open with → Chrome

4. **Test gameplay:**

   **Browser Window 1 - Host (Alice):**
   ```
   1. Player ID: player_1
   2. Player Name: Alice
   3. Click: "Connect & Authenticate"
   4. Click: "Create New Game"
   5. Copy game ID (e.g., game_abc123)
   6. Click: "Mark Ready"
   7. Wait for Player 2...
   8. Click: "Start Game (Host)"
   9. Play: Draw → Select → Discard
   ```

   **Browser Window 2 - Player (Bob):**
   ```
   1. Player ID: player_2
   2. Player Name: Bob
   3. Click: "Connect & Authenticate"
   4. Paste game ID
   5. Click: "Join Game"
   6. Click: "Mark Ready"
   7. Wait for game to start
   8. Play when it's your turn
   ```

### Test Checklist - Simple Client

- [ ] Server starts without errors
- [ ] Both players connect successfully
- [ ] Create game works
- [ ] Join game with ID works
- [ ] Ready status updates in real-time
- [ ] Host can start game
- [ ] Cards are dealt (52 cards split between players)
- [ ] Turn indicator shows active player
- [ ] Draw from deck works
- [ ] Draw from discard pile works
- [ ] Discard card works
- [ ] Turn switches to next player
- [ ] Chat messages work
- [ ] Game state updates in real-time
- [ ] Can't play out of turn
- [ ] Game ends when player empties hand
- [ ] Winner is announced

---

## 🎮 Testing Phase 2: React Client (Local)

**Time Required:** 15-20 minutes  
**Requirements:** Phase 1 completed  
**Goal:** Test full UI/UX

### Setup

1. **Start both servers:**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev

   # Terminal 2 - Client  
   cd client
   npm run dev
   ```

2. **Open client:**
   - Browser: `http://localhost:5173`
   - Open 2 windows/tabs

### Test Checklist - React Client

#### UI Components
- [ ] Loading screen appears initially
- [ ] Lobby screen loads correctly
- [ ] Player list displays
- [ ] Ready button works
- [ ] Ready status shows with green indicator
- [ ] Start game button appears for host
- [ ] Game screen transitions smoothly
- [ ] Cards render with correct styling
- [ ] Hand displays horizontally
- [ ] Discard pile shows top card
- [ ] Deck shows card back
- [ ] Player info cards display
- [ ] Current turn is highlighted
- [ ] Error messages display properly

#### Gameplay Features
- [ ] Can click cards in hand
- [ ] Selected card highlights
- [ ] Can draw from deck
- [ ] Can draw from discard
- [ ] Can discard selected card
- [ ] Turn passes correctly
- [ ] Score updates
- [ ] Game over screen shows
- [ ] Winner is announced
- [ ] Final scores display

#### Edge Cases
- [ ] Can't draw without turn
- [ ] Can't discard without drawing
- [ ] Can't click opponent's cards
- [ ] Invalid moves show error
- [ ] Empty deck handled
- [ ] Network disconnection handled

---

## 🌐 Testing Phase 3: Cloudflare Tunnel (Pre-Discord)

**Time Required:** 10 minutes  
**Requirements:** Phase 2 completed  
**Goal:** Test with public URL

### Setup Tunnel

1. **Keep servers running** (from Phase 2)

2. **Start tunnel:**
   ```bash
   # Terminal 3
   cloudflared.exe.exe tunnel --url http://localhost:5173
   ```

3. **Copy the URL:**
   ```
   Example: https://random-words-1234.trycloudflare.com
   ```

4. **Test from another device:**
   - Open the cloudflare URL on your phone
   - Or share with a friend
   - Verify everything works over internet

### Test Checklist - Tunnel
- [ ] Can access via cloudflare URL
- [ ] Can access from different device
- [ ] Game works over internet
- [ ] Multiplayer works with remote players
- [ ] No CORS errors
- [ ] Socket.IO connects
- [ ] Latency is acceptable

---

## 🎯 Testing Phase 4: Discord Integration

**Time Required:** 30-45 minutes  
**Requirements:** All previous phases completed  
**Goal:** Full Discord Activity experience

### Discord Setup

1. **Configure Discord App:**
   - Portal: https://discord.com/developers/applications
   - Create new application: "Rami Card Game"
   - Get Application ID, Client Secret, Public Key
   - Enable Activities
   - Add URL mapping:
     ```
     Root: /.proxy
     Target: your-cloudflare-url
     ```

2. **Update environment files:**
   ```bash
   # server/.env
   DISCORD_CLIENT_ID=your_app_id
   DISCORD_CLIENT_SECRET=your_secret
   DISCORD_PUBLIC_KEY=your_public_key

   # client/.env
   VITE_DISCORD_CLIENT_ID=your_app_id
   ```

3. **Restart servers** after updating .env files

### Discord Testing

1. **Launch Activity:**
   - Open Discord (desktop or web)
   - Join a voice channel
   - Click rocket icon (🚀)
   - Select "Rami Card Game"
   - Activity loads in embedded iframe

2. **Test with friends:**
   - Invite 1-3 friends to voice channel
   - Everyone clicks to join activity
   - Test full game session

### Test Checklist - Discord

#### Integration
- [ ] Activity appears in Discord
- [ ] Loads in embedded window
- [ ] Discord SDK initializes
- [ ] User authentication works
- [ ] Discord avatar loads
- [ ] Discord username displays
- [ ] Multiple users can join
- [ ] Activity stays open in voice channel

#### Discord Features
- [ ] Voice chat continues during game
- [ ] Can minimize/restore activity
- [ ] Activity closes properly
- [ ] Reconnection works
- [ ] User presence syncs
- [ ] Rich presence shows game state

#### Multiplayer Discord
- [ ] 2 Discord users can play
- [ ] 3 Discord users can play
- [ ] 4 Discord users can play
- [ ] Users see each other's avatars
- [ ] Turn order is clear
- [ ] Game state syncs correctly
- [ ] No lag or desync issues

---

## 🔍 Testing Phase 5: Stress Testing

**Time Required:** 15-20 minutes  
**Goal:** Verify stability

### Tests

1. **Multiple Games:**
   - Create 2-3 simultaneous games
   - Verify isolation between games
   - Check server resource usage

2. **Rapid Actions:**
   - Draw and discard rapidly
   - Spam chat messages
   - Verify no crashes or errors

3. **Edge Cases:**
   - Player leaves mid-game
   - Player disconnects and reconnects
   - Server restart recovery
   - Browser refresh handling
   - Network interruption

### Test Checklist - Stress

- [ ] Multiple games run simultaneously
- [ ] Games don't interfere with each other
- [ ] Rapid actions don't cause errors
- [ ] Server handles high load
- [ ] Memory doesn't leak
- [ ] Socket connections are stable
- [ ] Reconnection works properly
- [ ] Error recovery is graceful

---

## 📊 Testing Metrics

Track these metrics during testing:

### Performance
- Server response time: < 100ms
- Socket.IO latency: < 50ms
- Client FPS: 60fps
- Memory usage: < 100MB client, < 500MB server

### Reliability
- Connection success rate: > 99%
- Game completion rate: > 95%
- Error rate: < 1%
- Uptime: > 99.9%

### User Experience
- Load time: < 3 seconds
- Time to first action: < 5 seconds
- Action feedback: Immediate (< 100ms)
- Error messages: Clear and helpful

---

## 🐛 Common Issues & Solutions

### Issue: Server won't start
```bash
# Solution 1: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Solution 2: Change port in .env
PORT=3001
```

### Issue: Client can't connect to server
```bash
# Check these:
1. Server is running
2. VITE_SERVER_URL in client/.env is correct
3. CORS is configured in server/.env
4. No firewall blocking
```

### Issue: Discord Activity won't load
```
Solutions:
1. Verify cloudflare tunnel is running
2. Check Discord URL mapping is correct
3. Clear Discord cache (Ctrl+R)
4. Check Discord Client ID in both .env files
5. Verify activity is enabled in portal
```

### Issue: Cards not displaying
```
Solutions:
1. Check browser console for errors
2. Verify game state in DevTools
3. Check socket events in Network tab
4. Verify CSS is loaded
```

### Issue: Multiplayer desync
```
Solutions:
1. Check server logs for errors
2. Verify socket events are firing
3. Check game state updates
4. Verify turn validation logic
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Code is properly formatted
- [ ] No console.log in production code
- [ ] Error handling is comprehensive

### Security
- [ ] Environment variables are secure
- [ ] JWT_SECRET is strong and unique
- [ ] CORS is properly configured
- [ ] Input validation is thorough
- [ ] SQL injection protection (if using DB)
- [ ] XSS protection implemented

### Performance
- [ ] Bundle size is optimized
- [ ] Images are optimized
- [ ] Code is minified
- [ ] Gzip compression enabled
- [ ] CDN for static assets

### Testing
- [ ] All test checklists completed
- [ ] Tested with 2, 3, 4 players
- [ ] Tested on different browsers
- [ ] Tested on mobile devices
- [ ] Tested network edge cases
- [ ] Load testing completed

### Documentation
- [ ] README is up to date
- [ ] API is documented
- [ ] Setup guide is clear
- [ ] Troubleshooting guide exists
- [ ] Code comments are helpful

---

## 🚀 Deployment Testing

After deploying:

1. **Smoke Test:**
   - [ ] Production URL loads
   - [ ] Can create game
   - [ ] Can play one full game
   - [ ] No console errors

2. **Integration Test:**
   - [ ] Discord Activity works in production
   - [ ] Database connections work (if enabled)
   - [ ] Redis connections work (if enabled)
   - [ ] External APIs work

3. **User Acceptance Test:**
   - [ ] Real users can play
   - [ ] Experience is smooth
   - [ ] No critical bugs
   - [ ] Performance is good

---

## 📈 Monitoring Plan

After launch, monitor:

### Metrics
- Active users
- Games created
- Games completed
- Average game duration
- Error rate
- Server uptime

### Logs
- Server errors
- Client errors
- Socket disconnections
- Failed game starts
- User feedback

### Alerts
- Server down
- High error rate
- High latency
- Database issues
- Memory leaks

---

## 🎯 Success Criteria

The application is ready for production when:

✅ All test phases completed successfully  
✅ No critical bugs found  
✅ Performance metrics met  
✅ Works in Discord Activities  
✅ Multiple players can play together  
✅ User experience is smooth  
✅ Documentation is complete  
✅ Deployment process is documented  

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check server terminal output
3. Review test checklists
4. Check Discord Developer Portal logs
5. Review troubleshooting guide
6. Check documentation

---

**Good luck with testing! 🎮✨**
