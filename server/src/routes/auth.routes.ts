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

// Verify Discord interaction
router.post(
  '/discord/interactions',
  verifyKeyMiddleware(process.env.DISCORD_CLIENT_PUBLIC_KEY!),
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

export default router;
