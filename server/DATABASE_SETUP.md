# PostgreSQL Database Setup Guide

## Quick Start

### 1. Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ and npm

### 2. Install PostgreSQL (if not installed)

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rami_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Server Configuration
PORT=3001
NODE_ENV=development

# Discord Configuration
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_BOT_TOKEN=your_bot_token
JWT_SECRET=your_jwt_secret_here
```

### 4. Run Automated Setup

```bash
cd server
npm install
npm run db:setup
```

This will:
- Create the database
- Run all migrations
- Verify the setup

---

## Manual Setup (Alternative)

If you prefer to set up manually or the automated setup fails:

### Step 1: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE rami_db;

# Connect to the new database
\c rami_db

# Verify connection
\dt
```

### Step 2: Run Migrations

```bash
cd server
npm run migrate
```

### Step 3: Verify Setup

```bash
npm run migrate:status
```

You should see:
```
📊 Migration Status:
══════════════════════════════════════════════════
✅ 001_initial_schema.sql
✅ 002_game_history_and_stats.sql
══════════════════════════════════════════════════
Total: 2/2 executed
```

---

## Database Schema Overview

The schema consists of 7 main tables:

1. **users** - Discord user accounts
2. **games** - Game sessions
3. **game_players** - Player participation in games
4. **game_rounds** - Individual rounds within games
5. **round_scores** - Detailed round scoring
6. **game_history** - Complete action log
7. **player_stats** - Aggregated player statistics

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed documentation.

---

## Common Operations

### View All Tables

```sql
\dt
```

### View Table Schema

```sql
\d users
\d games
\d game_players
```

### Query Examples

```sql
-- Get all active games
SELECT * FROM games WHERE status IN ('waiting', 'playing');

-- Get player stats leaderboard
SELECT u.username, ps.*
FROM player_stats ps
JOIN users u ON ps.user_id = u.id
ORDER BY ps.games_won DESC
LIMIT 10;

-- Get game history for a specific game
SELECT 
  gh.action_type,
  u.username,
  gh.action_data,
  gh.created_at
FROM game_history gh
JOIN users u ON gh.player_id = u.id
WHERE gh.game_id = 'your-game-id'
ORDER BY gh.created_at;
```

---

## Migration Management

### Check Migration Status
```bash
npm run migrate:status
```

### Run Pending Migrations
```bash
npm run migrate
```

### Rollback Last Migration
```bash
npm run migrate:down
```

### Create New Migration

1. Create a new file in `server/migrations/`:
   ```
   003_your_migration_name.sql
   ```

2. Add your SQL with Up/Down sections:
   ```sql
   -- Migration: Your description
   -- Up
   
   CREATE TABLE your_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     -- your columns
   );
   
   -- Down
   -- DROP TABLE IF EXISTS your_table CASCADE;
   ```

3. Run the migration:
   ```bash
   npm run migrate
   ```

---

## Troubleshooting

### Error: "database does not exist"

```bash
# Create the database manually
psql -U postgres -c "CREATE DATABASE rami_db;"
```

### Error: "password authentication failed"

Check your `.env` file and ensure `DB_PASSWORD` matches your PostgreSQL password.

```bash
# Reset PostgreSQL password (if needed)
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
```

### Error: "could not connect to server"

Ensure PostgreSQL is running:

```bash
# macOS
brew services restart postgresql@14

# Linux
sudo systemctl status postgresql
sudo systemctl restart postgresql

# Windows
# Use Services app or pg_ctl
```

### Error: "permission denied"

Grant necessary permissions:

```sql
-- Connect as superuser
psql -U postgres

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE rami_db TO postgres;
```

### Clear All Data (Development Only)

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS rami_db;"
psql -U postgres -c "CREATE DATABASE rami_db;"

# Run migrations again
npm run migrate
```

---

## Testing

### Create Test Database

```bash
# Create test database
psql -U postgres -c "CREATE DATABASE rami_test;"

# Run migrations on test DB
DB_NAME=rami_test npm run migrate
```

### Seed Test Data

```sql
-- Insert test users
INSERT INTO users (discord_id, username) VALUES
  ('111111111111111111', 'TestPlayer1'),
  ('222222222222222222', 'TestPlayer2'),
  ('333333333333333333', 'TestPlayer3'),
  ('444444444444444444', 'TestPlayer4');

-- Create a test game
INSERT INTO games (host_id, max_players, target_score, status)
SELECT id, 4, 101, 'waiting'
FROM users WHERE discord_id = '111111111111111111';
```

---

## Backup and Restore

### Backup Database

```bash
# Full backup
pg_dump -U postgres rami_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only
pg_dump -U postgres --schema-only rami_db > schema_backup.sql

# Data only
pg_dump -U postgres --data-only rami_db > data_backup.sql
```

### Restore Database

```bash
# Restore from backup
psql -U postgres rami_db < backup_20240101_120000.sql

# Restore to new database
psql -U postgres -c "CREATE DATABASE rami_db_restore;"
psql -U postgres rami_db_restore < backup_20240101_120000.sql
```

---

## Production Considerations

### Connection Pooling

The app uses connection pooling (configured in `config/database.ts`):

```typescript
max: 20, // Maximum pool size
idleTimeoutMillis: 30000, // Close idle connections after 30s
connectionTimeoutMillis: 2000, // Timeout for acquiring connection
```

### Performance Optimization

1. **Indexes**: Already created on frequently queried columns
2. **Analyze Tables**: Run periodically to update statistics
   ```sql
   ANALYZE users;
   ANALYZE games;
   ANALYZE game_players;
   ```

3. **Vacuum**: Clean up dead tuples
   ```sql
   VACUUM ANALYZE;
   ```

### Security

1. **Use environment variables** for credentials (never commit `.env`)
2. **Use parameterized queries** (already implemented in repositories)
3. **Limit user permissions** in production
4. **Enable SSL** for remote connections

---

## Need Help?

- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Check logs**: `tail -f /var/log/postgresql/postgresql-14-main.log`
- **Check connection**: `psql -U postgres -d rami_db -c "SELECT version();"`

---

## Next Steps

After database setup is complete:

1. ✅ Database configured and migrated
2. ⏭️ Install and configure Redis
3. ⏭️ Start the development server: `npm run dev`
4. ⏭️ Test Socket.IO connections
5. ⏭️ Implement game logic

See [../README.md](../README.md) for the complete setup guide.
