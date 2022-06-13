import { Router } from 'express';
import { UserController } from '../controllers/user-controller';

export const usersRouter = Router();

usersRouter.route('/')
  .post(UserController.register);

usersRouter.route('/:userId')
  .patch(UserController.update)
  .delete(UserController.delete);