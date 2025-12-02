export enum ErrorCode {
  // Authentication Errors (1000-1099)
  AUTH_INVALID_TOKEN = 1000,
  AUTH_EXPIRED_TOKEN = 1001,
  AUTH_MISSING_TOKEN = 1002,
  AUTH_DISCORD_API_ERROR = 1003,

  // Game Errors (2000-2099)
  GAME_NOT_FOUND = 2000,
  GAME_FULL = 2001,
  GAME_ALREADY_STARTED = 2002,
  GAME_NOT_STARTED = 2003,
  GAME_INVALID_STATE = 2004,
  GAME_PLAYER_NOT_HOST = 2005,
  GAME_INSUFFICIENT_PLAYERS = 2006,

  // Player Errors (3000-3099)
  PLAYER_NOT_FOUND = 3000,
  PLAYER_ALREADY_IN_GAME = 3001,
  PLAYER_NOT_IN_GAME = 3002,
  PLAYER_NOT_CONNECTED = 3003,

  // Action Errors (4000-4099)
  ACTION_NOT_YOUR_TURN = 4000,
  ACTION_INVALID_CARD = 4001,
  ACTION_INVALID_MELD = 4002,
  ACTION_CARD_NOT_IN_HAND = 4003,
  ACTION_MUST_DRAW_FIRST = 4004,
  ACTION_ALREADY_DREW = 4005,
  ACTION_EMPTY_DRAW_PILE = 4006,
  ACTION_EMPTY_DISCARD_PILE = 4007,
  ACTION_INVALID_SET = 4008,
  ACTION_INVALID_RUN = 4009,
  ACTION_MELD_TOO_SMALL = 4010,
  ACTION_MELD_NOT_FOUND = 4011,

  // Server Errors (5000-5099)
  SERVER_INTERNAL_ERROR = 5000,
  SERVER_DATABASE_ERROR = 5001,
  SERVER_REDIS_ERROR = 5002,
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Invalid authentication token',
  [ErrorCode.AUTH_EXPIRED_TOKEN]: 'Authentication token has expired',
  [ErrorCode.AUTH_MISSING_TOKEN]: 'Authentication token is required',
  [ErrorCode.AUTH_DISCORD_API_ERROR]: 'Failed to validate Discord token',

  // Game
  [ErrorCode.GAME_NOT_FOUND]: 'Game not found',
  [ErrorCode.GAME_FULL]: 'Game is full',
  [ErrorCode.GAME_ALREADY_STARTED]: 'Game has already started',
  [ErrorCode.GAME_NOT_STARTED]: 'Game has not started yet',
  [ErrorCode.GAME_INVALID_STATE]: 'Invalid game state for this action',
  [ErrorCode.GAME_PLAYER_NOT_HOST]: 'Only the host can perform this action',
  [ErrorCode.GAME_INSUFFICIENT_PLAYERS]: 'Not enough players to start',

  // Player
  [ErrorCode.PLAYER_NOT_FOUND]: 'Player not found',
  [ErrorCode.PLAYER_ALREADY_IN_GAME]: 'Player is already in a game',
  [ErrorCode.PLAYER_NOT_IN_GAME]: 'Player is not in this game',
  [ErrorCode.PLAYER_NOT_CONNECTED]: 'Player is not connected',

  // Actions
  [ErrorCode.ACTION_NOT_YOUR_TURN]: 'It is not your turn',
  [ErrorCode.ACTION_INVALID_CARD]: 'Invalid card',
  [ErrorCode.ACTION_INVALID_MELD]: 'Invalid meld',
  [ErrorCode.ACTION_CARD_NOT_IN_HAND]: 'Card is not in your hand',
  [ErrorCode.ACTION_MUST_DRAW_FIRST]: 'You must draw a card first',
  [ErrorCode.ACTION_ALREADY_DREW]: 'You have already drawn a card this turn',
  [ErrorCode.ACTION_EMPTY_DRAW_PILE]: 'Draw pile is empty',
  [ErrorCode.ACTION_EMPTY_DISCARD_PILE]: 'Discard pile is empty',
  [ErrorCode.ACTION_INVALID_SET]: 'Invalid set: cards must be same rank',
  [ErrorCode.ACTION_INVALID_RUN]: 'Invalid run: cards must be consecutive and same suit',
  [ErrorCode.ACTION_MELD_TOO_SMALL]: 'Meld must contain at least 3 cards',
  [ErrorCode.ACTION_MELD_NOT_FOUND]: 'Meld not found',

  // Server
  [ErrorCode.SERVER_INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.SERVER_DATABASE_ERROR]: 'Database error',
  [ErrorCode.SERVER_REDIS_ERROR]: 'Cache error',
};

export class GameError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string
  ) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'GameError';
  }
}
