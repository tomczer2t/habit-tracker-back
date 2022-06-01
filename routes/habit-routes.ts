import { Router } from 'express';
import { HabitController } from '../controllers/habit-controller';

export const habitRouter = Router();

habitRouter.route('/')
  .get(HabitController.listHabits)
  .post(HabitController.add);

habitRouter.route('/:habitId')
  .patch(HabitController.update);
