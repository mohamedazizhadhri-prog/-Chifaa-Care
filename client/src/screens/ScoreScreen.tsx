import React from 'react';
import { useGame } from '../context/GameContext';

export default function ScoreScreen() {
  const { game, leaveGame } = useGame();

  if (!game) return <div style={{ padding: 16 }}>No game</div>;

  const roundScores = (game as any).roundScores || {};
  const finalScores = (game as any).finalScores || {};

  return (
    <div style={{ padding: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2>Scores</h2>

      <section style={{ marginTop: 8 }}>
        <h4>Round Scores</h4>
        <ul>
          {Object.entries(roundScores).length === 0 && <li>No round scores available</li>}
          {Object.entries(roundScores).map(([pid, pts]) => (
            <li key={pid}>
              {pid}: {pts}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 8 }}>
        <h4>Final Scores</h4>
        <ul>
          {Object.entries(finalScores).length === 0 && <li>No final scores available</li>}
          {Object.entries(finalScores).map(([pid, pts]) => (
            <li key={pid}>
              {pid}: {pts}
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => leaveGame()}>Leave Game</button>
      </div>
    </div>
  );
}
