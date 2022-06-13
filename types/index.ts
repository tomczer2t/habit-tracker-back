export * from './habit';
export * from './user';
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}