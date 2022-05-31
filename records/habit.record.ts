import { pool } from '../utils/db';
import { HabitEntity } from '../types';
import { v4 as uuid } from 'uuid';
import { FieldPacket } from 'mysql2';

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
      const lastDays = habitObj.lastStatUpdateDate.getTime() / (1000 * 60 * 60 * 24);
      const currDays = new Date().getTime() / (1000 * 60 * 60 * 24);
      const differenceInDays = (Number.parseInt((currDays - lastDays + '')));
      habitObj.stats.push(...Array(differenceInDays).fill(0));
    });
    return res.map(habit => new HabitRecord(habit));
  }

  static async getOneById(id: string) {
    const [res] = await pool.execute('SELECT * FROM `habits` WHERE `id` = :id', { id }) as MysqlHabitsResponse;
    return res[0] ? new HabitRecord(res[0]) : null;
  }

  async insert() {
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
}