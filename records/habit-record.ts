import { pool } from '../utils/db';
import { HabitEntity } from '../types';
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';
import { CustomError } from '../utils/handleError';
import { updateStatsByDays } from '../utils/updateStatsByDays';

type MysqlHabitsResponse = [HabitEntity[], FieldPacket[]];

export class HabitRecord implements HabitEntity {
  id?: string;
  userId: string;
  name: string;
  stats: number[];
  color: string;
  orderNo: number;
  firstStatDate: Date;
  lastStatUpdateDate: Date;

  constructor(obj: HabitEntity) {
    this.id = obj.id;
    this.userId = obj.userId;
    this.name = obj.name;
    this.stats = obj.stats;
    this.color = obj.color;
    this.orderNo = obj.orderNo;
    this.firstStatDate = obj.firstStatDate;
    this.lastStatUpdateDate = obj.lastStatUpdateDate;
  }

  static async listAllByUserId(userId: string) {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `userId` = :userId ORDER BY `orderNo`', { userId }) as MysqlHabitsResponse;
    res.forEach(habitObj => {
      updateStatsByDays(habitObj);
    });
    return res.map(habit => new HabitRecord(habit));
  }

  static async getOneById(id: string) {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `id` = :id', { id }) as MysqlHabitsResponse;
    if (!res[0]) return null;
    updateStatsByDays(res[0]);
    return new HabitRecord(res[0]);
  }

  static async getHabitsCount(userId: string) {
    const [res] = await pool.execute('SELECT COUNT (*) AS "counter" FROM `habits` WHERE `userId` = :userId', { userId }) as [{ counter: number }[], FieldPacket[]];
    return res[0].counter;
  }

  async insert() {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `userId` = :userId AND `name` = :name', this) as MysqlHabitsResponse;
    if (res[0]) throw new CustomError('You have already added habit with that name.', 409);

    this.id = uuid();
    await pool.execute('INSERT INTO `habits` VALUES(:id, :userId, :name, :stats, :color, :orderNo, :firstStatDate, :lastStatUpdateDate)', {
      id: this.id,
      userId: this.userId,
      name: this.name,
      stats: JSON.stringify(this.stats),
      color: this.color,
      orderNo: this.orderNo,
      firstStatDate: this.firstStatDate,
      lastStatUpdateDate: this.lastStatUpdateDate,
    });
    return this.id;
  }

  async update() {
    await pool.execute('UPDATE `habits` SET `name` = :name, `stats` = :stats, `color` = :color, `orderNo` = :orderNo, `lastStatUpdateDate` = :lastStatUpdateDate WHERE `id` = :id', {
      ...this,
      stats: JSON.stringify(this.stats),
      lastStatUpdateDate: new Date(),
    });
  }

  async delete() {
    await pool.execute('DELETE FROM `habits` WHERE `id` = :id', { id: this.id });
  }
}