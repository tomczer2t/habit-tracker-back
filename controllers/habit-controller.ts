import { Request, Response } from 'express';
import { Habit } from '../records/habit-record';
import { HabitEntity } from '../types';

export class HabitController {
  static async listHabits(req: Request, res: Response) {
    const { user } = req.query as { user: string };
    const habits = await Habit.listAllByUserId(user);
    res.json(habits);
  }

  static async getOne(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await Habit.getOneById(habitId);
    res.json(habit);
  }

  static async add(req: Request, res: Response) {
    const obj = req.body as Pick<HabitEntity, 'userId' | 'name' | 'color'>;
    const currentlyAddedHabitsNo = await Habit.getHabitsCount(obj.userId);
    const habit = new Habit({ ...obj, orderNo: currentlyAddedHabitsNo + 1, });
    await habit.insert();
    res.status(201).json(habit);
  }

  static async update(req: Request, res: Response) {
    const { habitId } = req.params;
    const habit = await Habit.getOneById(habitId);
    if (habit.userId !== req.userId) res.sendStatus(403);
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
    const habit = await Habit.getOneById(habitId);
    if (habit.userId !== req.userId) res.sendStatus(403);
    await habit.delete();
    res.sendStatus(200);
  }
}