import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const defaultSettings = {
  pointThreshold: 201,
  minPlayers: 2,
  maxPlayers: 4,
  turnTimeLimit: 0,
  autoStart: false,
};

export default function LobbyScreen() {
  const { game, createGame, joinGame, setReady, startGame, leaveGame, loading, error } = useGame();
  const [joinId, setJoinId] = useState('');
  const [ready, setReadyLocal] = useState(false);

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2>Lobby</h2>

      {!game ? (
        <div>
          <p>No game joined.</p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              placeholder="Join game id"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              style={{ padding: 8 }}
            />
            <button onClick={() => joinGame(joinId)} disabled={loading || !joinId}>
              Join
            </button>
            <button onClick={() => createGame(defaultSettings as any)} disabled={loading}>
              Create Game
            </button>
          </div>
          {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Game:</strong> {game.id}
              <div style={{ fontSize: 13, color: '#666' }}>
                Status: {game.status} • Phase: {game.phase}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setReady(!ready)} disabled={loading}>
                {ready ? 'Unready' : 'Ready'}
              </button>
              <button onClick={() => startGame()} disabled={loading}>
                Start Game
              </button>
              <button onClick={() => leaveGame()} disabled={loading}>
                Leave
              </button>
            </div>
          </div>

          <section style={{ marginTop: 12 }}>
            <h4>Players</h4>
            <ul style={{ paddingLeft: 16 }}>
              {game.players.map((p) => (
                <li key={p.id}>
                  {p.username} {p.position !== undefined ? ` (pos ${p.position})` : ''}
                </li>
              ))}
            </ul>
          </section>

          {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
