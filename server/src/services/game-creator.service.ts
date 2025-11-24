/**
 * Game Creation Helper
 * Utility to create new games with GameEngine
 */

import { GameEngine } from './game.service';
import { GameState, GameSettings, PointThreshold } from '../../../shared/types/game.types';

export class GameCreator {
  private gameEngine: GameEngine;

  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }

  /**
   * Create a new game with default settings
   */
  createQuickGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      {
        pointThreshold: PointThreshold.MEDIUM,
        maxPlayers: 4,
        minPlayers: 2,
        turnTimeLimit: 60,
        autoStart: false,
      } as unknown as Partial<GameSettings>
    );
  }

  /**
   * Create a short game (101 points)
   */
  createShortGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      {
        pointThreshold: PointThreshold.SHORT,
        maxPlayers: 4,
        minPlayers: 2,
        turnTimeLimit: 45,
        autoStart: false,
      } as unknown as Partial<GameSettings>
    );
  }

  /**
   * Create a long game (501 points)
   */
  createLongGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      {
        pointThreshold: PointThreshold.LONG,
        maxPlayers: 4,
        minPlayers: 2,
        turnTimeLimit: 90,
        autoStart: false,
      } as unknown as Partial<GameSettings>
    );
  }

  /**
   * Create a 1v1 game
   */
  create1v1Game(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string,
    quickGame: boolean = true
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      {
        pointThreshold: quickGame ? PointThreshold.SHORT : PointThreshold.MEDIUM,
        maxPlayers: 2,
        minPlayers: 2,
        turnTimeLimit: 60,
        autoStart: true,
      } as unknown as Partial<GameSettings>
    );
  }

  /**
   * Create a casual game (no time limit)
   */
  createCasualGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      {
        pointThreshold: PointThreshold.MEDIUM,
        maxPlayers: 4,
        minPlayers: 2,
        turnTimeLimit: 0, // No time limit
        autoStart: false,
      } as unknown as Partial<GameSettings>
    );
  }

  /**
   * Create a custom game with all settings
   */
  createCustomGame(
    hostPlayerId: string,
    hostPlayerName: string,
    hostPlayerAvatar: string,
    settings: Partial<GameSettings>
  ): GameState {
    return this.gameEngine.newGame(
      hostPlayerId,
      hostPlayerName,
      hostPlayerAvatar,
      settings
    );
  }
}

/**
 * Preset game configurations
 */
export const GamePresets = {
  QUICK_2P: {
    name: 'Quick 1v1',
    description: 'Fast-paced 2-player game',
    settings: {
      pointThreshold: PointThreshold.SHORT,
      maxPlayers: 2,
      minPlayers: 2,
      turnTimeLimit: 45,
      autoStart: true,
    },
  },
  STANDARD_4P: {
    name: 'Standard 4-Player',
    description: 'Classic Rami game',
    settings: {
      pointThreshold: PointThreshold.MEDIUM,
      maxPlayers: 4,
      minPlayers: 2,
      turnTimeLimit: 60,
      autoStart: false,
    },
  },
  MARATHON: {
    name: 'Marathon',
    description: 'Long game for experienced players',
    settings: {
      pointThreshold: PointThreshold.LONG,
      maxPlayers: 4,
      minPlayers: 2,
      turnTimeLimit: 90,
      autoStart: false,
    },
  },
  CASUAL: {
    name: 'Casual',
    description: 'No time pressure, perfect for learning',
    settings: {
      pointThreshold: PointThreshold.MEDIUM,
      maxPlayers: 4,
      minPlayers: 2,
      turnTimeLimit: 0,
      autoStart: false,
    },
  },
  BLITZ: {
    name: 'Blitz',
    description: 'Quick rounds with time pressure',
    settings: {
      pointThreshold: PointThreshold.SHORT,
      maxPlayers: 4,
      minPlayers: 2,
      turnTimeLimit: 30,
      autoStart: false,
    },
  },
} as const;

/**
 * Validate game settings
 */
export function validateGameSettings(settings: Partial<GameSettings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (settings.maxPlayers && (settings.maxPlayers < 2 || settings.maxPlayers > 4)) {
    errors.push('Max players must be between 2 and 4');
  }

  if (settings.minPlayers && (settings.minPlayers < 2 || settings.minPlayers > 4)) {
    errors.push('Min players must be between 2 and 4');
  }

  if (
    settings.maxPlayers &&
    settings.minPlayers &&
    settings.minPlayers > settings.maxPlayers
  ) {
    errors.push('Min players cannot be greater than max players');
  }

  if (settings.turnTimeLimit && settings.turnTimeLimit < 0) {
    errors.push('Turn time limit cannot be negative');
  }

  if (
    settings.pointThreshold &&
    ![PointThreshold.SHORT, PointThreshold.MEDIUM, PointThreshold.LONG].includes(
      settings.pointThreshold
    )
  ) {
    errors.push('Invalid point threshold');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
