import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDiscordContext } from './DiscordContext';
import { ClientToServerEvents, ServerToClientEvents } from '@shared/types/event.types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: SocketType | null;
  isConnected: boolean;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isReady } = useDiscordContext();

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

    const newSocket: SocketType = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to game server');
    });

    newSocket.on('authError', (data) => {
      console.error('Authentication error:', data.message);
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isReady, token]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
