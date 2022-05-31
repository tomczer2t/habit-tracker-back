import { Router } from 'express';
import { HabitRecord } from '../records/habit.record';
import { HabitEntity } from '../types';

export const habitRouter = Router();


habitRouter.route('/')
  .get(async (req, res) => {
    const habits = await HabitRecord.listAllByUserId('1');
    res.json(habits);
  })
  .post(async (req, res) => {
    const obj = req.body as Pick<HabitEntity, 'userId' | 'name' | 'orderNo' | 'color'>;
    const habit = new HabitRecord({ ...obj, stats: Array(40).fill(0), firstStatDate: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000), lastStatUpdateDate: new Date() });
    await habit.insert();
    res.json(habit);
  });

habitRouter.route('/:habitId')
  .patch(async (req, res) => {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    if (!habit) return res.sendStatus(404);
    const changes = req.body as HabitEntity;

    for (const [key, value] of Object.entries(changes)) {
      // @ts-ignore
      habit[key] = changes[key];
    }
    await habit.update();
    res.json(habit);
  });
