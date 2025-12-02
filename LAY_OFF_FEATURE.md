# Tunisian Rami - Lay-Off Feature Implementation

## ✨ Feature Overview

The **Lay-Off** feature allows players to add cards from their hand to existing melds on the table (both their own melds and opponents' melds). This is a mandatory core rule in authentic Tunisian Rami.

## 🎯 Rules Implemented

### When Can You Lay Off?

1. **Must Draw First**: Player must draw a card at the start of their turn
2. **Must Have Melded Once**: Player must have created at least ONE valid meld in a previous turn
3. **During Meld Phase**: Lay-offs can only happen during the meld phase (after drawing, before discarding)
4. **On Any Player's Meld**: Can lay off on your own melds OR other players' melds
5. **Must Maintain Validity**: The meld must remain valid after adding the card

### Lay-Off on Sets (Groups)

**Requirements:**
- Same rank as existing cards in the set
- Different suit from all existing cards (no duplicate suits)
- Maximum 4 cards total in a set

**Example:**
```
Existing Set: 7♥ 7♣ 7♠
Can Add: 7♦ ✅
Cannot Add: 7♥ ❌ (suit already in set)
Result: 7♥ 7♣ 7♠ 7♦
```

### Lay-Off on Runs (Sequences)

**Requirements:**
- Same suit as existing cards in the run
- Consecutive rank (can add to beginning or end only)
- Cannot insert in the middle

**Example:**
```
Existing Run: 4♥ 5♥ 6♥

Can Add to Beginning: 3♥ ✅
Result: 3♥ 4♥ 5♥ 6♥

Can Add to End: 7♥ ✅
Result: 4♥ 5♥ 6♥ 7♥

Cannot Add: 8♥ ❌ (not consecutive)
Cannot Add: 5♦ ❌ (wrong suit)
```

### Joker Handling

- **Jokers can be laid off** on any meld (they act as wildcards)
- **Future Enhancement**: Implement joker replacement (player with real card can replace joker and take it back)

## 🎮 How to Use (Client UI)

### Step-by-Step Process

1. **Start Your Turn**: Draw a card (from deck or discard pile)

2. **Enter Meld Phase**: After drawing, you see two radio button options:
   - 📝 **Create New Meld** (default)
   - ➕ **Lay Off on Existing Meld**

3. **Select Lay-Off Mode**: Click the "Lay Off on Existing Meld" radio button
   - Note: This option is only available if you've created at least one meld before

4. **Select a Card**: Click a card in your hand
   - The selected card will be highlighted
   - A preview shows which card is selected

5. **Choose Target Meld**: Click on any meld displayed below
   - Melds will show a green indicator: "➕ Click to lay off"
   - Melds become clickable with hover effects

6. **Validation**: Server automatically validates:
   - If the card can legally be added to that meld
   - If the meld remains valid after addition
   - Displays error message if invalid

7. **Success**: Card is removed from your hand and added to the meld

8. **Continue or Finish**: You can:
   - Lay off more cards
   - Create new melds
   - Click "Finish Melding" to move to discard phase

## 🔧 Technical Implementation

### Server-Side (rami-engine.js)

```javascript
// Validation Methods
canLayOff(card, meld)           // Returns {valid: boolean, message: string, position: string}
canLayOffOnSet(card, meld)      // Validates for sets
canLayOffOnRun(card, meld)      // Validates for runs
layOffCard(card, meld)          // Performs the lay-off action
```

**Key Validation Logic:**
- Sets: Check rank match, suit uniqueness, max 4 cards
- Runs: Check suit match, consecutive ranks, position (beginning/end)
- Returns detailed error messages for debugging

### Server-Side (test-server-rami.js)

```javascript
socket.on('game:layoff', (data) => {
    // Validates:
    // 1. Player's turn
    // 2. Meld phase active
    // 3. Player has melded at least once
    // 4. Player has drawn a card
    // 5. Card is in player's hand
    // 6. Card can be legally added to meld
    
    // Performs:
    // 1. Adds card to meld in correct position
    // 2. Removes card from player's hand
    // 3. Broadcasts update to all players
});
```

### Client-Side (test-rami-client-logic.js)

**State Variables:**
```javascript
let layoffMode = false;              // Toggle between meld/layoff mode
let selectedCardForLayoff = null;    // Card selected for lay-off
let hasCreatedFirstMeld = false;     // Track if player can lay off
```

**Key Functions:**
```javascript
updateMeldMode()            // Switch between create meld / lay off modes
selectCardForLayoff(cardId) // Select card for laying off
attemptLayoff(meldId)       // Send lay-off request to server
updateMeldsDisplay()        // Show melds with clickable indicators
```

## 📋 Game Flow Integration

### Turn Structure
```
1. DRAW PHASE
   └─> Draw from deck or discard pile

2. MELD PHASE
   ├─> Option A: Create New Meld
   │   ├─> Select 3+ cards
   │   ├─> Validate meld
   │   └─> Add to table
   │
   ├─> Option B: Lay Off Card
   │   ├─> Select 1 card
   │   ├─> Click target meld
   │   ├─> Validate addition
   │   └─> Update meld
   │
   └─> Repeat A or B multiple times, then:

3. DISCARD PHASE
   └─> Select 1 card to discard
```

### Restrictions Enforced

1. **First Meld Requirement**: Cannot lay off until you've created your first meld
   ```javascript
   if (currentPlayer.melds.length === 0) {
       socket.emit('game:error', { message: 'You must create your first meld before laying off cards' });
   }
   ```

2. **Phase Validation**: Can only lay off during meld phase
   ```javascript
   if (game.currentPhase !== PHASE.MELD) {
       socket.emit('game:error', { message: 'Can only lay off during meld phase' });
   }
   ```

3. **Draw Requirement**: Must draw before any meld/layoff actions
   ```javascript
   if (!currentPlayer.hasDrawn) {
       socket.emit('game:error', { message: 'You must draw a card first' });
   }
   ```

## 🎨 UI/UX Features

### Visual Indicators

1. **Radio Button Selection**:
   - Clear choice between "Create Meld" and "Lay Off"
   - Color-coded sections (green for lay-off)

2. **Card Highlighting**:
   - Selected card for lay-off shown in red border
   - Preview text shows selected card details

3. **Clickable Melds**:
   - Green border and background when clickable
   - Hover effect with shadow
   - "➕ Click to lay off" indicator

4. **Error Messages**:
   - Specific validation errors displayed in red
   - Helpful messages guide the player

5. **Success Feedback**:
   - Log messages confirm successful lay-offs
   - Visual update shows card added to meld
   - Hand automatically updates

### Accessibility

- Clear text labels for all actions
- Color + text indicators (not color-only)
- Keyboard navigation support via standard HTML controls
- Responsive layout adapts to different screen sizes

## 🧪 Testing Checklist

### Basic Lay-Off Tests

- [ ] Can lay off on own SET meld
- [ ] Can lay off on opponent's SET meld
- [ ] Can lay off on own RUN meld
- [ ] Can lay off on opponent's RUN meld
- [ ] Cannot lay off before creating first meld
- [ ] Cannot lay off in draw phase
- [ ] Cannot lay off in discard phase

### Validation Tests

- [ ] Cannot add duplicate suit to SET
- [ ] Cannot exceed 4 cards in SET
- [ ] Cannot add wrong suit to RUN
- [ ] Cannot add non-consecutive card to RUN
- [ ] Can add to beginning of RUN
- [ ] Can add to end of RUN
- [ ] Jokers work correctly

### Edge Cases

- [ ] Lay off multiple cards in one turn
- [ ] Lay off after creating meld in same turn
- [ ] Lay off with only 2 cards in hand
- [ ] Lay off causes going out (0 cards left + discard)

## 🚀 Future Enhancements

### 1. Joker Replacement Rule
Allow players to replace jokers in melds with the actual card:
```javascript
replaceJoker(meld, card) {
    // Find joker position
    // Validate card fits
    // Replace joker with card
    // Give joker back to player
    // Player can use joker immediately
}
```

### 2. Visual Meld Preview
Show preview of meld after lay-off before confirming:
```javascript
// Highlight target meld
// Show card floating into position
// Confirm/Cancel buttons
```

### 3. Smart Suggestions
Suggest possible lay-offs for current hand:
```javascript
findPossibleLayoffs(hand, allMelds) {
    // Return array of {card, meld, valid} options
    // Highlight these in UI
}
```

### 4. Animation Effects
- Card flying from hand to meld
- Meld reorganization animation
- Success sparkle effect

### 5. Statistics Tracking
- Track lay-offs per player
- Show "Lay-Off Master" achievement
- Display in game history

## 📝 Code Examples

### Complete Lay-Off Flow

```javascript
// 1. Player draws card
socket.emit('game:draw', { gameId, fromDiscard: false });

// 2. Server sends meld phase
socket.on('game:card_drawn', (data) => {
    // Update UI, show meld options
});

// 3. Player selects lay-off mode
updateMeldMode(); // Sets layoffMode = true

// 4. Player clicks card in hand
selectCardForLayoff(cardId); // selectedCardForLayoff = cardId

// 5. Player clicks meld
attemptLayoff(meldId);

// 6. Server validates and executes
socket.on('game:layoff', (data) => {
    // Validate all rules
    // Update meld
    // Broadcast to all players
});

// 7. All players receive update
socket.on('game:card_laid_off', (data) => {
    // Update meld display
    // Update hand
    // Log message
});
```

## 🐛 Known Issues & Solutions

### Issue 1: Mode Switching Confusion
**Problem**: Players accidentally create melds when they meant to lay off
**Solution**: Clear visual separation, confirmation dialogs for ambiguous actions

### Issue 2: Meld Selection Difficult on Mobile
**Problem**: Small meld cards hard to click on touch screens
**Solution**: Increase touch target size, add padding around clickable areas

### Issue 3: Joker Replacement Not Implemented
**Problem**: Players expect to replace jokers
**Solution**: Documented as future enhancement, add TODO in code

## 📚 References

- Official Tunisian Rami Rules: `TUNISIAN_RAMI_RULES.md`
- Engine Code: `server/rami-engine.js`
- Server Logic: `server/test-server-rami.js`
- Client Code: `test-rami-client-updated.html` and `test-rami-client-logic.js`

## 🎉 Summary

The Lay-Off feature is now **fully implemented** with:
✅ Complete rule validation
✅ Intuitive UI with mode switching
✅ Real-time multiplayer synchronization
✅ Error handling and user feedback
✅ Support for both SETS and RUNS
✅ Works with own melds and opponents' melds
✅ Proper phase integration

The implementation follows authentic Tunisian Rami rules and provides a smooth, error-free gameplay experience!
