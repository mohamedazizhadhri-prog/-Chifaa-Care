export const GAME_RULES = {
  TOTAL_DECKS: 2,
  CARDS_PER_DECK: 54,
  TOTAL_CARDS: 108,
  HAND_SIZE: 14,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  
  MIN_SET_SIZE: 3,
  MAX_SET_SIZE: 4,
  MIN_RUN_SIZE: 3,
  
  JOKERS_PER_DECK: 2,
  TOTAL_JOKERS: 4,
} as const;

export const POINT_THRESHOLDS = {
  SHORT: 101,
  MEDIUM: 201,
  LONG: 501,
} as const;

export const TURN_TIME_LIMITS = {
  UNLIMITED: 0,
  FAST: 30,
  NORMAL: 60,
  SLOW: 90,
} as const;

export const GAME_TIMING = {
  START_COUNTDOWN: 3, // seconds
  ROUND_END_DELAY: 5, // seconds
  RECONNECT_GRACE_PERIOD: 30, // seconds
  AUTO_KICK_TIMEOUT: 300, // seconds (5 minutes)
} as const;

export const DEALER_SELECTION = {
  FIRST_ROUND: 'RANDOM',
  SUBSEQUENT_ROUNDS: 'ROTATE_CLOCKWISE',
} as const;
