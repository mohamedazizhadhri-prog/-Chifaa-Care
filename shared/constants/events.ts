// Client -> Server Event Names
export const CLIENT_EVENTS = {
  AUTHENTICATE: 'authenticate',
  CREATE_GAME: 'createGame',
  JOIN_GAME: 'joinGame',
  LEAVE_GAME: 'leaveGame',
  SET_READY: 'setReady',
  START_GAME: 'startGame',
  DRAW_CARD: 'drawCard',
  DISCARD_CARD: 'discardCard',
  FORM_MELD: 'formMeld',
  ADD_TO_MELD: 'addToMeld',
  SORT_HAND: 'sortHand',
  SEND_EMOTE: 'sendEmote',
} as const;

// Server -> Client Event Names
export const SERVER_EVENTS = {
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'authError',
  GAME_CREATED: 'gameCreated',
  GAME_JOINED: 'gameJoined',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_READY: 'playerReady',
  GAME_STARTING: 'gameStarting',
  GAME_STATE_UPDATE: 'gameStateUpdate',
  GAME_STARTED: 'gameStarted',
  TURN_CHANGED: 'turnChanged',
  CARD_DRAWN: 'cardDrawn',
  CARD_DISCARDED: 'cardDiscarded',
  MELD_FORMED: 'meldFormed',
  CARD_ADDED_TO_MELD: 'cardAddedToMeld',
  HAND_SORTED: 'handSorted',
  ROUND_ENDED: 'roundEnded',
  NEW_ROUND_STARTING: 'newRoundStarting',
  GAME_OVER: 'gameOver',
  ACTION_ERROR: 'actionError',
  GAME_ERROR: 'gameError',
  PLAYER_DISCONNECTED: 'playerDisconnected',
  PLAYER_RECONNECTED: 'playerReconnected',
  EMOTE_RECEIVED: 'emoteReceived',
} as const;

// Socket.IO Room Names
export const ROOM_PREFIX = {
  GAME: 'game:',
} as const;

export const getGameRoom = (gameId: string): string => `${ROOM_PREFIX.GAME}${gameId}`;
