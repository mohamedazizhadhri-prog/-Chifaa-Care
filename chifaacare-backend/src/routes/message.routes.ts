import express from 'express';
import { getConversations, getThread, sendMessage, markThreadRead } from '../controllers/message.controller';

const router = express.Router();

router.get('/conversations/:userId', getConversations);
router.get('/thread', getThread);
router.post('/send', sendMessage);
router.patch('/mark-read', markThreadRead);

export default router;
