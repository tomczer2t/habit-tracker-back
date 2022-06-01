import { NextFunction, Request, Response } from 'express';

export class CustomError extends Error {
  constructor(public message: string, public status = 400) {
    super(message);
  }
}

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Sorry, something went wrong. We are already trying to fix it. Please try again later.',
    });
  }
};