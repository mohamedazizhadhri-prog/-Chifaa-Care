# 🎮 Rami Discord Activity - Complete Setup Guide

## ✅ Step 1: Install Dependencies (5 minutes)

Open Command Prompt or PowerShell in the project root directory:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..

# Install shared dependencies
cd shared
npm install
cd ..
```

---

## 🔧 Step 2: Configure Discord Application (10 minutes)

### A. Create Discord Application

1. Go to: https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it: **"Rami Card Game"**
4. Click **"Create"**

### B. Get Your Credentials

1. In **"General Information"**:
   - Copy **Application ID** → This is your `DISCORD_CLIENT_ID`
   - Copy **Public Key** → This is your `DISCORD_PUBLIC_KEY`
   
2. In **"OAuth2"** section:
   - Click **"Reset Secret"** button
   - Copy the secret → This is your `DISCORD_CLIENT_SECRET`
   - **IMPORTANT:** Save this secret somewhere safe! You can't see it again.

3. Add Redirect URLs in **OAuth2** section:
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:5173/
   ```

### C. Enable Discord Activity

1. Go to **"Activities"** tab in your Discord Application
2. Click **"Enable Activities"**
3. Add URL Mapping:
   ```
   Root Mapping: /.proxy
   Target: http://localhost:5173
   ```

### D. Update Environment Files

1. Open `server/.env` in a text editor
2. Replace these values with your actual Discord credentials:
   ```env
   DISCORD_CLIENT_ID=1234567890  # Your Application ID
   DISCORD_CLIENT_SECRET=abc123xyz  # Your Client Secret
   DISCORD_PUBLIC_KEY=def456uvw  # Your Public Key
   ```

3. Open `client/.env` in a text editor
4. Replace the Discord Client ID:
   ```env
   VITE_DISCORD_CLIENT_ID=1234567890  # Same Application ID
   ```

---

## 🧪 Step 3: Testing Without Discord (Quick Test - 5 minutes)

This is the fastest way to test if everything works!

### Method 1: Using the Simple Test Client (Recommended)

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```
   
   Wait until you see:
   ```
   🚀 Server running on http://localhost:3000
   🎮 Socket.IO server ready
   ```

2. **Open test client:**
   - Double-click `test-client.html` 
   - OR open it in 2 browser windows/tabs

3. **Test the game:**

   **Window 1 (Player 1 - Host):**
   ```
   Player ID: player_1
   Player Name: Alice
   
   → Click "Connect & Authenticate"
   → Click "Create New Game"
   → Copy the Game ID shown
   → Click "Mark Ready"
   → Wait for Player 2...
   → Click "Start Game (Host)"
   → Play your turn (Draw → Select card → Discard)
   ```

   **Window 2 (Player 2):**
   ```
   Player ID: player_2
   Player Name: Bob
   
   → Click "Connect & Authenticate"
   → Paste Game ID from Player 1
   → Click "Join Game"
   → Click "Mark Ready"
   → Wait for game to start
   → Play your turn when it's your turn
   ```

**✅ What to verify:**
- Both players connect
- Game is created
- Players can mark ready
- Game starts
- Cards are dealt
- Turn-based gameplay works
- Chat messages work

---

## 🎮 Step 4: Testing in Discord (Full Experience - 30 minutes)

### A. Install Cloudflare Tunnel

The project includes `cloudflared.exe.exe` - this creates a public URL for your local server.

### B. Start Everything

1. **Terminal 1 - Start Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 - Start Client:**
   ```bash
   cd client
   npm run dev
   ```

3. **Terminal 3 - Start Tunnel:**
   ```bash
   cloudflared.exe.exe tunnel --url http://localhost:5173
   ```

   Copy the URL shown (e.g., `https://random-name.trycloudflare.com`)

### C. Update Discord Portal

1. Go back to Discord Developer Portal
2. Go to your application → **Activities**
3. Update the URL mapping:
   ```
   Root Mapping: /.proxy
   Target: https://your-cloudflare-url.trycloudflare.com  # Use your actual URL
   ```
4. Click **Save**

### D. Test in Discord

1. Open Discord (desktop or web)
2. Join a voice channel
3. Click the **🚀 Rocket icon** (Activities)
4. Find your "Rami Card Game" activity
5. Click it to launch
6. Invite friends to test multiplayer!

**✅ What to verify:**
- Activity loads in Discord
- Discord user info appears correctly
- Multiple players can join
- Voice chat continues working
- All game features work

---

## 📋 Testing Checklist

Use this checklist to verify everything works:

### Basic Functionality
- [ ] Server starts without errors
- [ ] Client builds and runs
- [ ] Socket.IO connects successfully
- [ ] Can create a game
- [ ] Can join a game with game ID
- [ ] Players can mark ready
- [ ] Game starts with 2+ ready players
- [ ] Cards are dealt to players
- [ ] First player's turn is indicated

### Gameplay
- [ ] Can draw card from deck
- [ ] Can draw card from discard pile
- [ ] Can select cards in hand
- [ ] Can discard a card
- [ ] Turn passes to next player
- [ ] Can see other players' card counts
- [ ] Can see discard pile top card
- [ ] Deck card count updates
- [ ] Game detects when a player wins
- [ ] Final scores are displayed

### UI/UX
- [ ] Loading screen appears while connecting
- [ ] Lobby screen shows player list
- [ ] Ready status updates in real-time
- [ ] Game screen shows all game elements
- [ ] Cards are clickable and responsive
- [ ] Turn indicator is clear
- [ ] Error messages display properly
- [ ] Winner screen shows correct results

### Discord Integration (only when testing in Discord)
- [ ] Activity loads in Discord window
- [ ] Discord user avatars appear
- [ ] Discord usernames are used
- [ ] Multiple Discord users can join
- [ ] Works in voice channels

### Edge Cases
- [ ] Can't draw when it's not your turn
- [ ] Can't discard without drawing first
- [ ] Invalid moves are rejected
- [ ] Empty deck is handled
- [ ] Player leaving is handled (if implemented)

---

## 🐛 Troubleshooting

### Server won't start
**Error:** `Port 3000 already in use`
```bash
# Find and kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F

# Or change the port in server/.env:
PORT=3001
```

**Error:** `Cannot find module`
```bash
# Reinstall dependencies
cd server
rm -rf node_modules package-lock.json
npm install
```

### Client won't start
**Error:** `VITE_DISCORD_CLIENT_ID is not defined`
- Make sure `client/.env` exists and has the Discord Client ID

**Error:** `Failed to resolve import '@shared/...'`
```bash
# Install shared package
cd shared
npm install
cd ../client
npm install
```

### Socket.IO connection failed
1. Check server is running on the correct port
2. Check CORS settings in `server/.env`
3. Verify `VITE_SERVER_URL` in `client/.env` matches server URL
4. Check browser console for exact error

### Discord Activity won't load
1. Verify Discord application is set up correctly
2. Check that cloudflare tunnel is running
3. Verify URL mapping in Discord portal is correct
4. Make sure Discord Client ID in `.env` files is correct
5. Clear Discord cache: `Ctrl+R` in Discord

### Game logic issues
1. Check browser console for errors
2. Check server terminal for errors
3. Verify game state in browser DevTools → Application → Local Storage
4. Check Network tab for failed socket events

---

## 🚀 Quick Commands Reference

```bash
# Full setup from scratch
npm install && cd server && npm install && cd ../client && npm install && cd ../shared && npm install && cd ..

# Start everything (development)
npm run dev

# Start separately
npm run dev:server  # Server only
npm run dev:client  # Client only

# Build for production
npm run build

# Test with simple client
# Just open test-client.html in browser

# Start cloudflare tunnel
cloudflared.exe.exe tunnel --url http://localhost:5173
```

---

## 📚 Project Structure

```
rami-activity/
├── client/              # React frontend
│   ├── src/
│   │   ├── screens/     # Game screens (Lobby, Game, GameOver, etc.)
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React context (Discord, Socket, Game)
│   │   ├── hooks/       # Custom hooks
│   │   └── styles/      # CSS files
│   ├── .env            # Client environment variables
│   └── package.json
├── server/              # Node.js backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Game logic
│   │   ├── socket/      # Socket.IO handlers
│   │   └── config/      # Configuration
│   ├── .env            # Server environment variables
│   └── package.json
├── shared/              # Shared types and constants
│   └── types/          # TypeScript types
├── test-client.html    # Simple test client (no React)
└── package.json        # Root package.json
```

---

## 🎯 Next Steps After Successful Testing

### 1. Add Database (Optional)
- Install PostgreSQL
- Run migrations: `npm run migrate`
- Enable `DATABASE_URL` in server/.env

### 2. Add Redis (Optional)
- Install Redis
- Enable `REDIS_URL` in server/.env

### 3. Deploy to Production
- Choose a hosting platform (Heroku, Railway, Render, etc.)
- Set environment variables
- Deploy server and client
- Update Discord portal with production URLs

### 4. Polish & Features
- Add sound effects
- Add animations
- Add player reconnection
- Add game replay
- Add leaderboards
- Add different game modes

---

## ❓ FAQ

**Q: Do I need a database to test?**
A: No! The app works with in-memory storage for testing.

**Q: Can I test without Discord?**
A: Yes! Use the `test-client.html` for quick testing.

**Q: How many players can play?**
A: 2-4 players recommended.

**Q: Can I customize the game rules?**
A: Yes! Edit files in `shared/constants/gameRules.ts`

**Q: Is it free to host?**
A: Yes! Many platforms offer free tiers (Heroku, Railway, Vercel).

---

## 🆘 Still Need Help?

1. Check the browser console (F12)
2. Check the server terminal output
3. Check Discord Developer Portal → Logs
4. Review the code documentation in each file

Good luck! 🎮✨
