import { Router } from 'express';
import { getUserProfile } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUserProfile);

export default router;
