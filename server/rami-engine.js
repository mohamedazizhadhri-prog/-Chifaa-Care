/**
 * TUNISIAN RAMI GAME ENGINE
 * Official rules implementation
 */

class TunisianRamiEngine {
  constructor(config = {}) {
    this.config = {
      minPlayers: 2,
      maxPlayers: 4,
      cardsPerPlayer: 14,
      aceValue: config.aceValue || 1, // 1 or 10/15
      jokerValue: config.jokerValue || 20,
      winBonus: config.winBonus || -40, // Winner gets -40 points
      minMeldPoints: config.minMeldPoints || 0, // Optional first meld requirement
      targetScore: config.targetScore || 201 // Game ends at this score
    };
  }

  /**
   * CREATE DECK (2 standard decks + 2 Jokers = 106 cards)
   */
  createDeck() {
    const suits = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    let cardId = 1;

    // Add 2 standard decks
    for (let deckNum = 0; deckNum < 2; deckNum++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({
            id: `card_${cardId++}`,
            rank,
            suit,
            value: this.getCardValue(rank)
          });
        }
      }
    }

    // Add 4 Jokers
    deck.push({ id: `card_${cardId++}`, rank: 'JOKER', suit: null, value: this.config.jokerValue });
    deck.push({ id: `card_${cardId++}`, rank: 'JOKER', suit: null, value: this.config.jokerValue });
    deck.push({ id: `card_${cardId++}`, rank: 'JOKER', suit: null, value: this.config.jokerValue });
    deck.push({ id: `card_${cardId++}`, rank: 'JOKER', suit: null, value: this.config.jokerValue });

    return this.shuffleDeck(deck);
  }

  /**
   * GET CARD VALUE FOR SCORING
   */
  getCardValue(rank) {
    if (rank === 'A') return this.config.aceValue;
    if (rank === 'JOKER') return this.config.jokerValue;
    if (['J', 'Q', 'K'].includes(rank)) return 10;
    return parseInt(rank);
  }

  /**
   * SHUFFLE DECK
   */
  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * DEAL CARDS
   */
  dealCards(deck, numPlayers) {
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
      hands.push(deck.splice(0, this.config.cardsPerPlayer));
    }
    return hands;
  }

  /**
   * VALIDATE MELD - Sets (Groups)
   * 3 or 4 cards of same rank, different suits
   */
  isValidSet(cards) {
    if (cards.length < 3 || cards.length > 4) return false;

    // Get the target rank (ignoring jokers)
    const nonJokers = cards.filter(c => c.rank !== 'JOKER');
    if (nonJokers.length === 0) return false; // Can't have all jokers

    const targetRank = nonJokers[0].rank;
    const suits = new Set();

    for (const card of cards) {
      if (card.rank === 'JOKER') continue;
      
      if (card.rank !== targetRank) return false;
      
      // Check for duplicate suits (not allowed in sets)
      if (suits.has(card.suit)) return false;
      suits.add(card.suit);
    }

    return true;
  }

  /**
   * VALIDATE MELD - Runs (Sequences)
   * 3+ consecutive cards of same suit
   */
  isValidRun(cards) {
    if (cards.length < 3) return false;

    // Get the target suit (from non-jokers)
    const nonJokers = cards.filter(c => c.rank !== 'JOKER');
    if (nonJokers.length === 0) return false;

    const targetSuit = nonJokers[0].suit;

    // Check all non-jokers are same suit
    for (const card of nonJokers) {
      if (card.suit !== targetSuit) return false;
    }

    // Get rank order
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    // Sort cards by rank (jokers need positions)
    const sortedCards = [...cards].sort((a, b) => {
      if (a.rank === 'JOKER') return -1;
      if (b.rank === 'JOKER') return 1;
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    });

    // Try to fit jokers into sequence
    const positions = [];
    let jokerCount = 0;

    for (const card of sortedCards) {
      if (card.rank === 'JOKER') {
        jokerCount++;
      } else {
        positions.push(rankOrder.indexOf(card.rank));
      }
    }

    // Check if positions form a valid sequence with jokers
    positions.sort((a, b) => a - b);

    let expectedPos = positions[0];
    let jokersUsed = 0;

    for (let i = 0; i < positions.length; i++) {
      const gap = positions[i] - expectedPos;
      
      if (gap > 0) {
        jokersUsed += gap;
        if (jokersUsed > jokerCount) return false;
      }
      
      expectedPos = positions[i] + 1;
    }

    return true;
  }

  /**
   * VALIDATE ANY MELD
   */
  isValidMeld(cards) {
    return this.isValidSet(cards) || this.isValidRun(cards);
  }

  /**
   * CHECK IF CARD CAN BE LAID OFF ON EXISTING MELD
   * Returns validation result and position info
   */
  canLayOff(card, meld) {
    const meldType = meld.type || (this.isValidSet(meld.cards) ? 'SET' : 'RUN');
    
    if (meldType === 'SET') {
      return this.canLayOffOnSet(card, meld);
    } else {
      return this.canLayOffOnRun(card, meld);
    }
  }

  /**
   * LAY OFF CARD ON MELD
   * Adds the card to the meld in the correct position
   */
  layOffCard(card, meld) {
    const validation = this.canLayOff(card, meld);
    if (!validation.valid) {
      return { success: false, message: 'Cannot lay off this card' };
    }

    if (meld.type === 'RUN') {
      // For runs, add to beginning or end
      if (validation.position === 'beginning') {
        meld.cards.unshift(card);
      } else {
        meld.cards.push(card);
      }
    } else {
      // For sets, just add to the end
      meld.cards.push(card);
    }

    return { success: true, meld };
  }

  /**
   * CHECK IF CARD CAN BE ADDED TO A SET
   */
  canLayOffOnSet(card, meld) {
    // Sets must have same rank, different suits
    const nonJokers = meld.cards.filter(c => c.rank !== 'JOKER');
    if (nonJokers.length === 0) return { valid: false, message: 'Invalid meld' };
    
    const targetRank = nonJokers[0].rank;
    
    // Check if card matches rank or is joker
    if (card.rank !== 'JOKER' && card.rank !== targetRank) {
      return { valid: false, message: `Card must be rank ${targetRank}` };
    }
    
    // Check if adding this card would exceed 4 cards
    if (meld.cards.length >= 4) {
      return { valid: false, message: 'Set already has 4 cards (maximum)' };
    }
    
    // Check for duplicate suits (only for non-jokers)
    if (card.rank !== 'JOKER') {
      const suits = new Set(meld.cards.filter(c => c.rank !== 'JOKER').map(c => c.suit));
      if (suits.has(card.suit)) {
        return { valid: false, message: 'This suit is already in the set' };
      }
    }
    
    return { valid: true, position: 'end', type: 'SET' };
  }

  /**
   * CHECK IF CARD CAN BE ADDED TO A RUN
   */
  canLayOffOnRun(card, meld) {
    const nonJokers = meld.cards.filter(c => c.rank !== 'JOKER');
    if (nonJokers.length === 0) return { valid: false, message: 'Invalid meld' };
    
    const targetSuit = nonJokers[0].suit;
    
    // Card must match suit or be joker
    if (card.rank !== 'JOKER' && card.suit !== targetSuit) {
      const suitSymbols = { HEARTS: '♥️', DIAMONDS: '♦️', CLUBS: '♣️', SPADES: '♠️' };
      return { valid: false, message: `Card must be ${suitSymbols[targetSuit] || targetSuit}` };
    }
    
    // For jokers, assume they can fit
    if (card.rank === 'JOKER') {
      return { valid: true, position: 'end', type: 'RUN' };
    }
    
    // Get all card ranks in order
    const rankOrder = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardValue = rankOrder.indexOf(card.rank);
    
    if (cardValue === -1) return { valid: false, message: 'Invalid rank' };
    
    // Get min and max ranks in current meld (excluding jokers)
    const ranks = nonJokers.map(c => rankOrder.indexOf(c.rank)).filter(r => r !== -1);
    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);
    
    // Check if can add to beginning
    if (cardValue === minRank - 1) {
      return { valid: true, position: 'beginning', type: 'RUN' };
    }
    
    // Check if can add to end
    if (cardValue === maxRank + 1) {
      return { valid: true, position: 'end', type: 'RUN' };
    }
    
    // Check if card would create duplicate in sequence
    if (ranks.includes(cardValue)) {
      return { valid: false, message: 'This card is already in the run' };
    }
    
    return { valid: false, message: 'Card must be consecutive to run' };
  }

  /**
   * CHECK IF CARD CAN REPLACE JOKER IN MELD
   */
  canReplaceJoker(card, meld) {
    // Find joker in meld
    const jokerIndex = meld.cards.findIndex(c => c.rank === 'JOKER');
    if (jokerIndex === -1) return { valid: false };
    
    // Try replacing joker with the card
    const testMeld = [...meld.cards];
    testMeld[jokerIndex] = card;
    
    const meldType = meld.type || (this.isValidSet(meld.cards) ? 'SET' : 'RUN');
    const isValid = meldType === 'SET' ? this.isValidSet(testMeld) : this.isValidRun(testMeld);
    
    if (isValid) {
      return { 
        valid: true, 
        jokerIndex,
        type: 'REPLACE_JOKER'
      };
    }
    
    return { valid: false };
  }

  /**
   * CALCULATE HAND VALUE (for scoring)
   */
  calculateHandValue(cards) {
    return cards.reduce((total, card) => total + card.value, 0);
  }

  /**
   * CHECK IF PLAYER CAN GO OUT
   * All cards must be in valid melds, except one to discard
   */
  canGoOut(hand, melds) {
    // Player needs at least one meld
    if (melds.length === 0) return false;

    // Calculate cards in melds
    const cardsInMelds = melds.reduce((sum, meld) => sum + meld.cards.length, 0);

    // Player should have exactly 1 card left to discard
    return cardsInMelds === hand.length - 1;
  }

  /**
   * VALIDATE FIRST MELD POINTS REQUIREMENT
   */
  meetsMinimumPoints(meld) {
    if (this.config.minMeldPoints === 0) return true;
    
    const points = this.calculateHandValue(meld.cards);
    return points >= this.config.minMeldPoints;
  }

  /**
   * CHECK GAME OVER
   */
  isGameOver(scores) {
    return scores.some(score => score >= this.config.targetScore);
  }

  /**
   * CALCULATE ROUND SCORES
   */
  calculateRoundScores(players, winnerId) {
    const scores = {};

    for (const player of players) {
      if (player.id === winnerId) {
        // Winner gets bonus
        scores[player.id] = this.config.winBonus;
      } else {
        // Others get penalty for remaining cards
        const handValue = this.calculateHandValue(player.hand);
        scores[player.id] = handValue;
      }
    }

    return scores;
  }

  /**
   * SWAP JOKER IN MELD
   * Player can replace joker with real card
   */
  canSwapJoker(meld, cardToAdd) {
    // Find joker in meld
    const jokerIndex = meld.cards.findIndex(c => c.rank === 'JOKER');
    if (jokerIndex === -1) return false;

    // Try replacing joker with the card
    const testMeld = [...meld.cards];
    testMeld[jokerIndex] = cardToAdd;

    return this.isValidMeld(testMeld);
  }

  /**
   * GET RANK VALUE FOR SEQUENCE ORDERING
   */
  getRankValue(rank) {
    const rankOrder = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
      '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    };
    return rankOrder[rank] || 0;
  }

  /**
   * CHECK IF DRAWN DISCARD CARD IS USED IN MELD
   */
  isCardUsedInMeld(cardId, melds) {
    for (const meld of melds) {
      if (meld.cards.some(c => c.id === cardId)) {
        return true;
      }
    }
    return false;
  }
}

module.exports = TunisianRamiEngine;
