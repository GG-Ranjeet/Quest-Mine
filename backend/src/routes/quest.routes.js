import { Router } from 'express';
import { getQuests, completeQuest, createQuest, updateQuest, deleteQuest } from '../controllers/quest.controller.js';

const router = Router();

router.get('/', getQuests);
router.post('/', createQuest);
router.post('/complete', completeQuest);
router.put('/:id', updateQuest);
router.delete('/:id', deleteQuest);

export default router;
