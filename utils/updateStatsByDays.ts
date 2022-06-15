import { HabitEntity } from '../types';

export const updateStatsByDays = (habit: HabitEntity, currClientDate?: string) => {
  const lastDays = Math.floor(habit.lastStatUpdateDate.setHours(0, 0, 0, 0) / (1000 * 60 * 60 * 24));
  const currDays = Math.floor(new Date().setHours(0, 0, 0, 0) / (1000 * 60 * 60 * 24));
  const differenceInDays = currDays - lastDays;

  if (differenceInDays < 0) {
    for (let i = 0; i < Math.abs(differenceInDays); i++) {
      habit.stats.pop();
    }
  } else if (habit.stats.length < 40) {
    habit.stats.unshift(...Array(40 - habit.stats.length).fill(0));
  } else {
    habit.stats.push(...Array(differenceInDays).fill(0));
  }
  // habit.lastStatUpdateDate = new Date(new Date().setHours(0, 0, 0, 0));
};