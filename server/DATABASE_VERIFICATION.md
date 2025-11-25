# Database Setup Verification Checklist

Use this checklist to verify your PostgreSQL database is properly set up for the Tunisian Rami game.

## ✅ Pre-Setup Verification

- [ ] PostgreSQL 14+ is installed
  ```bash
  psql --version
  ```

- [ ] PostgreSQL service is running
  ```bash
  # macOS
  brew services list | grep postgresql
  
  # Linux
  sudo systemctl status postgresql
  
  # Windows
  # Check Services app for "postgresql" service
  ```

- [ ] Can connect to PostgreSQL
  ```bash
  psql -U postgres -c "SELECT version();"
  ```

- [ ] Node.js 18+ and npm are installed
  ```bash
  node --version
  npm --version
  ```

---

## ✅ Environment Configuration

- [ ] Created `.env` file in `server/` directory
- [ ] Set `DB_HOST` (default: localhost)
- [ ] Set `DB_PORT` (default: 5432)
- [ ] Set `DB_NAME` (default: rami_db)
- [ ] Set `DB_USER` (default: postgres)
- [ ] Set `DB_PASSWORD` (your PostgreSQL password)
- [ ] Other environment variables configured (JWT_SECRET, etc.)

---

## ✅ Database Setup

- [ ] Ran `npm install` in server directory
  ```bash
  cd server
  npm install
  ```

- [ ] Database created (automatic or manual)
  ```bash
  # Automatic
  npm run db:setup
  
  # OR Manual
  psql -U postgres -c "CREATE DATABASE rami_db;"
  ```

- [ ] Migrations executed successfully
  ```bash
  npm run migrate
  ```

- [ ] Migration status shows all migrations completed
  ```bash
  npm run migrate:status
  ```

Expected output:
```
📊 Migration Status:
══════════════════════════════════════════════════
✅ 001_initial_schema.sql
✅ 002_game_history_and_stats.sql
══════════════════════════════════════════════════
Total: 2/2 executed
```

---

## ✅ Database Structure Verification

### Tables Exist

Connect to database and verify tables:
```bash
psql -U postgres -d rami_db
```

- [ ] `users` table exists
  ```sql
  \d users
  ```

- [ ] `games` table exists
  ```sql
  \d games
  ```

- [ ] `game_players` table exists
  ```sql
  \d game_players
  ```

- [ ] `game_rounds` table exists
  ```sql
  \d game_rounds
  ```

- [ ] `round_scores` table exists
  ```sql
  \d round_scores
  ```

- [ ] `game_history` table exists
  ```sql
  \d game_history
  ```

- [ ] `player_stats` table exists
  ```sql
  \d player_stats
  ```

- [ ] `migrations` table exists (migration tracking)
  ```sql
  \d migrations
  ```

### Triggers and Functions

- [ ] `create_player_stats()` function exists
  ```sql
  \df create_player_stats
  ```

- [ ] `update_updated_at_column()` function exists
  ```sql
  \df update_updated_at_column
  ```

- [ ] Triggers are active
  ```sql
  SELECT tgname, tgrelid::regclass 
  FROM pg_trigger 
  WHERE tgname LIKE 'trigger_%';
  ```

### Indexes

- [ ] Check indexes are created
  ```sql
  SELECT tablename, indexname 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  ORDER BY tablename, indexname;
  ```

Should show indexes like:
- `idx_games_status`
- `idx_game_players_game_id`
- `idx_game_history_action_type`
- etc.

---

## ✅ Functionality Testing

### Test User Creation

```sql
-- Create a test user
INSERT INTO users (discord_id, username, avatar_url)
VALUES ('test_discord_123', 'TestUser', 'https://example.com/avatar.png')
RETURNING *;

-- Verify player_stats was automatically created
SELECT * FROM player_stats 
WHERE user_id = (SELECT id FROM users WHERE discord_id = 'test_discord_123');
```

- [ ] User created successfully
- [ ] player_stats entry auto-created
- [ ] created_at and updated_at timestamps set

### Test Game Creation

```sql
-- Create a test game
INSERT INTO games (host_id, max_players, target_score, status)
VALUES (
  (SELECT id FROM users WHERE discord_id = 'test_discord_123'),
  4, 101, 'waiting'
)
RETURNING *;
```

- [ ] Game created successfully
- [ ] Foreign key relationship to users works
- [ ] Default values applied correctly

### Test Player Join

```sql
-- Add player to game
INSERT INTO game_players (game_id, user_id, position)
VALUES (
  (SELECT id FROM games ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM users WHERE discord_id = 'test_discord_123'),
  0
)
RETURNING *;
```

- [ ] Player added to game
- [ ] Unique constraints enforced (try adding same player twice)
- [ ] Position constraint enforced (try same position twice)

### Test updated_at Trigger

```sql
-- Update user and check timestamp
UPDATE users 
SET username = 'UpdatedTestUser' 
WHERE discord_id = 'test_discord_123'
RETURNING updated_at > created_at as timestamp_updated;
```

- [ ] updated_at timestamp automatically updated

### Cleanup Test Data

```sql
-- Clean up test data
DELETE FROM users WHERE discord_id = 'test_discord_123';
```

- [ ] Cascade deletes work (game_players, games removed)

---

## ✅ TypeScript Integration

- [ ] Can import database types in server code
  ```typescript
  import { UserEntity, GameEntity } from '../../../shared/types/database.types';
  ```

- [ ] Repository classes are available
  ```typescript
  import { UserRepository, GameRepository } from './services/database.service';
  ```

- [ ] Can create repository instances
  ```typescript
  import { pool } from './config/database';
  const userRepo = new UserRepository(pool);
  ```

---

## ✅ Connection Testing

### Test Connection Pool

Create a test file: `server/src/test-db.ts`

```typescript
import { pool } from './config/database';
import { UserRepository } from './services/database.service';

async function testConnection() {
  try {
    // Test raw query
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);

    // Test repository
    const userRepo = new UserRepository(pool);
    const users = await pool.query('SELECT COUNT(*) FROM users');
    console.log('✅ Users table accessible:', users.rows[0].count);

    await pool.end();
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
ts-node src/test-db.ts
```

- [ ] Connection test passes
- [ ] Can query database
- [ ] Repository pattern works

---

## ✅ Documentation Review

- [ ] Read `DATABASE_SCHEMA.md` - understand table structure
- [ ] Read `DATABASE_SETUP.md` - setup instructions
- [ ] Read `DATABASE_IMPLEMENTATION.md` - implementation overview
- [ ] Understand repository pattern in `database.service.ts`

---

## ✅ Performance Verification

### Check Query Performance

```sql
-- Explain a typical query
EXPLAIN ANALYZE
SELECT g.*, COUNT(gp.id) as player_count
FROM games g
LEFT JOIN game_players gp ON g.id = gp.game_id
WHERE g.status = 'waiting'
GROUP BY g.id;
```

- [ ] Indexes are being used (check EXPLAIN output)
- [ ] Query execution time is reasonable

### Check Connection Pool

- [ ] Pool size configured (max: 20)
- [ ] Idle timeout set (30s)
- [ ] Connection timeout set (2s)

---

## ✅ Backup Testing

- [ ] Can create backup
  ```bash
  pg_dump -U postgres rami_db > test_backup.sql
  ```

- [ ] Backup file created successfully
- [ ] Backup contains schema and data

---

## ✅ Common Issues Resolved

If you encounter issues, verify:

- [ ] PostgreSQL is running on correct port
- [ ] `.env` file has correct credentials
- [ ] Database name matches in all places
- [ ] User has necessary permissions
  ```sql
  GRANT ALL PRIVILEGES ON DATABASE rami_db TO postgres;
  ```
- [ ] No firewall blocking connection
- [ ] No other service using port 5432

---

## ✅ Final Verification

Run this comprehensive check:

```bash
# 1. Check migration status
npm run migrate:status

# 2. Check tables
psql -U postgres -d rami_db -c "\dt"

# 3. Check data (should be empty initially)
psql -U postgres -d rami_db -c "SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM games) as games,
  (SELECT COUNT(*) FROM player_stats) as stats;"
```

- [ ] All migrations completed
- [ ] All 8 tables exist (7 + migrations table)
- [ ] Ready for development

---

## 🎉 Setup Complete!

If all items above are checked, your database is ready for development!

### Next Steps:

1. ✅ **Database Setup** - COMPLETE
2. ⏭️ **Start Development Server**
   ```bash
   npm run dev
   ```
3. ⏭️ **Set up Redis** for game state
4. ⏭️ **Implement game logic**
5. ⏭️ **Build frontend UI**

---

## 📞 Need Help?

- Check `DATABASE_SETUP.md` for troubleshooting
- Review error logs: PostgreSQL logs location varies by OS
- Test connection: `psql -U postgres -d rami_db`
- Verify environment: `echo $DB_NAME` (or check .env file)

---

## 🔄 Reset Database (if needed)

To start fresh:

```bash
# Drop database
psql -U postgres -c "DROP DATABASE IF EXISTS rami_db;"

# Recreate
psql -U postgres -c "CREATE DATABASE rami_db;"

# Run migrations
npm run migrate
```

---

**Database verification complete! 🚀**
