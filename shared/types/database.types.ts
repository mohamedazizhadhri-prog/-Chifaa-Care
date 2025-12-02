/**
 * Database entity types for PostgreSQL
 * These represent the actual database schema
 */

// ============================================================================
// USER ENTITIES
// ============================================================================

export interface UserEntity {
  id: string; // UUID
  discord_id: string;
  username: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  discord_id: string;
  username: string;
  avatar_url?: string;
}

export interface UpdateUserDTO {
  username?: string;
  avatar_url?: string;
}

// ============================================================================
// GAME ENTITIES
// ============================================================================

export type GameStatusDB = 'waiting' | 'starting' | 'playing' | 'finished' | 'abandoned';

export interface GameEntity {
  id: string; // UUID
  host_id: string; // UUID reference to users
  status: GameStatusDB;
  max_players: number;
  target_score: number; // Point threshold (101, 201, 501)
  winner_id: string | null; // UUID reference to users
  created_at: Date;
  updated_at: Date;
  finished_at: Date | null;
}

export interface CreateGameDTO {
  host_id: string;
  max_players?: number;
  target_score?: number;
}

export interface UpdateGameDTO {
  status?: GameStatusDB;
  winner_id?: string;
  finished_at?: Date;
}

// ============================================================================
// GAME PLAYER ENTITIES
// ============================================================================

export interface GamePlayerEntity {
  id: string; // UUID
  game_id: string; // UUID reference to games
  user_id: string; // UUID reference to users
  position: number; // 0-3 for seat position
  score: number; // Total score in the game
  is_ready: boolean;
  joined_at: Date;
}

export interface CreateGamePlayerDTO {
  game_id: string;
  user_id: string;
  position: number;
}

export interface UpdateGamePlayerDTO {
  score?: number;
  is_ready?: boolean;
}

// ============================================================================
// GAME ROUND ENTITIES
// ============================================================================

export interface GameRoundEntity {
  id: string; // UUID
  game_id: string; // UUID reference to games
  round_number: number;
  winner_id: string | null; // UUID reference to users
  started_at: Date;
  finished_at: Date | null;
}

export interface CreateGameRoundDTO {
  game_id: string;
  round_number: number;
}

export interface UpdateGameRoundDTO {
  winner_id?: string;
  finished_at?: Date;
}

// ============================================================================
// GAME HISTORY ENTITIES (for detailed logging)
// ============================================================================

export interface GameHistoryEntity {
  id: string; // UUID
  game_id: string; // UUID reference to games
  round_id: string | null; // UUID reference to game_rounds
  player_id: string; // UUID reference to users
  action_type: GameActionType;
  action_data: Record<string, any>; // JSONB field for flexible data
  created_at: Date;
}

export type GameActionType =
  | 'game_created'
  | 'player_joined'
  | 'player_left'
  | 'player_ready'
  | 'game_started'
  | 'round_started'
  | 'turn_started'
  | 'card_drawn'
  | 'card_discarded'
  | 'meld_formed'
  | 'meld_extended'
  | 'rami_declared'
  | 'round_ended'
  | 'game_ended';

export interface CreateGameHistoryDTO {
  game_id: string;
  round_id?: string;
  player_id: string;
  action_type: GameActionType;
  action_data?: Record<string, any>;
}

// ============================================================================
// ROUND SCORE ENTITIES (for detailed round results)
// ============================================================================

export interface RoundScoreEntity {
  id: string; // UUID
  round_id: string; // UUID reference to game_rounds
  player_id: string; // UUID reference to users
  hand_points: number; // Points left in hand
  meld_bonus: number; // Bonus points from melds
  rami_bonus: number; // Bonus for declaring rami (if winner)
  total_points: number; // Total points earned/lost this round
  created_at: Date;
}

export interface CreateRoundScoreDTO {
  round_id: string;
  player_id: string;
  hand_points: number;
  meld_bonus: number;
  rami_bonus: number;
  total_points: number;
}

// ============================================================================
// PLAYER STATISTICS ENTITIES
// ============================================================================

export interface PlayerStatsEntity {
  id: string; // UUID
  user_id: string; // UUID reference to users (UNIQUE)
  games_played: number;
  games_won: number;
  rounds_played: number;
  rounds_won: number;
  total_points_scored: number;
  highest_score: number;
  ramis_declared: number; // Number of times player declared rami
  melds_formed: number;
  cards_drawn: number;
  cards_discarded: number;
  created_at: Date;
  updated_at: Date;
}

export interface UpdatePlayerStatsDTO {
  games_played?: number;
  games_won?: number;
  rounds_played?: number;
  rounds_won?: number;
  total_points_scored?: number;
  highest_score?: number;
  ramis_declared?: number;
  melds_formed?: number;
  cards_drawn?: number;
  cards_discarded?: number;
}

// ============================================================================
// QUERY RESULT TYPES
// ============================================================================

export interface GameWithPlayers extends GameEntity {
  players: Array<GamePlayerEntity & { user: UserEntity }>;
}

export interface RoundWithScores extends GameRoundEntity {
  scores: Array<RoundScoreEntity & { player: UserEntity }>;
}

export interface GameHistoryWithDetails extends GameHistoryEntity {
  player: UserEntity;
  game: GameEntity;
  round?: GameRoundEntity;
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
