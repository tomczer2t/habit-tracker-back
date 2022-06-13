import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '../config/config';

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const accessToken = authHeader.split(' ')[1];
    const { id } = verify(accessToken, config.ACCESS_TOKEN_SECRET) as { id: string };
    req.userId = id;
    next();
  } catch (e) {
    res.sendStatus(403);
  }
};