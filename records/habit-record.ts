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
  stats?: number[];
  color: string;
  orderNo: number;
  firstStatDate?: Date;
  lastStatUpdateDate?: Date;

  constructor(obj: HabitEntity) {
    this.id = obj.id;
    this.userId = obj.userId;
    this.name = obj.name;
    this.stats = obj.stats;
    this.color = obj.color;
    this.orderNo = obj.orderNo;
    this.firstStatDate = obj.firstStatDate;
    this.lastStatUpdateDate = obj.lastStatUpdateDate;
    this.validate();
  }

  private validate() {
    if (!this.name) {
      throw new CustomError('Habit name is required.');
    }
    if (this.name.length > 40) {
      throw new CustomError('Habit name cannot be longer than 40 characters.');
    }
    if (this.color.length !== 7 || !this.color.includes('#')) {
      throw new CustomError('Habit color must be appropriate to hexadecimal pattern.');
    }
    if (!this.userId) {
      throw new CustomError('There is no userId', 500);
    }
  }

  static async listAllByUserId(userId: string) {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `userId` = :userId ORDER BY `orderNo`', { userId }) as MysqlHabitsResponse;
    res.forEach(habitObj => {
      habitObj.stats = JSON.parse(habitObj.stats.toString());
      updateStatsByDays({ ...habitObj });
    });
    return res.map(habit => new HabitRecord(habit));
  }

  static async getOneById(id: string) {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `id` = :id', { id }) as MysqlHabitsResponse;
    if (!res[0]) return null;
    res[0].stats = JSON.parse(res[0].stats.toString());
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
    this.stats = Array(40).fill(0);
    this.firstStatDate = new Date(Date.now() - 39 * 24 * 60 * 60 * 1000);
    this.lastStatUpdateDate = new Date();
    await pool.execute('INSERT INTO `habits` VALUES(:id, :userId, :name, :stats, :color, :orderNo, :firstStatDate, :lastStatUpdateDate)', {
      ...this,
      stats: JSON.stringify(this.stats),
    });
    return this.id;
  }

  async update() {
    this.validate();
    await pool.execute('UPDATE `habits` SET `name` = :name, `stats` = :stats, `color` = :color, `orderNo` = :orderNo, `lastStatUpdateDate` = :lastStatUpdateDate WHERE `id` = :id', {
      ...this,
      stats: JSON.stringify(this.stats),
      lastStatUpdateDate: new Date(this.lastStatUpdateDate),
    });
  }

  async delete() {
    await pool.execute('DELETE FROM `habits` WHERE `id` = :id', { id: this.id });
  }
}