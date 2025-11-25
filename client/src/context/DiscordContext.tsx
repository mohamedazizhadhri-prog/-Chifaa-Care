import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

interface DiscordContextType {
  sdk: DiscordSDK | null;
  user: DiscordUser | null;
  token: string | null;
  isReady: boolean;
  error: string | null;
}

const DiscordContext = createContext<DiscordContextType | undefined>(undefined);

interface DiscordProviderProps {
  children: ReactNode;
}

export function DiscordProvider({ children }: DiscordProviderProps) {
  const [sdk, setSdk] = useState<DiscordSDK | null>(null);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDiscord = async () => {
      try {
        const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
        
        if (!clientId) {
          throw new Error('Discord Client ID not configured');
        }

        const discordSdk = new DiscordSDK(clientId);
        await discordSdk.ready();

        // Authorize with Discord
        const { code } = await discordSdk.commands.authorize({
          client_id: clientId,
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: ['identify', 'guilds'],
        });

        // Exchange code for access token (this would normally go through your backend)
        const response = await fetch('/api/auth/discord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate with Discord');
        }

        const { access_token, user: discordUser } = await response.json();

        setSdk(discordSdk);
        setUser(discordUser);
        setToken(access_token);
        setIsReady(true);
      } catch (err) {
        console.error('Discord initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Discord SDK');
      }
    };

    initializeDiscord();
  }, []);

  return (
    <DiscordContext.Provider value={{ sdk, user, token, isReady, error }}>
      {children}
    </DiscordContext.Provider>
  );
}

export function useDiscordContext() {
  const context = useContext(DiscordContext);
  if (context === undefined) {
    throw new Error('useDiscordContext must be used within a DiscordProvider');
  }
  return context;
}
