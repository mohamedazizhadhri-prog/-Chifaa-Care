import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { GameEngine } from '../services/game.service';

const router = Router();
const gameService = new GameEngine();

// Create a new game
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    const { maxPlayers, targetScore } = req.body;
    const game = await gameService.createGame(req.user!.userId, {
      maxPlayers: maxPlayers || 4,
      targetScore: targetScore || 101,
    });
    
    res.json({ game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Get game details
router.get('/:gameId', authenticate, async (req: AuthRequest, res) => {
  try {
    const game = await gameService.getGame(req.params.gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json({ game });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Join a game
router.post('/:gameId/join', authenticate, async (req: AuthRequest, res) => {
  try {
    await gameService.joinGame(req.params.gameId, req.user!.userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join game' });
  }
});

export default router;
