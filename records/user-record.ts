import { v4 as uuid } from 'uuid';
import { hash, genSalt } from 'bcrypt';
import { pool } from '../utils/db';
import { UserEntity } from '../types'
import { CustomError } from '../utils/handleError';
import { FieldPacket } from 'mysql2';

export const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

type MysqlUsersResponse = [UserEntity[], FieldPacket[]];

export class UserRecord implements UserEntity {
  id?: string;
  email: string;
  password: string;
  refreshToken?: string;

  constructor(obj: UserEntity) {
    this.id = obj.id;
    this.email = obj.email;
    this.password = obj.password;
    this.refreshToken = obj.refreshToken;
    this.validate();
  }

  private validate() {
    if (!this.email) {
      throw new CustomError('Email is required.');
    }
    if (!this.password) {
      throw new CustomError('Password is required.');
    }
    if (!EMAIL_REGEX.test(this.email)) {
      throw new CustomError('Email is not valid. Type correct email.');
    }
    if (this.password.length < 8) {
      throw new CustomError('Password must be equal or longer than 8 characters.');
    }
    if (this.password.length > 100) {
      throw new CustomError('Password is to long. Maximum characters for password is 100.');
    }
    if (!/[A-Z]/.test(this.password)) {
      console.log(this.password);
      throw new CustomError('Password must contains at least one capital letter.');
    }
    if (!/[a-z]/.test(this.password)) {
      throw new CustomError('Password must contains at least one normal letter.');
    }
    if (!/\d/.test(this.password)) {
      throw new CustomError('Password must contains at least one number.');
    }
    if (!/[?!@#$%]/.test(this.password)) {
      throw new CustomError('Password must contains at least one special character: "?", "!", "@", "#", "$" or "%".');
    }
  }


  async insert() {
    try {
      this.id = uuid();
      this.password = await hash(this.password, await genSalt(10));
      await pool.execute('INSERT INTO `users` (`id`, `email`, `password`) VALUES (:id, :email, :password)', this);
      return this.id;
    } catch (e) {
      console.log(e);
      throw new CustomError('Email is already in use.', 409);
    }
  }

  async update(password?: boolean) {
    if (password) {
      this.password = await hash(this.password, await genSalt(10));
      await pool.execute('UPDATE `users` SET `email` = :email, `refreshToken` = :refreshToken, `password` = :password WHERE `id` = :id', this);
    } else {
      await pool.execute('UPDATE `users` SET `email` = :email, `refreshToken` = :refreshToken WHERE `id` = :id', this);
    }
  }

  async delete() {
    await pool.execute('DELETE FROM `users` WHERE `id` = :id', { id: this.id });
  }

  static async getByEmail(email: string) {
    const [res] = await pool.execute('SELECT * FROM `users` WHERE `email` = :email', { email }) as MysqlUsersResponse;
    return res[0] ? new UserRecord(res[0]) : null;
  }

  static async getById(id: string) {
    const [res] = await pool.execute('SELECT * FROM `users` WHERE `id` = :id', { id }) as MysqlUsersResponse;
    return res[0] ? new UserRecord(res[0]) : null;
  }
}