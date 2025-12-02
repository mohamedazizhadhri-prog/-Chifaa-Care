# 🚀 QUICK TEST - 3 Easy Steps

## ✅ Step 1: Start Server (30 seconds)

Double-click: **`START_TEST.bat`**

Wait until you see:
```
⚠️  Skipping database initialization
⚠️  Skipping Redis initialization  
🚀 Server running on http://localhost:3001
🎮 Socket.IO server ready
```

---

## ✅ Step 2: Open Test Client (10 seconds)

**Open `test-client.html` in 2 browser windows**

(Or right-click → Open with → Chrome/Firefox)

---

## ✅ Step 3: Test the Game (2 minutes)

### Browser Window 1 - Player 1 (Host)

1. **Fill in details:**
   - Player ID: `player_1`
   - Player Name: `Alice`
   
2. **Click:** `Connect & Authenticate`
   - Wait for ✅ "Authenticated successfully!"

3. **Click:** `Create New Game`
   - Copy the Game ID shown (e.g., `game_abc123`)

4. **Click:** `Mark Ready`

5. **Wait for Player 2...**

6. **Click:** `Start Game (Host)`

7. **Your turn:**
   - Click `Draw from Deck`
   - Click a card in your hand to select it
   - Click `Discard Selected Card`

---

### Browser Window 2 - Player 2

1. **Fill in details:**
   - Player ID: `player_2`
   - Player Name: `Bob`

2. **Click:** `Connect & Authenticate`

3. **Paste Game ID** from Player 1 into the input field

4. **Click:** `Join Game`

5. **Click:** `Mark Ready`

6. **Wait for game to start...**

7. **When it's your turn:**
   - Click `Draw from Deck`
   - Select a card
   - Click `Discard Selected Card`

---

## 🎮 How to Play

### Game Flow:
1. Draw a card (from deck or discard pile)
2. (Optional) Play melds (3+ cards)
3. Discard a card
4. Next player's turn

### Goal:
Empty your hand by creating melds and discarding!

---

## 💬 Test Chat

Type a message and click Send to test the chat feature!

---

## ❌ Troubleshooting

### Server won't start?
- Make sure port 3001 is free
- Close any other Node.js processes
- Try: `cd server` then `npm run dev`

### Can't connect in browser?
- Check server is running
- Try `http://127.0.0.1:3001` instead
- Clear browser cache

### "Socket.io not defined"?
- Make sure you're opening the HTML file in a browser
- Check your internet connection (needs CDN)

### Game not starting?
- Make sure BOTH players clicked "Mark Ready"
- Host must click "Start Game"

---

## 📝 What's Working?

✅ Real-time multiplayer  
✅ Turn-based gameplay  
✅ Card drawing/discarding  
✅ Chat system  
✅ Multiple games simultaneously  

## ⚠️ Limitations (Test Mode)

- No persistence (games lost on server restart)
- No reconnection after browser close
- In-memory only (limited capacity)

---

## 🎯 Next Steps After Testing

When ready for production:

1. Set up PostgreSQL
2. Set up Redis
3. Update `.env` with real database URLs
4. Run migrations: `npm run migrate`
5. Deploy to production server

---

## 🆘 Need Help?

Check the console log in the test client for detailed messages!

Every action shows a log entry with ✅ (success) or ❌ (error).

---

**Ready? Double-click `START_TEST.bat` to begin! 🚀**
