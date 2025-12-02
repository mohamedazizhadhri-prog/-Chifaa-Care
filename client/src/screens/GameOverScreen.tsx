import React from 'react';
import { useGame } from '../hooks/useGame';

const GameOverScreen: React.FC = () => {
  const { gameState } = useGame();

  if (!gameState) return null;

  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const handlePlayAgain = () => {
    window.location.reload();
  };

  return (
    <div className="screen">
      <div className="card" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
        <h1 style={{ marginBottom: '2rem' }}>Game Over!</h1>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.2)', 
          padding: '2rem', 
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Winner</h2>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{winner.name}</p>
          <p style={{ fontSize: '2.5rem', marginTop: '1rem', color: '#ffd700' }}>{winner.score} points</p>
        </div>

        <div style={{ marginBottom: '2rem', width: '100%' }}>
          <h3 style={{ marginBottom: '1rem' }}>Final Scores</h3>
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.75rem 1.5rem',
                background: index === 0 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                border: index === 0 ? '2px solid #ffd700' : 'none'
              }}
            >
              <span>
                {index === 0 && '👑 '}
                #{index + 1} {player.name}
              </span>
              <span style={{ fontWeight: 'bold' }}>{player.score} pts</span>
            </div>
          ))}
        </div>

        <button onClick={handlePlayAgain}>
          🎮 Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
