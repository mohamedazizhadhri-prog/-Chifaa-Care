import { Card, Meld } from './card.types';
import { Player, PlayerPublicInfo } from './player.types';

// ==================== ENUMS ====================

export enum GameStatus {
  LOBBY = 'LOBBY',
  STARTING = 'STARTING',
  PLAYING = 'PLAYING',
  ROUND_END = 'ROUND_END',
  GAME_OVER = 'GAME_OVER',
}

export enum GamePhase {
  WAITING_FOR_DRAW = 'WAITING_FOR_DRAW',
  WAITING_FOR_PLAY = 'WAITING_FOR_PLAY',
  WAITING_FOR_DISCARD = 'WAITING_FOR_DISCARD',
}

export enum DrawSource {
  DRAW_PILE = 'DRAW_PILE',
  DISCARD_PILE = 'DISCARD_PILE',
}

export enum PointThreshold {
  SHORT = 101,
  MEDIUM = 201,
  LONG = 501,
}

// ==================== GAME SETTINGS ====================

export interface GameSettings {
  pointThreshold: PointThreshold;
  minPlayers: 2;
  maxPlayers: 4;
  turnTimeLimit: number; // seconds, 0 = unlimited
  autoStart: boolean; // Auto start when maxPlayers reached
}

// ==================== GAME MOVES & ACTIONS ====================

export interface DrawMove {
  type: 'DRAW';
  source: DrawSource;
  cardId?: string; // If drawing from discard pile
}

export interface MeldMove {
  type: 'MELD';
  meldType: 'SET' | 'RUN';
  cardIds: string[];
}

export interface LayoffMove {
  type: 'LAYOFF';
  meldId: string; // ID of existing meld to add to
  cardId: string;
  playerId?: string; // Owner of the meld (null = current player's meld)
}

export interface DiscardMove {
  type: 'DISCARD';
  cardId: string;
}

export interface RamiMove {
  type: 'RAMI';
  melds: MeldMove[]; // All cards must be melded
}

export type GameMove = DrawMove | MeldMove | LayoffMove | DiscardMove | RamiMove;

// ==================== LEGAL MOVES ====================

export interface LegalDrawMoves {
  canDrawFromDeck: boolean;
  canDrawFromDiscard: boolean;
  topDiscardCard: Card | null;
}

export interface LegalMeldMoves {
  possibleSets: string[][]; // Arrays of card IDs that can form sets
  possibleRuns: string[][]; // Arrays of card IDs that can form runs
}

export interface LegalLayoffMoves {
  meldId: string;
  playerId: string; // Owner of the meld
  possibleCards: string[]; // Card IDs from hand that can be added
}

export interface LegalDiscardMoves {
  availableCards: string[]; // All cards in hand that can be discarded
}

export interface LegalRamiMoves {
  canRami: boolean;
  requiredMelds?: MeldMove[]; // If canRami is true, shows how to go out
}

export interface LegalMoves {
  playerId: string;
  phase: GamePhase;
  draw: LegalDrawMoves | null;
  meld: LegalMeldMoves | null;
  layoff: LegalLayoffMoves[] | null;
  discard: LegalDiscardMoves | null;
  rami: LegalRamiMoves | null;
}

// ==================== TURN STATE ====================

export interface TurnState {
  playerId: string;
  phase: GamePhase;
  drewCard: boolean;
  drawSource: DrawSource | null;
  drewCardId: string | null;
  playedMelds: string[]; // Meld IDs created this turn
  playedLayoffs: Array<{ meldId: string; cardId: string }>; // Layoffs made this turn
  startTime: Date;
  timeRemaining: number | null; // seconds, null if unlimited
}

// ==================== DECK STATE ====================

export interface DeckState {
  drawPile: Card[];
  discardPile: Card[];
  drawPileCount: number;
  discardPileCount: number;
  topDiscardCard: Card | null;
  lastDiscardedBy: string | null; // Player ID
  lastDiscardedAt: Date | null;
}

// ==================== PLAYER GAME STATE ====================

export interface PlayerGameState extends Player {
  position: number; // Player position at table (0-3)
  turnOrder: number; // Order in rotation
  hasDrawn: boolean; // Has drawn this turn
  hasMelded: boolean; // Has created at least one meld this round
  canGoOut: boolean; // Has valid Rami
  lastActionAt: Date | null;
}

// ==================== MAIN GAME STATE (REDIS) ====================

export interface GameState {
  // Game Metadata
  id: string;
  status: GameStatus;
  settings: GameSettings;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;

  // Player Management
  players: PlayerGameState[];
  playerOrder: string[]; // Array of player IDs in turn order
  maxPlayers: number;
  minPlayers: number;

  // Round Management
  round: number;
  dealerId: string | null;
  currentPlayerId: string | null;
  
  // Turn Management
  currentTurn: TurnState | null;
  turnHistory: Array<{
    playerId: string;
    moves: GameMove[];
    timestamp: Date;
  }>;

  // Deck & Cards
  deck: DeckState;

  // Game Phase
  phase: GamePhase;
  
  // Melds (Shared Table State)
  tableMelds: Array<{
    id: string;
    ownerId: string;
    meld: Meld;
    createdAt: Date;
  }>;

  // Legal Moves Cache
  legalMoves: LegalMoves | null;

  // Round Results
  roundWinnerId: string | null;
  roundEndReason: 'RAMI' | 'DECK_EMPTY' | null;
  roundScores: Record<string, number>; // playerId -> round score

  // Game Results
  gameWinnerId: string | null;
  finalScores: Record<string, number>; // playerId -> total score

  // Timing
  turnStartTime: Date | null;
  roundStartTime: Date | null;
  gameStartTime: Date | null;
  gameEndTime: Date | null;

  // Special States
  reshuffleCount: number; // Times discard pile was shuffled back into draw pile
  consecutiveDrawsFromDiscard: number; // Prevent abuse
  
  // Metadata
  lastActivityAt: Date;
  version: number; // For optimistic locking
}

// ==================== PUBLIC GAME STATE ====================

export interface GameStatePublic {
  id: string;
  status: GameStatus;
  settings: GameSettings;
  hostId: string;
  
  // Players (limited info)
  players: PlayerPublicInfo[];
  playerOrder: string[];
  currentPlayerId: string | null;
  dealerId: string | null;
  
  // Round Info
  round: number;
  phase: GamePhase;
  
  // Deck Info (limited)
  drawPileCount: number;
  discardPile: Card[]; // Only show top 3 cards
  topDiscardCard: Card | null;
  
  // Table Melds
  tableMelds: Array<{
    id: string;
    ownerId: string;
    meld: Meld;
  }>;
  
  // Current Turn
  currentTurn: {
    playerId: string;
    phase: GamePhase;
    hasDrawn: boolean;
    timeRemaining: number | null;
  } | null;
  
  // Timing
  turnStartTime: Date | null;
  roundStartTime: Date | null;
  
  // Results
  roundWinnerId: string | null;
  gameWinnerId: string | null;
  roundScores: Record<string, number>;
  finalScores: Record<string, number>;
}

// ==================== PLAYER-SPECIFIC VIEW ====================

export interface PlayerGameView extends GameStatePublic {
  // Player's own private information
  myHand: Card[];
  myMelds: Meld[];
  myLegalMoves: LegalMoves | null;
  myScore: number;
  myRoundScore: number;
  canRami: boolean;
}

// ==================== ROUND & GAME RESULTS ====================

export interface RoundResult {
  round: number;
  winnerId: string;
  winMethod: 'RAMI' | 'LOWEST_SCORE';
  playerScores: Record<string, number>; // playerId -> points earned this round
  totalScores: Record<string, number>; // playerId -> total score
  duration: number; // milliseconds
  completedAt: Date;
}

export interface GameResult {
  gameId: string;
  winnerId: string;
  players: Array<{
    playerId: string;
    username: string;
    finalScore: number;
    roundsWon: number;
  }>;
  totalRounds: number;
  duration: number; // milliseconds
  completedAt: Date;
}

// ==================== GAME EVENTS ====================

export interface GameStateUpdate {
  gameId: string;
  timestamp: Date;
  playerId?: string; // Player who triggered the update
  updateType: 
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'PLAYER_READY'
    | 'GAME_STARTED'
    | 'ROUND_STARTED'
    | 'TURN_STARTED'
    | 'CARD_DRAWN'
    | 'MELD_CREATED'
    | 'CARD_LAID_OFF'
    | 'CARD_DISCARDED'
    | 'RAMI'
    | 'ROUND_ENDED'
    | 'GAME_ENDED';
  data: any;
}

// ==================== REDIS KEY PATTERNS ====================

export const REDIS_KEYS = {
  GAME_STATE: (gameId: string) => `game:${gameId}:state`,
  GAME_PLAYERS: (gameId: string) => `game:${gameId}:players`,
  PLAYER_SESSION: (playerId: string) => `player:${playerId}:session`,
  ACTIVE_GAMES: 'games:active',
  LOBBY_GAMES: 'games:lobby',
  PLAYER_GAMES: (playerId: string) => `player:${playerId}:games`,
  TURN_TIMER: (gameId: string) => `game:${gameId}:timer`,
  LEGAL_MOVES_CACHE: (gameId: string, playerId: string) => 
    `game:${gameId}:player:${playerId}:legal_moves`,
} as const;

// ==================== GAME STATE VALIDATION ====================

export interface GameStateValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ==================== TYPE GUARDS ====================

export function isDrawMove(move: GameMove): move is DrawMove {
  return move.type === 'DRAW';
}

export function isMeldMove(move: GameMove): move is MeldMove {
  return move.type === 'MELD';
}

export function isLayoffMove(move: GameMove): move is LayoffMove {
  return move.type === 'LAYOFF';
}

export function isDiscardMove(move: GameMove): move is DiscardMove {
  return move.type === 'DISCARD';
}

export function isRamiMove(move: GameMove): move is RamiMove {
  return move.type === 'RAMI';
}
