export interface HabitEntity {
  id?: string;
  userId: string;
  name: string;
  stats?: number[];
  orderNo: number;
  color: string;
  firstStatDate?: Date;
  lastStatUpdateDate?: Date;
}