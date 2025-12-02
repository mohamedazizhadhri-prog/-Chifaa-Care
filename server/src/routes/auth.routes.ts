import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { verifyKeyMiddleware } from 'discord-interactions';

const router = Router();

// Discord OAuth callback
router.post('/discord/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    // Exchange code for access token with Discord
    // This is a simplified example - implement full OAuth flow
    
    const token = jwt.sign(
      { userId: 'temp-id', discordId: 'discord-id' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify Discord interaction - Only enable if Discord public key is configured
if (process.env.DISCORD_PUBLIC_KEY && process.env.DISCORD_PUBLIC_KEY !== 'your_public_key_here') {
  router.post(
    '/discord/interactions',
    verifyKeyMiddleware(process.env.DISCORD_PUBLIC_KEY),
    async (req, res) => {
      const { type, data } = req.body;

      // Handle Discord interactions
      if (type === 1) {
        // PING
        return res.json({ type: 1 });
      }

      res.json({ type: 4, data: { content: 'Interaction received' } });
    }
  );
} else {
  // Fallback route for testing without Discord
  router.post('/discord/interactions', async (req, res) => {
    console.log('⚠️  Discord interactions endpoint called but DISCORD_PUBLIC_KEY not configured');
    const { type } = req.body;
    
    if (type === 1) {
      return res.json({ type: 1 });
    }
    
    res.json({ type: 4, data: { content: 'Interaction received (test mode)' } });
  });
}

export default router;
