import express from 'express';
import { craftItem } from '../controllers/crafting.controller.js';

const router = express.Router();

router.post('/', craftItem);

export default router;
