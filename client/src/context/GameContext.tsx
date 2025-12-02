import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useSocketContext } from './SocketContext';
import {
  PlayerGameView,
  GameStatePublic,
} from '@shared/types/game.types';
import { ClientToServerEvents, ServerToClientEvents } from '@shared/types/event.types';

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

    const onGameStarted = (data: any) => {
      console.log('Game started event received:', data);
      setGame(data as any);
      setLoading(false);
      setError(null);
    };

    const onCardDrawn = (data: any) => {
      console.log('Card drawn event:', data);
      setGame((prev) => ({
        ...prev,
        ...data,
      } as any));
      setLoading(false);
    };

    const onCardDiscarded = (data: any) => {
      console.log('Card discarded event:', data);
      setGame((prev) => ({
        ...prev,
        ...data,
      } as any));
      setLoading(false);
    };

    const onMeldCreated = (data: any) => {
      console.log('Meld created event:', data);
      setGame((prev) => ({
        ...prev,
        ...data,
      } as any));
      setLoading(false);
    };

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
    socket.on('game:started', onGameStarted as any);
    socket.on('game:card_drawn', onCardDrawn as any);
    socket.on('game:card_discarded', onCardDiscarded as any);
    socket.on('game:meld_created', onMeldCreated as any);
    socket.on('actionError', onActionError as any);
    socket.on('gameError', onGameError as any);
    socket.on('game:error', onGameError as any);

    return () => {
      socket.off('gameStateUpdate', onGameStateUpdate as any);
      socket.off('gameJoined', onGameJoined as any);
      socket.off('gameCreated', onGameCreated as any);
      socket.off('gameStarted', onGameStarted as any);
      socket.off('game:started', onGameStarted as any);
      socket.off('game:card_drawn', onCardDrawn as any);
      socket.off('game:card_discarded', onCardDiscarded as any);
      socket.off('game:meld_created', onMeldCreated as any);
      socket.off('actionError', onActionError as any);
      socket.off('gameError', onGameError as any);
      socket.off('game:error', onGameError as any);
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
    setGame(null);
    setLoading(false);
  };

  const setReady = (ready: boolean) => {
    setLoading(true);
    safeEmit('setReady', { ready });
  };

  const startGame = () => {
    setLoading(true);
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    // Use the actual server event name
    socket.emit('game:start', { gameId: game?.id });
  };

  // Game actions
  const drawCard = (source: 'deck' | 'discard') => {
    setLoading(true);
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('game:draw', { gameId: game?.id, fromDiscard: source === 'discard' });
  };

  const discardCard = (cardId: string) => {
    setLoading(true);
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('game:discard', { gameId: game?.id, cardId });
  };

  const formMeld = (cardIds: string[]) => {
    setLoading(true);
    if (!socket) {
      setError('Not connected to server');
      return;
    }
    socket.emit('game:create_meld', { gameId: game?.id, cardIds });
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
