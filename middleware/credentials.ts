import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';

export const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  if (config.ALLOWED_ORIGINS.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};