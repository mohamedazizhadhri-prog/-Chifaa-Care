/**
 * Socket.IO Server Setup
 * Initializes Socket.IO and registers all event handlers
 */

import { Server, Socket } from 'socket.io';
import { handleGameEvents } from './handlers/game.handler';
import { handlePlayerEvents } from './handlers/player.handler';
import { getRedis } from '../config/redis';
import { REDIS_KEYS } from '../../../shared/types/game.types';

interface SocketData {
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
  sessionId?: string;
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    const socketData = socket.data as SocketData;
    
    console.log(`✅ Client connected: ${socket.id}`);

    /**
     * AUTHENTICATION
     * Authenticate player before allowing any game actions
     */
    socket.on('authenticate', async (data: {
      playerId: string;
      playerName: string;
      playerAvatar: string;
      discordToken?: string;
    }) => {
      try {
        const { playerId, playerName, playerAvatar, discordToken } = data;

        // TODO: Validate Discord token if provided
        // For now, accept any authentication
        
        // Store player info in socket data
        socketData.playerId = playerId;
        socketData.playerName = playerName;
        socketData.playerAvatar = playerAvatar;
        socketData.sessionId = socket.id;

        // Store player session in Redis
        const redis = getRedis();
        const sessionKey = REDIS_KEYS.PLAYER_SESSION(playerId);
        await redis.set(
          sessionKey,
          JSON.stringify({
            playerId,
            socketId: socket.id,
            playerName,
            playerAvatar,
            connectedAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
          }),
          { EX: 86400 } // 24 hours
        );

        socket.emit('authenticated', {
          playerId,
          playerName,
          sessionId: socket.id,
        });

        console.log(`✅ Player authenticated: ${playerName} (${playerId})`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('auth_error', {
          message: error instanceof Error ? error.message : 'Authentication failed',
        });
      }
    });

    /**
     * CREATE GAME
     * Host creates a new game
     */
    socket.on('create_game', async (data: {
      settings?: {
        pointThreshold?: number;
        maxPlayers?: number;
        turnTimeLimit?: number;
        autoStart?: boolean;
      };
    }) => {
      try {
        const playerId = socketData.playerId;
        const playerName = socketData.playerName;
        const playerAvatar = socketData.playerAvatar;

        if (!playerId || !playerName || !playerAvatar) {
          socket.emit('game:error', {
            message: 'Not authenticated',
            code: 'NOT_AUTHENTICATED',
          });
          return;
        }

        // Create game using GameEngine (imported in game.handler)
        // This is handled by the game handler when it implements newGame
        socket.emit('game:error', {
          message: 'Use game:join to join an existing game. Game creation happens server-side.',
          code: 'NOT_IMPLEMENTED',
        });
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('game:error', {
          message: error instanceof Error ? error.message : 'Failed to create game',
          code: 'CREATE_FAILED',
        });
      }
    });

    /**
     * GET ACTIVE GAMES
     * Retrieve list of active/lobby games
     */
    socket.on('get_games', async (data?: {
      status?: 'lobby' | 'playing' | 'all';
      limit?: number;
    }) => {
      try {
        const { status = 'lobby', limit = 20 } = data || {};
        const redis = getRedis();

        let gameIds: string[] = [];

        if (status === 'lobby') {
          gameIds = await redis.sMembers(REDIS_KEYS.LOBBY_GAMES);
        } else if (status === 'playing') {
          gameIds = await redis.sMembers(REDIS_KEYS.ACTIVE_GAMES);
        } else {
          const lobbyGames = await redis.sMembers(REDIS_KEYS.LOBBY_GAMES);
          const activeGames = await redis.sMembers(REDIS_KEYS.ACTIVE_GAMES);
          gameIds = [...lobbyGames, ...activeGames];
        }

        // Limit results
        gameIds = gameIds.slice(0, limit);

        // Fetch game details
        const games = await Promise.all(
          gameIds.map(async (gameId) => {
            const key = REDIS_KEYS.GAME_STATE(gameId);
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
          })
        );

        // Filter out null games and return basic info
        const gameList = games
          .filter((g) => g !== null)
          .map((game) => ({
            id: game.id,
            hostId: game.hostId,
            playerCount: game.players.length,
            maxPlayers: game.maxPlayers,
            status: game.status,
            settings: game.settings,
            createdAt: game.createdAt,
          }));

        socket.emit('games_list', {
          games: gameList,
          count: gameList.length,
        });
      } catch (error) {
        console.error('Error getting games:', error);
        socket.emit('game:error', {
          message: error instanceof Error ? error.message : 'Failed to get games',
          code: 'GET_GAMES_FAILED',
        });
      }
    });

    /**
     * HEARTBEAT / PING
     * Keep connection alive and update last activity
     */
    socket.on('ping', async () => {
      const playerId = socketData.playerId;
      
      if (playerId) {
        try {
          const redis = getRedis();
          const sessionKey = REDIS_KEYS.PLAYER_SESSION(playerId);
          const session = await redis.get(sessionKey);
          
          if (session) {
            const sessionData = JSON.parse(session);
            sessionData.lastActivity = new Date().toISOString();
            await redis.set(sessionKey, JSON.stringify(sessionData), { EX: 86400 });
          }
        } catch (error) {
          console.error('Error updating heartbeat:', error);
        }
      }

      socket.emit('pong', { timestamp: Date.now() });
    });

    // Attach game event handlers
    handleGameEvents(io, socket);
    
    // Attach player event handlers
    handlePlayerEvents(io, socket);

    /**
     * DISCONNECT
     * Handle player disconnection
     */
    socket.on('disconnect', async (reason) => {
      const playerId = socketData.playerId;
      const playerName = socketData.playerName;
      
      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
      
      if (playerId) {
        try {
          const redis = getRedis();
          
          // Get player's active games
          const playerGamesKey = REDIS_KEYS.PLAYER_GAMES(playerId);
          const gameIds = await redis.sMembers(playerGamesKey);
          
          // Notify each game that player disconnected
          for (const gameId of gameIds) {
            const gameKey = REDIS_KEYS.GAME_STATE(gameId);
            const gameData = await redis.get(gameKey);
            
            if (gameData) {
              const game = JSON.parse(gameData);
              const player = game.players.find((p: any) => p.id === playerId);
              
              if (player) {
                player.isConnected = false;
                await redis.set(gameKey, JSON.stringify(game), { EX: 86400 });
                
                // Notify other players
                io.to(`game:${gameId}`).emit('player:disconnected', {
                  gameId,
                  playerId,
                  playerName: player.username,
                  timestamp: new Date().toISOString(),
                });
                
                console.log(`📡 Player ${player.username} disconnected from game ${gameId}`);
              }
            }
          }
          
          // Update player session
          const sessionKey = REDIS_KEYS.PLAYER_SESSION(playerId);
          const sessionData = await redis.get(sessionKey);
          
          if (sessionData) {
            const session = JSON.parse(sessionData);
            session.disconnectedAt = new Date().toISOString();
            await redis.set(sessionKey, JSON.stringify(session), { EX: 3600 }); // Keep for 1 hour for reconnection
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });

    /**
     * ERROR
     * Handle socket errors
     */
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
      
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Socket error occurred',
        code: 'SOCKET_ERROR',
      });
    });

    /**
     * RECONNECT
     * Handle player reconnection
     */
    socket.on('reconnect', async (data: {
      playerId: string;
      sessionId?: string;
    }) => {
      try {
        const { playerId, sessionId } = data;
        const redis = getRedis();
        
        // Verify player session
        const sessionKey = REDIS_KEYS.PLAYER_SESSION(playerId);
        const sessionData = await redis.get(sessionKey);
        
        if (!sessionData) {
          socket.emit('reconnect_failed', {
            message: 'Session expired',
            code: 'SESSION_EXPIRED',
          });
          return;
        }
        
        const session = JSON.parse(sessionData);
        
        // Update socket data
        socketData.playerId = playerId;
        socketData.playerName = session.playerName;
        socketData.playerAvatar = session.playerAvatar;
        socketData.sessionId = socket.id;
        
        // Update session with new socket ID
        session.socketId = socket.id;
        session.reconnectedAt = new Date().toISOString();
        session.lastActivity = new Date().toISOString();
        await redis.set(sessionKey, JSON.stringify(session), { EX: 86400 });
        
        // Get player's active games and rejoin rooms
        const playerGamesKey = REDIS_KEYS.PLAYER_GAMES(playerId);
        const gameIds = await redis.sMembers(playerGamesKey);
        
        for (const gameId of gameIds) {
          socket.join(`game:${gameId}`);
          
          const gameKey = REDIS_KEYS.GAME_STATE(gameId);
          const gameData = await redis.get(gameKey);
          
          if (gameData) {
            const game = JSON.parse(gameData);
            const player = game.players.find((p: any) => p.id === playerId);
            
            if (player) {
              player.isConnected = true;
              await redis.set(gameKey, JSON.stringify(game), { EX: 86400 });
              
              // Notify other players
              io.to(`game:${gameId}`).emit('player:reconnected', {
                gameId,
                playerId,
                playerName: player.username,
                timestamp: new Date().toISOString(),
              });
              
              console.log(`✅ Player ${player.username} reconnected to game ${gameId}`);
            }
          }
        }
        
        socket.emit('reconnected', {
          playerId,
          playerName: session.playerName,
          gameIds,
        });
      } catch (error) {
        console.error('Error handling reconnect:', error);
        socket.emit('reconnect_failed', {
          message: error instanceof Error ? error.message : 'Reconnection failed',
          code: 'RECONNECT_FAILED',
        });
      }
    });
  });

  console.log('✅ Socket.IO event handlers initialized');
}
