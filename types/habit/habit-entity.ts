export interface HabitEntity {
  id?: string;
  userId?: string;
  name: string;
  stats: number[];
  order: number;
  color: string;
  createdAt: Date;
}