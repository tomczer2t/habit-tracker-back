import { NextFunction, Request, Response } from 'express';
import { saveLog } from './saveLog';

export class CustomError extends Error {
  constructor(public message: string, public status = 400) {
    super(message);
  }
}

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log({ err });
  if (err instanceof CustomError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
  } else {
    void saveLog(`${err.name}: ${err.message}`, 'errorLogs.txt');
    res.status(500).json({
      success: false,
      message: 'Sorry, something went wrong. We are already trying to fix it. Please try again later.',
    });
  }
};
