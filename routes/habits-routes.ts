import { Request, Response, Router } from 'express';
import { HabitController } from '../controllers/habit-controller';
import { HabitRecord } from '../records/habit-record';
import { CustomError } from '../utils/handleError';

export const habitRouter = Router();

habitRouter.route('/')
  .get(HabitController.listHabits)
  .post(HabitController.add);

habitRouter.route('/:habitId')
  .patch(HabitController.update)
  .delete(HabitController.delete);
