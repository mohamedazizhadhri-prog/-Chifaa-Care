/**
 * Player Event Handlers
 * Handles player-related Socket.IO events (ready status, chat, etc.)
 */

import { Server, Socket } from 'socket.io';
import { getRedis } from '../../config/redis';
import {
  GameState,
  GameStatus,
  REDIS_KEYS,
} from '../../../../shared/types/game.types';

interface SocketData {
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
}

/**
 * Helper: Get game state from Redis
 */
async function getGameState(gameId: string): Promise<GameState | null> {
  const redis = getRedis();
  const key = REDIS_KEYS.GAME_STATE(gameId);
  
  try {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
        gameStartTime: parsed.gameStartTime ? new Date(parsed.gameStartTime) : null,
        roundStartTime: parsed.roundStartTime ? new Date(parsed.roundStartTime) : null,
        turnStartTime: parsed.turnStartTime ? new Date(parsed.turnStartTime) : null,
        gameEndTime: parsed.gameEndTime ? new Date(parsed.gameEndTime) : null,
        lastActivityAt: new Date(parsed.lastActivityAt),
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching game state from Redis:', error);
    return null;
  }
}

/**
 * Helper: Save game state to Redis
 */
async function saveGameState(game: GameState): Promise<void> {
  const redis = getRedis();
  const key = REDIS_KEYS.GAME_STATE(game.id);
  
  try {
    await redis.set(key, JSON.stringify(game), {
      EX: 86400, // Expire after 24 hours
    });
  } catch (error) {
    console.error('Error saving game state to Redis:', error);
  }
}

export function handlePlayerEvents(io: Server, socket: Socket) {
  const socketData = socket.data as SocketData;

  /**
   * PLAYER READY
   * Player marks themselves as ready to start
   */
  socket.on('player:ready', async (data: { 
    gameId: string; 
  }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('player:error', { 
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('player:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Only allow ready status in lobby
      if (game.status !== GameStatus.LOBBY) {
        socket.emit('player:error', { 
          message: 'Cannot change ready status during game',
          code: 'GAME_IN_PROGRESS'
        });
        return;
      }

      // Update player ready status
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit('player:error', { 
          message: 'Player not in game',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }

      player.isReady = true;
      game.updatedAt = new Date();
      game.version++;
      await saveGameState(game);

      // Notify all players in the room
      io.to(`game:${gameId}`).emit('player:ready', {
        gameId,
        playerId,
        playerName: player.username,
        allReady: game.players.every((p) => p.isReady),
      });

      console.log(`✅ Player ${player.username} is ready in game ${gameId}`);

      // Check if all players are ready
      const allReady = game.players.every((p) => p.isReady);
      if (allReady && game.players.length >= game.minPlayers) {
        io.to(`game:${gameId}`).emit('player:all_ready', {
          gameId,
          canStart: true,
        });
        console.log(`✅ All players ready in game ${gameId}`);
      }
    } catch (error) {
      console.error('Error setting player ready:', error);
      socket.emit('player:error', { 
        message: error instanceof Error ? error.message : 'Failed to set ready status',
        code: 'READY_FAILED'
      });
    }
  });

  /**
   * PLAYER NOT READY
   * Player marks themselves as not ready
   */
  socket.on('player:not_ready', async (data: { 
    gameId: string; 
  }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('player:error', { 
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('player:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Only allow ready status in lobby
      if (game.status !== GameStatus.LOBBY) {
        socket.emit('player:error', { 
          message: 'Cannot change ready status during game',
          code: 'GAME_IN_PROGRESS'
        });
        return;
      }

      // Update player ready status
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit('player:error', { 
          message: 'Player not in game',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }

      player.isReady = false;
      game.updatedAt = new Date();
      game.version++;
      await saveGameState(game);

      // Notify all players in the room
      io.to(`game:${gameId}`).emit('player:not_ready', {
        gameId,
        playerId,
        playerName: player.username,
      });

      console.log(`✅ Player ${player.username} is not ready in game ${gameId}`);
    } catch (error) {
      console.error('Error setting player not ready:', error);
      socket.emit('player:error', { 
        message: error instanceof Error ? error.message : 'Failed to set ready status',
        code: 'NOT_READY_FAILED'
      });
    }
  });

  /**
   * PLAYER MESSAGE
   * Player sends a chat message
   */
  socket.on('player:message', async (data: { 
    gameId: string; 
    message: string;
  }) => {
    try {
      const { gameId, message } = data;
      const playerId = socketData.playerId;
      const playerName = socketData.playerName;

      if (!playerId || !playerName) {
        socket.emit('player:error', { 
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Validate message
      if (!message || message.trim().length === 0) {
        socket.emit('player:error', { 
          message: 'Message cannot be empty',
          code: 'EMPTY_MESSAGE'
        });
        return;
      }

      if (message.length > 500) {
        socket.emit('player:error', { 
          message: 'Message too long (max 500 characters)',
          code: 'MESSAGE_TOO_LONG'
        });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('player:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Verify player is in game
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit('player:error', { 
          message: 'Player not in game',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }

      const messageData = {
        gameId,
        playerId,
        playerName: player.username,
        playerAvatar: player.avatar,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      // Broadcast message to all players in the room (including sender)
      io.to(`game:${gameId}`).emit('player:message', messageData);

      console.log(`💬 Message in game ${gameId} from ${player.username}: ${message.substring(0, 50)}`);

      // Optional: Store message history in Redis
      const redis = getRedis();
      const messageKey = `game:${gameId}:messages`;
      try {
        await redis.rPush(messageKey, JSON.stringify(messageData));
        await redis.expire(messageKey, 86400); // Expire after 24 hours
        
        // Keep only last 100 messages
        const messageCount = await redis.lLen(messageKey);
        if (messageCount > 100) {
          await redis.lTrim(messageKey, -100, -1);
        }
      } catch (error) {
        console.error('Error storing message:', error);
      }
    } catch (error) {
      console.error('Error handling player message:', error);
      socket.emit('player:error', { 
        message: error instanceof Error ? error.message : 'Failed to send message',
        code: 'MESSAGE_FAILED'
      });
    }
  });

  /**
   * PLAYER TYPING
   * Player is typing a message (for typing indicators)
   */
  socket.on('player:typing', async (data: { 
    gameId: string; 
    isTyping: boolean;
  }) => {
    try {
      const { gameId, isTyping } = data;
      const playerId = socketData.playerId;
      const playerName = socketData.playerName;

      if (!playerId || !playerName) {
        return; // Silent fail for typing indicators
      }

      const game = await getGameState(gameId);
      if (!game) {
        return; // Silent fail
      }

      // Verify player is in game
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        return; // Silent fail
      }

      // Broadcast typing status to other players (not to self)
      socket.to(`game:${gameId}`).emit('player:typing', {
        gameId,
        playerId,
        playerName: player.username,
        isTyping,
      });
    } catch (error) {
      // Silent fail for typing indicators
      console.error('Error handling typing indicator:', error);
    }
  });

  /**
   * GET MESSAGE HISTORY
   * Retrieve chat message history for a game
   */
  socket.on('player:get_messages', async (data: { 
    gameId: string;
    limit?: number;
  }) => {
    try {
      const { gameId, limit = 50 } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('player:error', { 
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('player:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Verify player is in game
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit('player:error', { 
          message: 'Player not in game',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }

      // Retrieve messages from Redis
      const redis = getRedis();
      const messageKey = `game:${gameId}:messages`;
      
      const messages = await redis.lRange(messageKey, -limit, -1);
      const parsedMessages = messages.map((msg) => JSON.parse(msg));

      socket.emit('player:messages', {
        gameId,
        messages: parsedMessages,
      });
    } catch (error) {
      console.error('Error retrieving messages:', error);
      socket.emit('player:error', { 
        message: error instanceof Error ? error.message : 'Failed to retrieve messages',
        code: 'GET_MESSAGES_FAILED'
      });
    }
  });

  /**
   * PLAYER EMOTE
   * Player sends an emote/reaction
   */
  socket.on('player:emote', async (data: { 
    gameId: string; 
    emote: string;
  }) => {
    try {
      const { gameId, emote } = data;
      const playerId = socketData.playerId;
      const playerName = socketData.playerName;

      if (!playerId || !playerName) {
        socket.emit('player:error', { 
          message: 'Not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('player:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Verify player is in game
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        socket.emit('player:error', { 
          message: 'Player not in game',
          code: 'PLAYER_NOT_FOUND'
        });
        return;
      }

      // Validate emote
      const validEmotes = ['👍', '👎', '😂', '😢', '😮', '🎉', '💪', '🔥', '❤️', '😎'];
      if (!validEmotes.includes(emote)) {
        socket.emit('player:error', { 
          message: 'Invalid emote',
          code: 'INVALID_EMOTE'
        });
        return;
      }

      // Broadcast emote to all players in the room
      io.to(`game:${gameId}`).emit('player:emote', {
        gameId,
        playerId,
        playerName: player.username,
        emote,
        timestamp: new Date().toISOString(),
      });

      console.log(`✨ Emote in game ${gameId} from ${player.username}: ${emote}`);
    } catch (error) {
      console.error('Error handling emote:', error);
      socket.emit('player:error', { 
        message: error instanceof Error ? error.message : 'Failed to send emote',
        code: 'EMOTE_FAILED'
      });
    }
  });

  /**
   * PLAYER STATUS UPDATE
   * Generic status update (could be used for "Away", "Active", etc.)
   */
  socket.on('player:status', async (data: { 
    gameId: string; 
    status: 'active' | 'away' | 'thinking';
  }) => {
    try {
      const { gameId, status } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        return; // Silent fail for status updates
      }

      const game = await getGameState(gameId);
      if (!game) {
        return; // Silent fail
      }

      // Verify player is in game
      const player = game.players.find((p) => p.id === playerId);
      if (!player) {
        return; // Silent fail
      }

      // Broadcast status to other players
      socket.to(`game:${gameId}`).emit('player:status', {
        gameId,
        playerId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error handling player status:', error);
    }
  });
}
