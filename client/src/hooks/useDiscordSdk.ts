import { useCallback, useEffect, useState } from 'react';
import { useDiscordContext } from '../context/DiscordContext';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  global_name: string | null;
}

export function useDiscordSdk() {
  const { sdk, user: ctxUser, token: ctxToken, isReady, error: ctxError } = useDiscordContext();

  const [user, setUser] = useState<DiscordUser | null>(ctxUser ?? null);
  const [token, setToken] = useState<string | null>(ctxToken ?? null);
  const [loading, setLoading] = useState<boolean>(!isReady && !ctxError);
  const [error, setError] = useState<string | null>(ctxError ?? null);

  useEffect(() => {
    setUser(ctxUser ?? null);
    setToken(ctxToken ?? null);
    setError(ctxError ?? null);
    setLoading(!isReady && !ctxError);
  }, [ctxUser, ctxToken, isReady, ctxError]);

  const authenticate = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!sdk) {
      setError('Discord SDK not available');
      setLoading(false);
      return;
    }

    try {
      const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
      if (!clientId) throw new Error('Discord client id not configured');

      // Request interactive authorization (consent prompt)
      const auth = await sdk.commands.authorize({
        client_id: clientId,
        response_type: 'code',
        state: '',
        prompt: 'consent',
        scope: ['identify', 'guilds'],
      });

      const { code } = auth || {};
      if (!code) throw new Error('No authorization code returned');

      // Exchange authorization code with backend for JWT / app access token
      const resp = await fetch('/api/auth/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Failed to exchange Discord code');
      }

      const payload = await resp.json();
      // Expecting { access_token, user }
      setToken(payload.access_token ?? payload.token ?? null);
      setUser(payload.user ?? null);
      setLoading(false);
    } catch (err: any) {
      setError(err?.message ?? 'Discord authentication failed');
      setLoading(false);
    }
  }, [sdk]);

  return { user, token, loading, error, authenticate } as const;
}
