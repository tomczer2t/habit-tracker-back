import { Request, Response } from 'express';
import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { UserRecord } from '../records/user-record';
import { CustomError } from '../utils/handleError';
import { config } from '../config/config';

export class SessionController {
  static async create(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) throw new CustomError('Email and password are required.', 400);
    const user = await UserRecord.getByEmail(email);
    if (!user) throw new CustomError('Wrong email or password', 401);
    const match = await compare(password, user.password);
    if (!match) throw new CustomError('Wrong email or password', 401);

    const accessToken = sign({ id: user.id }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15min' });
    const refreshToken = sign({ id: user.id }, config.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    user.refreshToken = refreshToken;
    await user.update();
    res.cookie('__refresh', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.json({ id: user.id, accessToken });
  }

  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies['__refresh'];
      if (!refreshToken) return res.sendStatus(401);
      const { id } = verify(refreshToken, config.REFRESH_TOKEN_SECRET) as { id: string };
      const user = await UserRecord.getById(id);
      if (!user) return res.sendStatus(403);
      const accessToken = sign({ id }, config.ACCESS_TOKEN_SECRET, { expiresIn: '15min' });
      user.refreshToken = sign({ id: user.id }, config.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
      await user.update();
      res.json(accessToken);
    } catch (e) {
      if (e.message === 'invalid token') {
        res.sendStatus(403);
      } else {
        res.sendStatus(500);
      }
    }
  }

  static async logout(req: Request, res: Response) {
    const refreshToken = req.cookies['__refresh'];
    if (!refreshToken) return res.sendStatus(200);
    const { id } = verify(refreshToken, config.REFRESH_TOKEN_SECRET) as { id: string };
    const user = await UserRecord.getById(id);
    if (!user) return res.sendStatus(200);
    user.refreshToken = null;
    await user.update();

    res.clearCookie('__refresh', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    res.sendStatus(200);
  }
}
