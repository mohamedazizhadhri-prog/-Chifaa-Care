import { Pool, QueryResult } from 'pg';
import {
  UserEntity,
  CreateUserDTO,
  UpdateUserDTO,
  GameEntity,
  CreateGameDTO,
  UpdateGameDTO,
  GamePlayerEntity,
  CreateGamePlayerDTO,
  UpdateGamePlayerDTO,
  GameRoundEntity,
  CreateGameRoundDTO,
  UpdateGameRoundDTO,
  RoundScoreEntity,
  CreateRoundScoreDTO,
  GameHistoryEntity,
  CreateGameHistoryDTO,
  PlayerStatsEntity,
  UpdatePlayerStatsDTO,
  GameWithPlayers,
  PaginatedResult,
  PaginationParams,
} from '../../../shared/types/database.types';

/**
 * User Repository
 */
export class UserRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateUserDTO): Promise<UserEntity> {
    const query = `
      INSERT INTO users (discord_id, username, avatar_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (discord_id) DO UPDATE
      SET username = EXCLUDED.username,
          avatar_url = EXCLUDED.avatar_url,
          updated_at = NOW()
      RETURNING *
    `;
    const result = await this.pool.query<UserEntity>(query, [
      data.discord_id,
      data.username,
      data.avatar_url || null,
    ]);
    return result.rows[0];
  }

  async findById(id: string): Promise<UserEntity | null> {
    const result = await this.pool.query<UserEntity>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByDiscordId(discordId: string): Promise<UserEntity | null> {
    const result = await this.pool.query<UserEntity>(
      'SELECT * FROM users WHERE discord_id = $1',
      [discordId]
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      values.push(data.username);
    }
    if (data.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex++}`);
      values.push(data.avatar_url);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<UserEntity>(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

/**
 * Game Repository
 */
export class GameRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateGameDTO): Promise<GameEntity> {
    const query = `
      INSERT INTO games (host_id, max_players, target_score, status)
      VALUES ($1, $2, $3, 'waiting')
      RETURNING *
    `;
    const result = await this.pool.query<GameEntity>(query, [
      data.host_id,
      data.max_players || 4,
      data.target_score || 101,
    ]);
    return result.rows[0];
  }

  async findById(id: string): Promise<GameEntity | null> {
    const result = await this.pool.query<GameEntity>(
      'SELECT * FROM games WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIdWithPlayers(id: string): Promise<GameWithPlayers | null> {
    const query = `
      SELECT 
        g.*,
        json_agg(
          json_build_object(
            'id', gp.id,
            'game_id', gp.game_id,
            'user_id', gp.user_id,
            'position', gp.position,
            'score', gp.score,
            'is_ready', gp.is_ready,
            'joined_at', gp.joined_at,
            'user', json_build_object(
              'id', u.id,
              'discord_id', u.discord_id,
              'username', u.username,
              'avatar_url', u.avatar_url,
              'created_at', u.created_at,
              'updated_at', u.updated_at
            )
          ) ORDER BY gp.position
        ) as players
      FROM games g
      LEFT JOIN game_players gp ON g.id = gp.game_id
      LEFT JOIN users u ON gp.user_id = u.id
      WHERE g.id = $1
      GROUP BY g.id
    `;
    const result = await this.pool.query<GameWithPlayers>(query, [id]);
    return result.rows[0] || null;
  }

  async findActiveGames(pagination: PaginationParams): Promise<PaginatedResult<GameEntity>> {
    const offset = (pagination.page - 1) * pagination.limit;
    
    const countQuery = `
      SELECT COUNT(*) FROM games 
      WHERE status IN ('waiting', 'starting', 'playing')
    `;
    const countResult = await this.pool.query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    const query = `
      SELECT * FROM games 
      WHERE status IN ('waiting', 'starting', 'playing')
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.pool.query<GameEntity>(query, [pagination.limit, offset]);

    return {
      data: result.rows,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    };
  }

  async update(id: string, data: UpdateGameDTO): Promise<GameEntity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }
    if (data.winner_id !== undefined) {
      updates.push(`winner_id = $${paramIndex++}`);
      values.push(data.winner_id);
    }
    if (data.finished_at !== undefined) {
      updates.push(`finished_at = $${paramIndex++}`);
      values.push(data.finished_at);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE games
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<GameEntity>(query, values);
    return result.rows[0] || null;
  }
}

/**
 * Game Player Repository
 */
export class GamePlayerRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateGamePlayerDTO): Promise<GamePlayerEntity> {
    const query = `
      INSERT INTO game_players (game_id, user_id, position)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.pool.query<GamePlayerEntity>(query, [
      data.game_id,
      data.user_id,
      data.position,
    ]);
    return result.rows[0];
  }

  async findByGameId(gameId: string): Promise<GamePlayerEntity[]> {
    const result = await this.pool.query<GamePlayerEntity>(
      'SELECT * FROM game_players WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    return result.rows;
  }

  async findByGameAndUser(gameId: string, userId: string): Promise<GamePlayerEntity | null> {
    const result = await this.pool.query<GamePlayerEntity>(
      'SELECT * FROM game_players WHERE game_id = $1 AND user_id = $2',
      [gameId, userId]
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: UpdateGamePlayerDTO): Promise<GamePlayerEntity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.score !== undefined) {
      updates.push(`score = $${paramIndex++}`);
      values.push(data.score);
    }
    if (data.is_ready !== undefined) {
      updates.push(`is_ready = $${paramIndex++}`);
      values.push(data.is_ready);
    }

    if (updates.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE game_players
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<GamePlayerEntity>(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM game_players WHERE id = $1',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getNextAvailablePosition(gameId: string): Promise<number> {
    const result = await this.pool.query<{ position: number }>(
      'SELECT position FROM game_players WHERE game_id = $1 ORDER BY position',
      [gameId]
    );
    
    const positions = result.rows.map(r => r.position);
    for (let i = 0; i < 4; i++) {
      if (!positions.includes(i)) {
        return i;
      }
    }
    throw new Error('Game is full');
  }
}

/**
 * Game Round Repository
 */
export class GameRoundRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateGameRoundDTO): Promise<GameRoundEntity> {
    const query = `
      INSERT INTO game_rounds (game_id, round_number)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await this.pool.query<GameRoundEntity>(query, [
      data.game_id,
      data.round_number,
    ]);
    return result.rows[0];
  }

  async findByGameId(gameId: string): Promise<GameRoundEntity[]> {
    const result = await this.pool.query<GameRoundEntity>(
      'SELECT * FROM game_rounds WHERE game_id = $1 ORDER BY round_number',
      [gameId]
    );
    return result.rows;
  }

  async findCurrentRound(gameId: string): Promise<GameRoundEntity | null> {
    const result = await this.pool.query<GameRoundEntity>(
      `SELECT * FROM game_rounds 
       WHERE game_id = $1 AND finished_at IS NULL 
       ORDER BY round_number DESC 
       LIMIT 1`,
      [gameId]
    );
    return result.rows[0] || null;
  }

  async update(id: string, data: UpdateGameRoundDTO): Promise<GameRoundEntity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.winner_id !== undefined) {
      updates.push(`winner_id = $${paramIndex++}`);
      values.push(data.winner_id);
    }
    if (data.finished_at !== undefined) {
      updates.push(`finished_at = $${paramIndex++}`);
      values.push(data.finished_at);
    }

    if (updates.length === 0) {
      return null;
    }

    values.push(id);
    const query = `
      UPDATE game_rounds
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<GameRoundEntity>(query, values);
    return result.rows[0] || null;
  }
}

/**
 * Round Score Repository
 */
export class RoundScoreRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateRoundScoreDTO): Promise<RoundScoreEntity> {
    const query = `
      INSERT INTO round_scores (round_id, player_id, hand_points, meld_bonus, rami_bonus, total_points)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await this.pool.query<RoundScoreEntity>(query, [
      data.round_id,
      data.player_id,
      data.hand_points,
      data.meld_bonus,
      data.rami_bonus,
      data.total_points,
    ]);
    return result.rows[0];
  }

  async findByRoundId(roundId: string): Promise<RoundScoreEntity[]> {
    const result = await this.pool.query<RoundScoreEntity>(
      'SELECT * FROM round_scores WHERE round_id = $1',
      [roundId]
    );
    return result.rows;
  }
}

/**
 * Game History Repository
 */
export class GameHistoryRepository {
  constructor(private pool: Pool) {}

  async create(data: CreateGameHistoryDTO): Promise<GameHistoryEntity> {
    const query = `
      INSERT INTO game_history (game_id, round_id, player_id, action_type, action_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.pool.query<GameHistoryEntity>(query, [
      data.game_id,
      data.round_id || null,
      data.player_id,
      data.action_type,
      JSON.stringify(data.action_data || {}),
    ]);
    return result.rows[0];
  }

  async findByGameId(gameId: string): Promise<GameHistoryEntity[]> {
    const result = await this.pool.query<GameHistoryEntity>(
      'SELECT * FROM game_history WHERE game_id = $1 ORDER BY created_at',
      [gameId]
    );
    return result.rows;
  }
}

/**
 * Player Stats Repository
 */
export class PlayerStatsRepository {
  constructor(private pool: Pool) {}

  async findByUserId(userId: string): Promise<PlayerStatsEntity | null> {
    const result = await this.pool.query<PlayerStatsEntity>(
      'SELECT * FROM player_stats WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async increment(userId: string, data: UpdatePlayerStatsDTO): Promise<PlayerStatsEntity | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'highest_score') {
          updates.push(`${key} = GREATEST(${key}, $${paramIndex++})`);
        } else {
          updates.push(`${key} = ${key} + $${paramIndex++}`);
        }
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return this.findByUserId(userId);
    }

    values.push(userId);
    const query = `
      UPDATE player_stats
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query<PlayerStatsEntity>(query, values);
    return result.rows[0] || null;
  }

  async getLeaderboard(limit: number = 10): Promise<PlayerStatsEntity[]> {
    const result = await this.pool.query<PlayerStatsEntity>(
      `SELECT ps.*, u.username, u.avatar_url
       FROM player_stats ps
       JOIN users u ON ps.user_id = u.id
       ORDER BY ps.games_won DESC, ps.total_points_scored DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
}
