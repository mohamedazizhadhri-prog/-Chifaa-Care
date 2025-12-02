import { Card, CardId, Meld } from './card.types';
import { GameSettings, GameStatePublic, RoundResult } from './game.types';
import { PlayerPublicInfo } from './player.types';

// Client -> Server Events
export interface ClientToServerEvents {
  // Authentication
  authenticate: (data: { token: string }) => void;

  // Lobby
  createGame: (data: { settings: GameSettings }) => void;
  joinGame: (data: { gameId: string }) => void;
  leaveGame: () => void;
  setReady: (data: { ready: boolean }) => void;
  startGame: () => void;

  // Game Actions
  drawCard: (data: { source: 'deck' | 'discard' }) => void;
  discardCard: (data: { cardId: CardId }) => void;
  formMeld: (data: { cardIds: CardId[] }) => void;
  addToMeld: (data: { meldId: string; cardId: CardId }) => void;
  sortHand: (data: { sortBy: 'suit' | 'rank' }) => void;

  // Communication
  sendEmote: (data: { emote: string }) => void;
}

// Server -> Client Events
export interface ServerToClientEvents {
  // Connection
  authenticated: (data: { playerId: string; player: PlayerPublicInfo }) => void;
  authError: (data: { message: string }) => void;

  // Lobby
  gameCreated: (data: { gameId: string; state: GameStatePublic }) => void;
  gameJoined: (data: { state: GameStatePublic }) => void;
  playerJoined: (data: { player: PlayerPublicInfo }) => void;
  playerLeft: (data: { playerId: string }) => void;
  playerReady: (data: { playerId: string; ready: boolean }) => void;
  gameStarting: (data: { countdown: number }) => void;

  // Game State
  gameStateUpdate: (data: { state: GameStatePublic }) => void;
  gameStarted: (data: { state: GameStatePublic }) => void;
  turnChanged: (data: { playerId: string; timeLimit: number }) => void;
  
  // Player Actions
  cardDrawn: (data: { playerId: string; source: 'deck' | 'discard'; card?: Card }) => void;
  cardDiscarded: (data: { playerId: string; card: Card }) => void;
  meldFormed: (data: { playerId: string; meld: Meld }) => void;
  cardAddedToMeld: (data: { playerId: string; meldId: string; card: Card }) => void;
  handSorted: (data: { cards: Card[] }) => void; // Only to requesting player

  // Round End
  roundEnded: (data: RoundResult) => void;
  newRoundStarting: (data: { countdown: number }) => void;

  // Game End
  gameOver: (data: { 
    winnerId: string;
    finalScores: Record<string, number>;
  }) => void;

  // Errors
  actionError: (data: { action: string; message: string }) => void;
  gameError: (data: { message: string }) => void;

  // Player Status
  playerDisconnected: (data: { playerId: string }) => void;
  playerReconnected: (data: { playerId: string }) => void;

  // Communication
  emoteReceived: (data: { playerId: string; emote: string }) => void;
}

// Event Payload Types
export interface AuthenticatePayload {
  token: string;
}

export interface CreateGamePayload {
  settings: GameSettings;
}

export interface JoinGamePayload {
  gameId: string;
}

export interface DrawCardPayload {
  source: 'deck' | 'discard';
}

export interface DiscardCardPayload {
  cardId: CardId;
}

export interface FormMeldPayload {
  cardIds: CardId[];
}

export interface AddToMeldPayload {
  meldId: string;
  cardId: CardId;
}

export interface SortHandPayload {
  sortBy: 'suit' | 'rank';
}

export interface SetReadyPayload {
  ready: boolean;
}
