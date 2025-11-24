/**
 * Game Engine Service
 * Pure TypeScript implementation of Rami card game logic
 * No networking - only game state management and validation
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Card,
  Suit,
  Rank,
  Meld,
  RANK_VALUES,
  RANK_ORDER,
} from '../../../shared/types/card.types';
import {
  GameState,
  GameStatus,
  GamePhase,
  GameSettings,
  DrawSource,
  PointThreshold,
  PlayerGameState,
  DeckState,
  TurnState,
  GameMove,
  DrawMove,
  MeldMove,
  LayoffMove,
  DiscardMove,
  RamiMove,
  LegalMoves,
} from '../../../shared/types/game.types';
import {
  Player,
  PlayerPublicInfo,
} from '../../../shared/types/player.types';

export class GameEngine {
  private games: Map<string, GameState> = new Map();

  /**
   * Create a new game instance
   */
  newGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostAvatar: string,
    settings?: Partial<GameSettings>
  ): GameState {
    const gameId = uuidv4();
    const now = new Date();

    const defaultSettings: GameSettings = {
      pointThreshold: PointThreshold.MEDIUM,
      minPlayers: 2,
      maxPlayers: 4,
      turnTimeLimit: 60,
      autoStart: false,
      ...settings,
    };

    const hostPlayer: PlayerGameState = {
      id: hostPlayerId,
      discordId: hostPlayerId,
      username: hostPlayerName,
      avatar: hostAvatar,
      hand: [],
      melds: [],
      score: 0,
      roundScore: 0,
      isConnected: true,
      isReady: false,
      position: 0,
      turnOrder: 0,
      hasDrawn: false,
      hasMelded: false,
      canGoOut: false,
      lastActionAt: null,
    };

    const game: GameState = {
      id: gameId,
      status: GameStatus.LOBBY,
      settings: defaultSettings,
      hostId: hostPlayerId,
      createdAt: now,
      updatedAt: now,
      players: [hostPlayer],
      playerOrder: [hostPlayerId],
      maxPlayers: defaultSettings.maxPlayers,
      minPlayers: defaultSettings.minPlayers,
      round: 0,
      dealerId: null,
      currentPlayerId: null,
      currentTurn: null,
      turnHistory: [],
      deck: this.createEmptyDeckState(),
      phase: GamePhase.WAITING_FOR_DRAW,
      tableMelds: [],
      legalMoves: null,
      roundWinnerId: null,
      roundEndReason: null,
      roundScores: {},
      gameWinnerId: null,
      finalScores: {},
      turnStartTime: null,
      roundStartTime: null,
      gameStartTime: null,
      gameEndTime: null,
      reshuffleCount: 0,
      consecutiveDrawsFromDiscard: 0,
      lastActivityAt: now,
      version: 1,
    };

    this.games.set(gameId, game);
    return game;
  }

  /**
   * Join an existing game
   */
  joinGame(
    gameId: string,
    playerId: string,
    playerName: string,
    playerAvatar: string
  ): GameState {
    const game = this.getGame(gameId);

    if (game.status !== GameStatus.LOBBY) {
      throw new Error('Cannot join game that has already started');
    }

    if (game.players.length >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    if (game.players.some((p) => p.id === playerId)) {
      throw new Error('Player already in game');
    }

    const newPlayer: PlayerGameState = {
      id: playerId,
      discordId: playerId,
      username: playerName,
      avatar: playerAvatar,
      hand: [],
      melds: [],
      score: 0,
      roundScore: 0,
      isConnected: true,
      isReady: false,
      position: game.players.length,
      turnOrder: game.players.length,
      hasDrawn: false,
      hasMelded: false,
      canGoOut: false,
      lastActionAt: null,
    };

    game.players.push(newPlayer);
    game.playerOrder.push(playerId);
    game.updatedAt = new Date();
    game.version++;

    // Auto-start if enabled and max players reached
    if (game.settings.autoStart && game.players.length === game.maxPlayers) {
      this.startGame(gameId);
    }

    return game;
  }

  /**
   * Start the game and deal initial cards
   */
  startGame(gameId: string): GameState {
    const game = this.getGame(gameId);

    if (game.status !== GameStatus.LOBBY) {
      throw new Error('Game already started');
    }

    if (game.players.length < game.minPlayers) {
      throw new Error(`Need at least ${game.minPlayers} players to start`);
    }

    // Initialize deck with 2 standard decks + jokers
    const cards = this.createFullDeck();
    this.shuffleDeck(cards);

    game.deck = {
      drawPile: cards,
      discardPile: [],
      drawPileCount: cards.length,
      discardPileCount: 0,
      topDiscardCard: null,
      lastDiscardedBy: null,
      lastDiscardedAt: null,
    };

    // Deal 7 cards to each player
    const cardsPerPlayer = 7;
    for (const player of game.players) {
      player.hand = [];
      player.melds = [];
      player.roundScore = 0;
      player.hasDrawn = false;
      player.hasMelded = false;
      player.canGoOut = false;

      for (let i = 0; i < cardsPerPlayer; i++) {
        const card = game.deck.drawPile.pop();
        if (card) {
          player.hand.push(card);
        }
      }
    }

    // Place first card in discard pile
    const firstCard = game.deck.drawPile.pop();
    if (firstCard) {
      game.deck.discardPile.push(firstCard);
      game.deck.topDiscardCard = firstCard;
      game.deck.discardPileCount = 1;
    }

    game.deck.drawPileCount = game.deck.drawPile.length;

    // Set dealer and first player
    game.dealerId = game.playerOrder[0];
    game.currentPlayerId = game.playerOrder[0];
    game.round = 1;
    game.status = GameStatus.PLAYING;
    game.phase = GamePhase.WAITING_FOR_DRAW;
    game.gameStartTime = new Date();
    game.roundStartTime = new Date();
    game.turnStartTime = new Date();

    // Initialize turn state
    game.currentTurn = {
      playerId: game.currentPlayerId,
      phase: GamePhase.WAITING_FOR_DRAW,
      drewCard: false,
      drawSource: null,
      drewCardId: null,
      playedMelds: [],
      playedLayoffs: [],
      startTime: new Date(),
      timeRemaining: game.settings.turnTimeLimit || null,
    };

    game.updatedAt = new Date();
    game.version++;

    return game;
  }

  /**
   * Draw a card from deck or discard pile
   */
  drawCard(
    gameId: string,
    playerId: string,
    fromDiscard: boolean = false
  ): GameState {
    const game = this.getGame(gameId);
    this.validateTurn(game, playerId);

    if (game.phase !== GamePhase.WAITING_FOR_DRAW) {
      throw new Error('Cannot draw card at this phase');
    }

    const player = this.getPlayer(game, playerId);
    if (player.hasDrawn) {
      throw new Error('Already drew a card this turn');
    }

    let drawnCard: Card | undefined;
    const drawSource: DrawSource = fromDiscard
      ? DrawSource.DISCARD_PILE
      : DrawSource.DRAW_PILE;

    if (fromDiscard) {
      if (game.deck.discardPile.length === 0) {
        throw new Error('Discard pile is empty');
      }
      drawnCard = game.deck.discardPile.pop();
      game.deck.discardPileCount--;
      game.consecutiveDrawsFromDiscard++;
    } else {
      if (game.deck.drawPile.length === 0) {
        this.reshuffleDiscardIntoDraw(game);
      }
      if (game.deck.drawPile.length === 0) {
        throw new Error('No cards available to draw');
      }
      drawnCard = game.deck.drawPile.pop();
      game.deck.drawPileCount--;
      game.consecutiveDrawsFromDiscard = 0;
    }

    if (drawnCard) {
      player.hand.push(drawnCard);
      player.hasDrawn = true;
      player.lastActionAt = new Date();

      if (game.currentTurn) {
        game.currentTurn.drewCard = true;
        game.currentTurn.drawSource = drawSource;
        game.currentTurn.drewCardId = drawnCard.id;
      }

      // Update top discard card
      if (game.deck.discardPile.length > 0) {
        game.deck.topDiscardCard =
          game.deck.discardPile[game.deck.discardPile.length - 1];
      } else {
        game.deck.topDiscardCard = null;
      }

      game.phase = GamePhase.WAITING_FOR_PLAY;
      if (game.currentTurn) {
        game.currentTurn.phase = GamePhase.WAITING_FOR_PLAY;
      }
    }

    game.updatedAt = new Date();
    game.version++;

    return game;
  }

  /**
   * Play cards as a meld (set or run)
   */
  playCard(
    gameId: string,
    playerId: string,
    cardIds: string[],
    meldType: 'SET' | 'RUN'
  ): GameState {
    const game = this.getGame(gameId);
    this.validateTurn(game, playerId);

    if (
      game.phase !== GamePhase.WAITING_FOR_PLAY &&
      game.phase !== GamePhase.WAITING_FOR_DISCARD
    ) {
      throw new Error('Cannot play cards at this phase');
    }

    const player = this.getPlayer(game, playerId);
    if (!player.hasDrawn) {
      throw new Error('Must draw a card before playing');
    }

    // Find cards in hand
    const cards = cardIds
      .map((id) => player.hand.find((c) => c.id === id))
      .filter((c): c is Card => c !== undefined);

    if (cards.length !== cardIds.length) {
      throw new Error('Some cards not found in hand');
    }

    // Validate meld
    if (!this.isValidMeld(cards, meldType)) {
      throw new Error(`Invalid ${meldType}`);
    }

    // Create meld
    const meldId = uuidv4();
    const meld: Meld = {
      id: meldId,
      type: meldType,
      cards,
    };

    // Remove cards from hand
    player.hand = player.hand.filter((c) => !cardIds.includes(c.id));

    // Add to player's melds
    player.melds.push(meld);
    player.hasMelded = true;

    // Add to table melds
    game.tableMelds.push({
      id: meldId,
      ownerId: playerId,
      meld,
      createdAt: new Date(),
    });

    if (game.currentTurn) {
      game.currentTurn.playedMelds.push(meldId);
    }

    // Check if player can go out
    player.canGoOut = player.hand.length === 0;

    game.phase = GamePhase.WAITING_FOR_DISCARD;
    if (game.currentTurn) {
      game.currentTurn.phase = GamePhase.WAITING_FOR_DISCARD;
    }

    game.updatedAt = new Date();
    game.version++;

    return game;
  }

  /**
   * Discard a card to end turn
   */
  discardCard(gameId: string, playerId: string, cardId: string): GameState {
    const game = this.getGame(gameId);
    this.validateTurn(game, playerId);

    if (game.phase !== GamePhase.WAITING_FOR_DISCARD) {
      throw new Error('Cannot discard at this phase');
    }

    const player = this.getPlayer(game, playerId);
    if (!player.hasDrawn) {
      throw new Error('Must draw a card before discarding');
    }

    const cardIndex = player.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) {
      throw new Error('Card not found in hand');
    }

    const card = player.hand.splice(cardIndex, 1)[0];
    game.deck.discardPile.push(card);
    game.deck.discardPileCount++;
    game.deck.topDiscardCard = card;
    game.deck.lastDiscardedBy = playerId;
    game.deck.lastDiscardedAt = new Date();

    // Check if player has Rami (empty hand)
    if (player.hand.length === 0 && player.melds.length > 0) {
      player.canGoOut = true;
    }

    game.updatedAt = new Date();
    game.version++;

    // End turn and move to next player
    return this.endTurn(gameId, playerId);
  }

  /**
   * Declare Rami (going out with all cards in melds)
   */
  declareRami(gameId: string, playerId: string): GameState {
    const game = this.getGame(gameId);
    this.validateTurn(game, playerId);

    const player = this.getPlayer(game, playerId);

    // Validate Rami conditions
    if (player.hand.length > 0) {
      throw new Error('Cannot declare Rami with cards in hand');
    }

    if (player.melds.length === 0) {
      throw new Error('Cannot declare Rami without any melds');
    }

    if (!player.hasMelded) {
      throw new Error('Must have melded at least once');
    }

    // Player wins the round
    game.roundWinnerId = playerId;
    game.roundEndReason = 'RAMI';
    game.status = GameStatus.ROUND_END;

    // Calculate scores
    this.calculateScores(gameId);

    game.updatedAt = new Date();
    game.version++;

    // Check if game is over
    const winnerScore = game.finalScores[playerId] || 0;
    if (winnerScore >= game.settings.pointThreshold) {
      game.status = GameStatus.GAME_OVER;
      game.gameWinnerId = playerId;
      game.gameEndTime = new Date();
    }

    return game;
  }

  /**
   * End current player's turn
   */
  endTurn(gameId: string, playerId: string): GameState {
    const game = this.getGame(gameId);
    this.validateTurn(game, playerId);

    const player = this.getPlayer(game, playerId);

    if (!player.hasDrawn) {
      throw new Error('Must draw a card before ending turn');
    }

    // Save turn to history
    if (game.currentTurn) {
      game.turnHistory.push({
        playerId,
        moves: [], // Would track moves if needed
        timestamp: new Date(),
      });
    }

    // Reset player turn state
    player.hasDrawn = false;

    // Move to next player
    const currentIndex = game.playerOrder.indexOf(playerId);
    const nextIndex = (currentIndex + 1) % game.playerOrder.length;
    game.currentPlayerId = game.playerOrder[nextIndex];

    // Reset phase and create new turn state
    game.phase = GamePhase.WAITING_FOR_DRAW;
    game.turnStartTime = new Date();
    game.currentTurn = {
      playerId: game.currentPlayerId,
      phase: GamePhase.WAITING_FOR_DRAW,
      drewCard: false,
      drawSource: null,
      drewCardId: null,
      playedMelds: [],
      playedLayoffs: [],
      startTime: new Date(),
      timeRemaining: game.settings.turnTimeLimit || null,
    };

    game.updatedAt = new Date();
    game.version++;

    return game;
  }

  /**
   * Calculate scores for all players
   */
  calculateScores(gameId: string): Record<string, number> {
    const game = this.getGame(gameId);
    const scores: Record<string, number> = {};

    for (const player of game.players) {
      let roundScore = 0;

      // Add points for melds
      for (const meld of player.melds) {
        for (const card of meld.cards) {
          roundScore += this.getCardPointValue(card);
        }
      }

      // Subtract points for cards in hand (deadwood)
      for (const card of player.hand) {
        roundScore -= this.getCardPointValue(card);
      }

      // Bonus for declaring Rami
      if (player.id === game.roundWinnerId) {
        roundScore += 25;
      }

      player.roundScore = roundScore;
      player.score += roundScore;

      scores[player.id] = player.score;
      game.roundScores[player.id] = roundScore;
      game.finalScores[player.id] = player.score;
    }

    return scores;
  }

  /**
   * Get game by ID
   */
  getGame(gameId: string): GameState {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private createEmptyDeckState(): DeckState {
    return {
      drawPile: [],
      discardPile: [],
      drawPileCount: 0,
      discardPileCount: 0,
      topDiscardCard: null,
      lastDiscardedBy: null,
      lastDiscardedAt: null,
    };
  }

  private createFullDeck(): Card[] {
    const cards: Card[] = [];
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank).filter((r) => r !== Rank.JOKER);

    // Create 2 standard decks
    for (let deckNum = 1; deckNum <= 2; deckNum++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          cards.push({
            id: uuidv4(),
            suit,
            rank,
            deckNumber: deckNum as 1 | 2,
          });
        }
      }

      // Add 2 jokers per deck
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: uuidv4(),
          suit: null,
          rank: Rank.JOKER,
          deckNumber: deckNum as 1 | 2,
        });
      }
    }

    return cards;
  }

  private shuffleDeck(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  private reshuffleDiscardIntoDraw(game: GameState): void {
    if (game.deck.discardPile.length <= 1) {
      return; // Keep at least top card
    }

    const topCard = game.deck.discardPile.pop()!;
    game.deck.drawPile = [...game.deck.discardPile];
    game.deck.discardPile = [topCard];
    this.shuffleDeck(game.deck.drawPile);

    game.deck.drawPileCount = game.deck.drawPile.length;
    game.deck.discardPileCount = 1;
    game.deck.topDiscardCard = topCard;
    game.reshuffleCount++;
  }

  private validateTurn(game: GameState, playerId: string): void {
    if (game.status !== GameStatus.PLAYING) {
      throw new Error('Game is not in progress');
    }

    if (game.currentPlayerId !== playerId) {
      throw new Error('Not your turn');
    }
  }

  private getPlayer(game: GameState, playerId: string): PlayerGameState {
    const player = game.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    return player;
  }

  private isValidMeld(cards: Card[], meldType: 'SET' | 'RUN'): boolean {
    if (cards.length < 3) {
      return false;
    }

    if (meldType === 'SET') {
      return this.isValidSet(cards);
    } else {
      return this.isValidRun(cards);
    }
  }

  private isValidSet(cards: Card[]): boolean {
    // All cards must have same rank (or be jokers)
    const nonJokers = cards.filter((c) => c.rank !== Rank.JOKER);
    if (nonJokers.length === 0) return false; // Can't have all jokers

    const rank = nonJokers[0].rank;
    const suits = new Set(nonJokers.map((c) => c.suit));

    // All non-jokers must have same rank
    if (!nonJokers.every((c) => c.rank === rank)) {
      return false;
    }

    // All non-jokers must have different suits
    if (suits.size !== nonJokers.length) {
      return false;
    }

    return true;
  }

  private isValidRun(cards: Card[]): boolean {
    const nonJokers = cards.filter((c) => c.rank !== Rank.JOKER);
    if (nonJokers.length === 0) return false; // Can't have all jokers

    // All non-jokers must be same suit
    const suit = nonJokers[0].suit;
    if (!nonJokers.every((c) => c.suit === suit)) {
      return false;
    }

    // Sort cards by rank
    const sortedCards = [...cards].sort((a, b) => {
      if (a.rank === Rank.JOKER) return 1;
      if (b.rank === Rank.JOKER) return -1;
      return this.getRankOrder(a.rank) - this.getRankOrder(b.rank);
    });

    // Build expected sequence with jokers
    let expectedRank = this.getRankOrder(sortedCards[0].rank);
    for (let i = 0; i < sortedCards.length; i++) {
      const card = sortedCards[i];
      if (card.rank === Rank.JOKER) {
        expectedRank++;
        continue;
      }

      const cardRank = this.getRankOrder(card.rank);
      if (cardRank !== expectedRank) {
        return false;
      }
      expectedRank++;
    }

    return true;
  }

  private getRankOrder(rank: Rank): number {
    return RANK_ORDER.indexOf(rank);
  }

  private getCardPointValue(card: Card): number {
    return RANK_VALUES[card.rank];
  }
}
