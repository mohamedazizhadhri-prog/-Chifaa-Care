import { DiscordProvider } from './context/DiscordContext';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import LoadingScreen from './screens/LoadingScreen';
import ErrorScreen from './screens/ErrorScreen';
import LobbyScreen from './screens/LobbyScreen';
import GameScreen from './screens/GameScreen';
import GameOverScreen from './screens/GameOverScreen';
import { useGame } from './hooks/useGame';
import { GameStatus } from '@shared/types/game.types';

function AppContent() {
  const { gameState, error, isLoading } = useGame();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!gameState) {
    return <LobbyScreen />;
  }

  switch (gameState.status) {
    case GameStatus.LOBBY:
      return <LobbyScreen />;
    case GameStatus.PLAYING:
    case GameStatus.ROUND_END:
      return <GameScreen />;
    case GameStatus.GAME_OVER:
      return <GameOverScreen />;
    default:
      return <LoadingScreen />;
  }
}

function App() {
  return (
    <DiscordProvider>
      <SocketProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </SocketProvider>
    </DiscordProvider>
  );
}

export default App;
