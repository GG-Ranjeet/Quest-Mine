import { Router } from 'express';
import express from 'express';
import { getUserProfile } from '../controllers/user.controller.js';
import { handleClerkWebhook } from '../controllers/user.controller.js';

const router = Router();

router.get('/', getUserProfile);

export default router;

// Webhook router — MUST use raw body for svix signature verification
export const webhookRouter = Router();
webhookRouter.post(
  '/clerk',
  express.raw({ type: 'application/json' }),
  handleClerkWebhook
);
