import { Request, Response } from 'express';
import { HabitRecord } from '../records/habit-record';
import { HabitEntity } from '../types';

export class HabitController {
  static async listHabits(req: Request, res: Response) {
    const { user: userId } = req.query as { user: string };
    const habits = await HabitRecord.listAllByUserId(userId);
    if (habits[0] && habits[0]?.userId !== req.userId) {
      return res.sendStatus(401);
    }
    res.json(habits);
  }

  static async getOne(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    if (habit && habit.userId !== req.userId) {
      return res.sendStatus(401);
    }
    res.json(habit);
  }

  static async add(req: Request, res: Response) {
    const obj = req.body as Pick<HabitEntity, 'userId' | 'name' | 'color' | 'lastStatUpdateDate'>;
    const firstStatDate = new Date(new Date(obj.lastStatUpdateDate).setHours(0,0,0,0) - 39 * 24 * 60 * 60 * 1000);
    const lastStatUpdateDate = new Date(new Date(obj.lastStatUpdateDate).setHours(0,0,0,0));
    const currentlyAddedHabitsNo = await HabitRecord.getHabitsCount(obj.userId);
    const habit = new HabitRecord({ ...obj, orderNo: currentlyAddedHabitsNo + 1, firstStatDate, lastStatUpdateDate });
    await habit.insert();
    res.status(201).json(habit);
  }

  static async update(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    if (habit && habit.userId !== req.userId) {
      return res.sendStatus(403);
    }
    if (!habit) {
      return res.sendStatus(404);
    }
    const changes = req.body as HabitEntity;
    for (const key of Object.keys(changes) as (keyof HabitEntity)[]) {
      if (key === 'lastStatUpdateDate') {
        habit.lastStatUpdateDate = new Date(new Date(changes[key]).setHours(0,0,0,0));
      }  else {
        // @ts-ignore
        habit[key] = changes[key];
      }
    }
    await habit.update();
    res.json(habit);
  }

  static async delete(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    if (habit && habit.userId !== req.userId) res.sendStatus(403);
    await habit.delete();
    res.sendStatus(200);
  }
}