export * from './habit';
export * from './user';
export * from './email';
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
