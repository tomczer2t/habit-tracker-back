import { Router } from 'express';
import { HabitController } from '../controllers/habit-controller';

export const habitsRouter = Router();

habitsRouter.route('/')
  .get(HabitController.listHabits)
  .post(HabitController.add);

habitsRouter.route('/:habitId')
  .get(HabitController.getOne)
  .patch(HabitController.update)
  .delete(HabitController.delete);
