import { Router } from 'express';
import { SessionController } from '../controllers/session-controller';

export const sessionsRouter = Router();

sessionsRouter.route('/')
  .post(SessionController.create)
  .patch(SessionController.refresh)
  .delete(SessionController.logout);