-- Migration: Add game history, round scores, and player statistics
-- Up

-- Round scores table (detailed scoring per player per round)
CREATE TABLE IF NOT EXISTS round_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hand_points INTEGER NOT NULL DEFAULT 0, -- Points remaining in hand
  meld_bonus INTEGER NOT NULL DEFAULT 0, -- Bonus from melds
  rami_bonus INTEGER NOT NULL DEFAULT 0, -- Bonus for declaring rami
  total_points INTEGER NOT NULL DEFAULT 0, -- Net points for this round
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, player_id)
);

-- Game history table (action log for replays and analytics)
CREATE TABLE IF NOT EXISTS game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
  player_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(50) NOT NULL,
  action_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player statistics table (aggregated stats per user)
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  rounds_played INTEGER DEFAULT 0,
  rounds_won INTEGER DEFAULT 0,
  total_points_scored INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  ramis_declared INTEGER DEFAULT 0,
  melds_formed INTEGER DEFAULT 0,
  cards_drawn INTEGER DEFAULT 0,
  cards_discarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_round_scores_round_id ON round_scores(round_id);
CREATE INDEX idx_round_scores_player_id ON round_scores(player_id);
CREATE INDEX idx_game_history_game_id ON game_history(game_id);
CREATE INDEX idx_game_history_player_id ON game_history(player_id);
CREATE INDEX idx_game_history_action_type ON game_history(action_type);
CREATE INDEX idx_game_history_created_at ON game_history(created_at);
CREATE INDEX idx_player_stats_user_id ON player_stats(user_id);
CREATE INDEX idx_player_stats_games_won ON player_stats(games_won DESC);
CREATE INDEX idx_player_stats_total_points ON player_stats(total_points_scored DESC);

-- Function to automatically create player_stats entry when user is created
CREATE OR REPLACE FUNCTION create_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create player_stats on user creation
CREATE TRIGGER trigger_create_player_stats
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_player_stats();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER trigger_update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_games_updated_at
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_player_stats_updated_at
BEFORE UPDATE ON player_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Down
-- DROP TRIGGER IF EXISTS trigger_update_player_stats_updated_at ON player_stats;
-- DROP TRIGGER IF EXISTS trigger_update_games_updated_at ON games;
-- DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
-- DROP TRIGGER IF EXISTS trigger_create_player_stats ON users;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP FUNCTION IF EXISTS create_player_stats();
-- DROP TABLE IF EXISTS player_stats CASCADE;
-- DROP TABLE IF EXISTS game_history CASCADE;
-- DROP TABLE IF EXISTS round_scores CASCADE;
