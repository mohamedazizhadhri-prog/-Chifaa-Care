# Database Schema Documentation

## Overview

The Tunisian Rami game uses PostgreSQL for persistent data storage and Redis for real-time game state. This document describes the PostgreSQL schema structure.

## Schema Architecture

```
users
  ├─> games (host_id)
  ├─> game_players (user_id)
  ├─> game_rounds (winner_id)
  ├─> round_scores (player_id)
  ├─> game_history (player_id)
  └─> player_stats (user_id)

games
  ├─> game_players (game_id)
  ├─> game_rounds (game_id)
  └─> game_history (game_id)

game_rounds
  ├─> round_scores (round_id)
  └─> game_history (round_id)
```

## Tables

### 1. `users`
Stores Discord user information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| discord_id | VARCHAR(255) | Unique Discord user ID |
| username | VARCHAR(255) | Discord username |
| avatar_url | TEXT | Avatar image URL |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- UNIQUE on `discord_id`

**Triggers:**
- Auto-creates `player_stats` entry on user creation
- Auto-updates `updated_at` on modification

---

### 2. `games`
Stores game metadata and overall game state.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| host_id | UUID | Reference to `users.id` |
| status | VARCHAR(50) | 'waiting', 'starting', 'playing', 'finished', 'abandoned' |
| max_players | INTEGER | Maximum players (default: 4) |
| target_score | INTEGER | Winning score threshold (101, 201, or 501) |
| winner_id | UUID | Reference to `users.id` (nullable) |
| created_at | TIMESTAMP | Game creation time |
| updated_at | TIMESTAMP | Last update time |
| finished_at | TIMESTAMP | Game completion time (nullable) |

**Indexes:**
- Index on `status`
- Index on `created_at`

**Triggers:**
- Auto-updates `updated_at` on modification

---

### 3. `game_players`
Junction table connecting users to games with seat positions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Reference to `games.id` |
| user_id | UUID | Reference to `users.id` |
| position | INTEGER | Seat position (0-3) |
| score | INTEGER | Total accumulated score |
| is_ready | BOOLEAN | Player ready status |
| joined_at | TIMESTAMP | Join time |

**Constraints:**
- UNIQUE on `(game_id, user_id)` - one seat per player per game
- UNIQUE on `(game_id, position)` - one player per seat per game

**Indexes:**
- Index on `game_id`
- Index on `user_id`

---

### 4. `game_rounds`
Tracks individual rounds within a game.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Reference to `games.id` |
| round_number | INTEGER | Sequential round number |
| winner_id | UUID | Reference to `users.id` (nullable) |
| started_at | TIMESTAMP | Round start time |
| finished_at | TIMESTAMP | Round end time (nullable) |

**Constraints:**
- UNIQUE on `(game_id, round_number)`

**Indexes:**
- Index on `game_id`

---

### 5. `round_scores`
Detailed scoring breakdown per player per round.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| round_id | UUID | Reference to `game_rounds.id` |
| player_id | UUID | Reference to `users.id` |
| hand_points | INTEGER | Points remaining in hand |
| meld_bonus | INTEGER | Bonus points from melds |
| rami_bonus | INTEGER | Bonus for declaring rami |
| total_points | INTEGER | Net points for this round |
| created_at | TIMESTAMP | Record creation time |

**Constraints:**
- UNIQUE on `(round_id, player_id)`

**Indexes:**
- Index on `round_id`
- Index on `player_id`

---

### 6. `game_history`
Audit log of all game actions for replay and analytics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| game_id | UUID | Reference to `games.id` |
| round_id | UUID | Reference to `game_rounds.id` (nullable) |
| player_id | UUID | Reference to `users.id` (nullable) |
| action_type | VARCHAR(50) | Type of action (see Action Types) |
| action_data | JSONB | Additional action metadata |
| created_at | TIMESTAMP | Action timestamp |

**Action Types:**
- `game_created`
- `player_joined`
- `player_left`
- `player_ready`
- `game_started`
- `round_started`
- `turn_started`
- `card_drawn`
- `card_discarded`
- `meld_formed`
- `meld_extended`
- `rami_declared`
- `round_ended`
- `game_ended`

**Indexes:**
- Index on `game_id`
- Index on `player_id`
- Index on `action_type`
- Index on `created_at`

---

### 7. `player_stats`
Aggregated player statistics across all games.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to `users.id` (UNIQUE) |
| games_played | INTEGER | Total games participated in |
| games_won | INTEGER | Total games won |
| rounds_played | INTEGER | Total rounds played |
| rounds_won | INTEGER | Total rounds won |
| total_points_scored | INTEGER | Cumulative points scored |
| highest_score | INTEGER | Highest score in a single game |
| ramis_declared | INTEGER | Number of rami declarations |
| melds_formed | INTEGER | Total melds formed |
| cards_drawn | INTEGER | Total cards drawn |
| cards_discarded | INTEGER | Total cards discarded |
| created_at | TIMESTAMP | Stats creation time |
| updated_at | TIMESTAMP | Last update time |

**Constraints:**
- UNIQUE on `user_id`

**Indexes:**
- Index on `user_id`
- Index on `games_won DESC` (for leaderboards)
- Index on `total_points_scored DESC` (for leaderboards)

**Triggers:**
- Auto-updates `updated_at` on modification

---

## Migrations

### Running Migrations

```bash
# Run all pending migrations
cd server
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:down
```

### Migration Files

1. **001_initial_schema.sql** - Core tables (users, games, game_players, game_rounds)
2. **002_game_history_and_stats.sql** - History logging, scoring, and statistics

### Creating New Migrations

```bash
# Add new SQL file in server/migrations/
# Name format: XXX_description.sql
# Where XXX is the next sequential number

# Example: 003_add_user_preferences.sql
```

---

## Data Flow

### Game Lifecycle

1. **Game Creation**
   ```sql
   INSERT INTO games (host_id, max_players, target_score)
   INSERT INTO game_players (game_id, user_id, position)
   INSERT INTO game_history (action_type = 'game_created')
   ```

2. **Player Joins**
   ```sql
   INSERT INTO game_players (game_id, user_id, position)
   INSERT INTO game_history (action_type = 'player_joined')
   ```

3. **Game Starts**
   ```sql
   UPDATE games SET status = 'playing'
   INSERT INTO game_rounds (game_id, round_number = 1)
   INSERT INTO game_history (action_type = 'game_started')
   ```

4. **Round Ends**
   ```sql
   UPDATE game_rounds SET winner_id, finished_at
   INSERT INTO round_scores (for each player)
   UPDATE game_players SET score = score + round_score
   UPDATE player_stats (increment stats)
   INSERT INTO game_history (action_type = 'round_ended')
   ```

5. **Game Ends**
   ```sql
   UPDATE games SET status = 'finished', winner_id, finished_at
   UPDATE player_stats (final stats)
   INSERT INTO game_history (action_type = 'game_ended')
   ```

---

## TypeScript Integration

All database entities have corresponding TypeScript types in:
- `shared/types/database.types.ts`

Repository classes are available in:
- `server/src/services/database.service.ts`

### Example Usage

```typescript
import { pool } from './config/database';
import { UserRepository, GameRepository } from './services/database.service';

const userRepo = new UserRepository(pool);
const gameRepo = new GameRepository(pool);

// Create a user
const user = await userRepo.create({
  discord_id: '123456789',
  username: 'PlayerOne',
  avatar_url: 'https://...'
});

// Create a game
const game = await gameRepo.create({
  host_id: user.id,
  max_players: 4,
  target_score: 101
});

// Find game with players
const gameWithPlayers = await gameRepo.findByIdWithPlayers(game.id);
```

---

## Database Configuration

Configuration is in `server/src/config/database.ts`:

```typescript
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'rami_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // connection pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

Environment variables needed:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rami_db
DB_USER=postgres
DB_PASSWORD=your_password
```

---

## Performance Considerations

1. **Indexes** are created on frequently queried columns
2. **Connection pooling** limits concurrent connections
3. **JSONB** fields allow flexible action logging without schema changes
4. **Cascading deletes** ensure referential integrity
5. **Triggers** automate common updates (timestamps, stats creation)

---

## Backup Strategy

```bash
# Backup database
pg_dump -U postgres rami_db > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postgres rami_db < backup_20240101.sql
```

---

## Testing

```bash
# Create test database
createdb rami_test

# Run migrations on test DB
DB_NAME=rami_test npm run migrate

# Run tests
npm test
```
