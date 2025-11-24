import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import {
  PlayerGameView,
  GameStatePublic,
} from '@shared/types/game.types';
import { ClientToServerEvents, ServerToClientEvents } from '@shared/types/event.types';

type SocketType = typeof ({} as any); // socket is accessed via useSocketContext

interface GameContextType {
  game: PlayerGameView | null;
  isInGame: boolean;
  loading: boolean;
  error: string | null;

  // Lobby actions
  createGame: (settings: PlayerGameView['settings']) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;

  // Game actions
  drawCard: (source: 'deck' | 'discard') => void;
  discardCard: (cardId: string) => void;
  formMeld: (cardIds: string[]) => void;
  addToMeld: (meldId: string, cardId: string) => void;
  sortHand: (sortBy: 'suit' | 'rank') => void;
  sendEmote: (emote: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: ProviderProps) {
  const { socket, isConnected } = useSocketContext();
  const [game, setGame] = useState<PlayerGameView | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInGame = !!game;

  // Register socket listeners for server events that affect game state
  useEffect(() => {
    if (!socket) return;

    const onGameStateUpdate = (data: { state: GameStatePublic }) => {
      setGame((prev) => {
        // Prefer narrowing to PlayerGameView when possible — if server sends PlayerGameView use it,
        // otherwise map GameStatePublic to PlayerGameView minimal shape (keep null fields)
        const maybe = data.state as unknown as PlayerGameView;
        return maybe || (prev ?? null);
      });
      setLoading(false);
      setError(null);
    };

    const onGameJoined = (data: { state: GameStatePublic }) => {
      onGameStateUpdate(data);
    };

    const onGameCreated = (data: { gameId: string; state: GameStatePublic }) => {
      onGameStateUpdate({ state: data.state });
    };

    const onGameStarted = (data: { state: GameStatePublic }) => onGameStateUpdate(data);

    const onActionError = (data: { action: string; message: string }) => {
      setError(data.message);
      setLoading(false);
    };

    const onGameError = (data: { message: string }) => {
      setError(data.message);
      setLoading(false);
    };

    socket.on('gameStateUpdate', onGameStateUpdate as any);
    socket.on('gameJoined', onGameJoined as any);
    socket.on('gameCreated', onGameCreated as any);
    socket.on('gameStarted', onGameStarted as any);
    socket.on('actionError', onActionError as any);
    socket.on('gameError', onGameError as any);

    return () => {
      socket.off('gameStateUpdate', onGameStateUpdate as any);
      socket.off('gameJoined', onGameJoined as any);
      socket.off('gameCreated', onGameCreated as any);
      socket.off('gameStarted', onGameStarted as any);
      socket.off('actionError', onActionError as any);
      socket.off('gameError', onGameError as any);
    };
  }, [socket]);

  // Helper to safely emit events only when socket available
  const safeEmit = <K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>) => {
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    try {
      // @ts-ignore - socket typing is provided by SocketContext socket
      socket.emit(event as string, ...args);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send action');
    }
  };

  // Lobby actions
  const createGame = (settings: PlayerGameView['settings']) => {
    setLoading(true);
    safeEmit('createGame', { settings } as any);
  };

  const joinGame = (gameId: string) => {
    setLoading(true);
    safeEmit('joinGame', { gameId });
  };

  const leaveGame = () => {
    setLoading(true);
    safeEmit('leaveGame');
    // optimistic local cleanup
    setGame(null);
    setLoading(false);
  };

  const setReady = (ready: boolean) => {
    setLoading(true);
    safeEmit('setReady', { ready });
  };

  const startGame = () => {
    setLoading(true);
    safeEmit('startGame');
  };

  // Game actions
  const drawCard = (source: 'deck' | 'discard') => {
    setLoading(true);
    safeEmit('drawCard', { source });
  };

  const discardCard = (cardId: string) => {
    setLoading(true);
    safeEmit('discardCard', { cardId });
  };

  const formMeld = (cardIds: string[]) => {
    setLoading(true);
    safeEmit('formMeld', { cardIds });
  };

  const addToMeld = (meldId: string, cardId: string) => {
    setLoading(true);
    safeEmit('addToMeld', { meldId, cardId });
  };

  const sortHand = (sortBy: 'suit' | 'rank') => {
    setLoading(true);
    safeEmit('sortHand', { sortBy });
  };

  const sendEmote = (emote: string) => {
    safeEmit('sendEmote', { emote });
  };

  const value = useMemo(() => ({
    game,
    isInGame,
    loading,
    error,
    createGame,
    joinGame,
    leaveGame,
    setReady,
    startGame,
    drawCard,
    discardCard,
    formMeld,
    addToMeld,
    sortHand,
    sendEmote,
  }), [game, isInGame, loading, error]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameContext must be used within a GameProvider');
  return ctx;
}

export function useGame() {
  return useGameContext();
}
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import { useDiscordContext } from './DiscordContext';
import { 
  GameStatePublic, 
  GameSettings, 
  PointThreshold 
} from '@shared/types/game.types';
import { Card, CardId } from '@shared/types/card.types';
import { PlayerPublicInfo } from '@shared/types/player.types';

interface GameContextType {
  gameState: GameStatePublic | null;
  currentPlayer: PlayerPublicInfo | null;
  myPlayer: PlayerPublicInfo | null;
  isMyTurn: boolean;
  error: string | null;
  isLoading: boolean;
  
  // Actions
  createGame: (settings: GameSettings) => void;
  joinGame: (gameId: string) => void;
  leaveGame: () => void;
  setReady: (ready: boolean) => void;
  startGame: () => void;
  drawCard: (source: 'deck' | 'discard') => void;
  discardCard: (cardId: CardId) => void;
  formMeld: (cardIds: CardId[]) => void;
  addToMeld: (meldId: string, cardId: CardId) => void;
  sortHand: (sortBy: 'suit' | 'rank') => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const { socket, isConnected } = useSocketContext();
  const { user } = useDiscordContext();
  const [gameState, setGameState] = useState<GameStatePublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const myPlayer = gameState?.players.find(p => p.id === user?.id) || null;
  const currentPlayer = gameState?.players.find(p => p.id === gameState.currentPlayerId) || null;
  const isMyTurn = gameState?.currentPlayerId === user?.id;

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Listen for game state updates
    socket.on('gameStateUpdate', ({ state }) => {
      setGameState(state);
      setIsLoading(false);
    });

    socket.on('gameCreated', ({ state }) => {
      setGameState(state);
      setIsLoading(false);
    });

    socket.on('gameJoined', ({ state }) => {
      setGameState(state);
      setIsLoading(false);
    });

    socket.on('gameStarted', ({ state }) => {
      setGameState(state);
    });

    socket.on('playerJoined', ({ player }) => {
      if (gameState) {
        setGameState({
          ...gameState,
          players: [...gameState.players, player],
        });
      }
    });

    socket.on('playerLeft', ({ playerId }) => {
      if (gameState) {
        setGameState({
          ...gameState,
          players: gameState.players.filter(p => p.id !== playerId),
        });
      }
    });

    socket.on('actionError', ({ action, message }) => {
      setError(`${action}: ${message}`);
      setTimeout(() => setError(null), 5000);
    });

    socket.on('gameError', ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    setIsLoading(false);

    return () => {
      socket.off('gameStateUpdate');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('gameStarted');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('actionError');
      socket.off('gameError');
    };
  }, [socket, isConnected, gameState]);

  const createGame = (settings: GameSettings) => {
    if (!socket) return;
    socket.emit('createGame', { settings });
  };

  const joinGame = (gameId: string) => {
    if (!socket) return;
    socket.emit('joinGame', { gameId });
  };

  const leaveGame = () => {
    if (!socket) return;
    socket.emit('leaveGame');
    setGameState(null);
  };

  const setReady = (ready: boolean) => {
    if (!socket) return;
    socket.emit('setReady', { ready });
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('startGame');
  };

  const drawCard = (source: 'deck' | 'discard') => {
    if (!socket) return;
    socket.emit('drawCard', { source });
  };

  const discardCard = (cardId: CardId) => {
    if (!socket) return;
    socket.emit('discardCard', { cardId });
  };

  const formMeld = (cardIds: CardId[]) => {
    if (!socket) return;
    socket.emit('formMeld', { cardIds });
  };

  const addToMeld = (meldId: string, cardId: CardId) => {
    if (!socket) return;
    socket.emit('addToMeld', { meldId, cardId });
  };

  const sortHand = (sortBy: 'suit' | 'rank') => {
    if (!socket) return;
    socket.emit('sortHand', { sortBy });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        currentPlayer,
        myPlayer,
        isMyTurn,
        error,
        isLoading,
        createGame,
        joinGame,
        leaveGame,
        setReady,
        startGame,
        drawCard,
        discardCard,
        formMeld,
        addToMeld,
        sortHand,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}
