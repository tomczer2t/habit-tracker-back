import { Request, Response } from 'express';
import { HabitRecord } from '../records/habit-record';
import { HabitEntity } from '../types';

export class HabitController {

  static async listHabits(req: Request, res: Response) {
    const habits = await HabitRecord.listAllByUserId('1');
    res.json(habits);
  }

  static async add(req: Request, res: Response) {
    const obj = req.body as Pick<HabitEntity, 'userId' | 'name' | 'orderNo' | 'color'>;
    const habit = new HabitRecord({
      ...obj,
      stats: Array(40).fill(0),
      firstStatDate: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
      lastStatUpdateDate: new Date(),
    });
    await habit.insert();
    res.status(201).json(habit);
  }

  static async update(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    if (!habit) return res.sendStatus(404);
    const changes = req.body as HabitEntity;

    for (const key of Object.keys(changes) as (keyof HabitEntity)[]) {
      // @ts-ignore
      habit[key] = changes[key];
    }

    await habit.update();
    res.json(habit);
  }

  static async delete(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await HabitRecord.getOneById(habitId);
    await habit.delete();
    res.sendStatus(200);
  }
}