import { Router } from 'express';
import { getQuests, completeQuest } from '../controllers/quest.controller.js';

const router = Router();

router.get('/', getQuests);
router.post('/complete', completeQuest);

export default router;
