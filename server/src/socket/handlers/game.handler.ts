/**
 * Game Event Handlers
 * Handles all game-related Socket.IO events with GameEngine validation
 * and Redis state management
 */

import { Server, Socket } from 'socket.io';
import { GameEngine } from '../../services/game.service';
import { GameCreator, GamePresets } from '../../services/game-creator.service';
import { getRedis } from '../../config/redis';
import {
  GameState,
  GameStatus,
  REDIS_KEYS,
  GameStatePublic,
  PlayerGameView,
  GameSettings,
} from '../../../../shared/types/game.types';
import { PlayerPublicInfo } from '../../../../shared/types/player.types';

export const gameEngine = new GameEngine();
const gameCreator = new GameCreator(gameEngine);

interface SocketData {
  playerId?: string;
  playerName?: string;
  playerAvatar?: string;
}

/**
 * Helper: Get game state from Redis or fallback to in-memory
 */
async function getGameState(gameId: string): Promise<GameState | null> {
  const redis = getRedis();
  const key = REDIS_KEYS.GAME_STATE(gameId);
  
  try {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
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
    
    // Fallback to in-memory game engine
    return gameEngine.getGame(gameId);
  } catch (error) {
    console.error('Error fetching game state from Redis:', error);
    // Fallback to in-memory
    try {
      return gameEngine.getGame(gameId);
    } catch {
      return null;
    }
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
    
    // Add to active games set
    if (game.status === GameStatus.PLAYING) {
      await redis.sAdd(REDIS_KEYS.ACTIVE_GAMES, game.id);
    }
    
    // Add to lobby games set
    if (game.status === GameStatus.LOBBY) {
      await redis.sAdd(REDIS_KEYS.LOBBY_GAMES, game.id);
    } else {
      await redis.sRem(REDIS_KEYS.LOBBY_GAMES, game.id);
    }
    
    // Track player games
    for (const player of game.players) {
      await redis.sAdd(REDIS_KEYS.PLAYER_GAMES(player.id), game.id);
    }
  } catch (error) {
    console.error('Error saving game state to Redis:', error);
  }
}

/**
 * Helper: Create public game state (hides private info like other players' hands)
 */
function createPublicGameState(game: GameState): GameStatePublic {
  return {
    id: game.id,
    status: game.status,
    settings: game.settings,
    hostId: game.hostId,
    players: game.players.map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      cardCount: p.hand.length,
      meldCount: p.melds.length,
      score: p.score,
      roundScore: p.roundScore,
      isConnected: p.isConnected,
      isReady: p.isReady,
    })),
    playerOrder: game.playerOrder,
    currentPlayerId: game.currentPlayerId,
    dealerId: game.dealerId,
    round: game.round,
    phase: game.phase,
    drawPileCount: game.deck.drawPileCount,
    discardPile: game.deck.discardPile.slice(-3), // Only show top 3 cards
    topDiscardCard: game.deck.topDiscardCard,
    tableMelds: game.tableMelds.map((tm) => ({
      id: tm.id,
      ownerId: tm.ownerId,
      meld: tm.meld,
    })),
    currentTurn: game.currentTurn ? {
      playerId: game.currentTurn.playerId,
      phase: game.currentTurn.phase,
      hasDrawn: game.currentTurn.drewCard,
      timeRemaining: game.currentTurn.timeRemaining,
    } : null,
    turnStartTime: game.turnStartTime,
    roundStartTime: game.roundStartTime,
    roundWinnerId: game.roundWinnerId,
    gameWinnerId: game.gameWinnerId,
    roundScores: game.roundScores,
    finalScores: game.finalScores,
  };
}

/**
 * Helper: Create player-specific view (includes their hand)
 */
function createPlayerGameView(game: GameState, playerId: string): PlayerGameView {
  const player = game.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  return {
    ...createPublicGameState(game),
    myHand: player.hand,
    myMelds: player.melds,
    myLegalMoves: game.legalMoves?.playerId === playerId ? game.legalMoves : null,
    myScore: player.score,
    myRoundScore: player.roundScore,
    canRami: player.canGoOut,
  };
}

export function handleGameEvents(io: Server, socket: Socket) {
  const socketData = socket.data as SocketData;

  /**
   * CREATE GAME
   * Host creates a new game
   */
  socket.on('game:create', async (data: {
    preset?: keyof typeof GamePresets;
    settings?: Partial<import('../../../../shared/types/game.types').GameSettings>;
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

      const { preset, settings } = data;

      let game: GameState;

      // Create game based on preset or custom settings
      if (preset && GamePresets[preset]) {
        game = gameCreator.createCustomGame(
          playerId,
          playerName,
          playerAvatar,
          GamePresets[preset].settings as Partial<GameSettings>
        );
      } else if (settings) {
        game = gameCreator.createCustomGame(
          playerId,
          playerName,
          playerAvatar,
          settings
        );
      } else {
        // Default: standard 4-player game
        game = gameCreator.createQuickGame(playerId, playerName, playerAvatar);
      }

      // Save to Redis
      await saveGameState(game);

      // Join socket room
      socket.join(`game:${game.id}`);

      // Send game state to creator
      const playerView = createPlayerGameView(game, playerId);
      socket.emit('game:created', {
        gameId: game.id,
        game: playerView,
      });

      console.log(`✅ Player ${playerName} created game ${game.id}`);
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('game:error', {
        message: error instanceof Error ? error.message : 'Failed to create game',
        code: 'CREATE_FAILED',
      });
    }
  });

  /**
   * JOIN GAME
   * Player joins an existing game
   */
  socket.on('game:join', async (data: { 
    gameId: string; 
    playerId: string;
    playerName: string;
    playerAvatar: string;
  }) => {
    try {
      const { gameId, playerId, playerName, playerAvatar } = data;
      
      // Store player info in socket data
      socketData.playerId = playerId;
      socketData.playerName = playerName;
      socketData.playerAvatar = playerAvatar;

      // Try to get existing game from Redis first
      let game = await getGameState(gameId);
      
      if (!game) {
        socket.emit('game:error', { 
          message: 'Game not found',
          code: 'GAME_NOT_FOUND'
        });
        return;
      }

      // Check if player already in game
      const existingPlayer = game.players.find((p) => p.id === playerId);
      
      if (!existingPlayer) {
        // Join game using game engine
        game = gameEngine.joinGame(gameId, playerId, playerName, playerAvatar);
        await saveGameState(game);
      } else {
        // Player rejoining - update connection status
        existingPlayer.isConnected = true;
        await saveGameState(game);
      }

      // Join socket room
      socket.join(`game:${gameId}`);

      // Send player-specific view to joining player
      const playerView = createPlayerGameView(game, playerId);
      socket.emit('game:joined', { game: playerView });

      // Notify all other players
      const publicState = createPublicGameState(game);
      socket.to(`game:${gameId}`).emit('game:player_joined', {
        gameId,
        playerId,
        playerName,
        playerAvatar,
        game: publicState,
      });

      console.log(`✅ Player ${playerName} joined game ${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to join game',
        code: 'JOIN_FAILED'
      });
    }
  });

  /**
   * START GAME
   * Host starts the game
   */
  socket.on('game:start', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      let game = await getGameState(gameId);
      if (!game) {
        socket.emit('game:error', { message: 'Game not found', code: 'GAME_NOT_FOUND' });
        return;
      }

      // Only host can start
      if (game.hostId !== playerId) {
        socket.emit('game:error', { 
          message: 'Only host can start the game',
          code: 'NOT_HOST'
        });
        return;
      }

      // Start game using engine
      game = gameEngine.startGame(gameId);
      await saveGameState(game);

      // Broadcast to all players
      for (const player of game.players) {
        const playerView = createPlayerGameView(game, player.id);
        io.to(`game:${gameId}`).emit('game:started', {
          gameId,
          game: playerView,
        });
      }

      console.log(`✅ Game ${gameId} started`);
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to start game',
        code: 'START_FAILED'
      });
    }
  });

  /**
   * DRAW CARD
   * Player draws a card from deck or discard pile
   */
  socket.on('game:draw', async (data: { 
    gameId: string; 
    fromDiscard?: boolean;
  }) => {
    try {
      const { gameId, fromDiscard = false } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      // Draw card using engine
      let game = gameEngine.drawCard(gameId, playerId, fromDiscard);
      await saveGameState(game);

      const publicState = createPublicGameState(game);

      // Send updated hand to drawing player
      const playerView = createPlayerGameView(game, playerId);
      socket.emit('game:card_drawn', {
        gameId,
        game: playerView,
      });

      // Notify other players (without showing the card)
      socket.to(`game:${gameId}`).emit('game:card_drawn', {
        gameId,
        playerId,
        fromDiscard,
        game: publicState,
      });

      console.log(`✅ Player ${playerId} drew card from ${fromDiscard ? 'discard' : 'deck'}`);
    } catch (error) {
      console.error('Error drawing card:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to draw card',
        code: 'DRAW_FAILED'
      });
    }
  });

  /**
   * PLAY CARD
   * Player plays cards as a meld
   */
  socket.on('game:play', async (data: { 
    gameId: string; 
    cardIds: string[];
    meldType: 'SET' | 'RUN';
  }) => {
    try {
      const { gameId, cardIds, meldType } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      // Play cards using engine
      let game = gameEngine.playCard(gameId, playerId, cardIds, meldType);
      await saveGameState(game);

      const publicState = createPublicGameState(game);

      // Send updated state to all players
      io.to(`game:${gameId}`).emit('game:meld_created', {
        gameId,
        playerId,
        meldType,
        cardIds,
        game: publicState,
      });

      // Send player-specific views
      for (const player of game.players) {
        const playerView = createPlayerGameView(game, player.id);
        io.to(`game:${gameId}`).emit('game:state_update', {
          gameId,
          game: playerView,
        });
      }

      console.log(`✅ Player ${playerId} created ${meldType} with ${cardIds.length} cards`);
    } catch (error) {
      console.error('Error playing cards:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to play cards',
        code: 'PLAY_FAILED'
      });
    }
  });

  /**
   * DISCARD CARD
   * Player discards a card to end their turn
   */
  socket.on('game:discard', async (data: { 
    gameId: string; 
    cardId: string;
  }) => {
    try {
      const { gameId, cardId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      // Discard card using engine
      let game = gameEngine.discardCard(gameId, playerId, cardId);
      await saveGameState(game);

      const publicState = createPublicGameState(game);

      // Notify all players
      io.to(`game:${gameId}`).emit('game:card_discarded', {
        gameId,
        playerId,
        cardId,
        game: publicState,
      });

      // Send updated views
      for (const player of game.players) {
        const playerView = createPlayerGameView(game, player.id);
        io.to(`game:${gameId}`).emit('game:turn_changed', {
          gameId,
          currentPlayerId: game.currentPlayerId,
          game: playerView,
        });
      }

      console.log(`✅ Player ${playerId} discarded card ${cardId}`);
    } catch (error) {
      console.error('Error discarding card:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to discard card',
        code: 'DISCARD_FAILED'
      });
    }
  });

  /**
   * DECLARE RAMI
   * Player declares Rami (going out)
   */
  socket.on('game:declare', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      // Declare Rami using engine
      let game = gameEngine.declareRami(gameId, playerId);
      await saveGameState(game);

      const publicState = createPublicGameState(game);

      // Notify all players of Rami
      io.to(`game:${gameId}`).emit('game:rami_declared', {
        gameId,
        playerId,
        roundWinnerId: game.roundWinnerId,
        roundScores: game.roundScores,
        finalScores: game.finalScores,
        game: publicState,
      });

      // Check if game is over
      if (game.status === GameStatus.GAME_OVER) {
        io.to(`game:${gameId}`).emit('game:over', {
          gameId,
          winnerId: game.gameWinnerId,
          finalScores: game.finalScores,
          game: publicState,
        });
      } else {
        // Round ended, notify for next round
        io.to(`game:${gameId}`).emit('game:round_ended', {
          gameId,
          roundWinnerId: game.roundWinnerId,
          roundScores: game.roundScores,
          game: publicState,
        });
      }

      console.log(`✅ Player ${playerId} declared Rami in game ${gameId}`);
    } catch (error) {
      console.error('Error declaring Rami:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to declare Rami',
        code: 'DECLARE_FAILED'
      });
    }
  });

  /**
   * END TURN
   * Player manually ends their turn
   */
  socket.on('game:end_turn', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      // End turn using engine
      let game = gameEngine.endTurn(gameId, playerId);
      await saveGameState(game);

      const publicState = createPublicGameState(game);

      // Notify all players of turn change
      io.to(`game:${gameId}`).emit('game:turn_ended', {
        gameId,
        previousPlayerId: playerId,
        currentPlayerId: game.currentPlayerId,
        game: publicState,
      });

      // Send updated views
      for (const player of game.players) {
        const playerView = createPlayerGameView(game, player.id);
        io.to(`game:${gameId}`).emit('game:turn_changed', {
          gameId,
          currentPlayerId: game.currentPlayerId,
          game: playerView,
        });
      }

      console.log(`✅ Player ${playerId} ended turn in game ${gameId}`);
    } catch (error) {
      console.error('Error ending turn:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to end turn',
        code: 'END_TURN_FAILED'
      });
    }
  });

  /**
   * LEAVE GAME
   * Player leaves the game
   */
  socket.on('game:leave', async (data: { gameId: string }) => {
    try {
      const { gameId } = data;
      const playerId = socketData.playerId;

      if (!playerId) {
        socket.emit('game:error', { message: 'Not authenticated', code: 'NOT_AUTHENTICATED' });
        return;
      }

      const game = await getGameState(gameId);
      if (!game) {
        socket.emit('game:error', { message: 'Game not found', code: 'GAME_NOT_FOUND' });
        return;
      }

      // Mark player as disconnected
      const player = game.players.find((p) => p.id === playerId);
      if (player) {
        player.isConnected = false;
        await saveGameState(game);
      }

      // Leave socket room
      socket.leave(`game:${gameId}`);

      const publicState = createPublicGameState(game);

      // Notify other players
      socket.to(`game:${gameId}`).emit('game:player_left', {
        gameId,
        playerId,
        game: publicState,
      });

      socket.emit('game:left', { gameId });

      console.log(`✅ Player ${playerId} left game ${gameId}`);
    } catch (error) {
      console.error('Error leaving game:', error);
      socket.emit('game:error', { 
        message: error instanceof Error ? error.message : 'Failed to leave game',
        code: 'LEAVE_FAILED'
      });
    }
  });
}
