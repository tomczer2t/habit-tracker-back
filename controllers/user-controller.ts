import { UserRecord } from '../records/user-record';
import { Request, Response } from 'express';
import { CustomError } from '../utils/handleError';
import { compare } from 'bcrypt';
import { updateUserValidator } from '../utils/updateUserValidator';
import { getUniqueToken } from '../utils/getUniqueToken';

export class UserController {
  static async register(req: Request, res: Response) {
    const userReq = req.body;
    const user = new UserRecord(userReq);
    user.registrationToken = await getUniqueToken();
    await user.insert();
    res.sendStatus(201);
  }

  static async delete(req: Request, res: Response) {
    const { userId } = req.params;
    const user = await UserRecord.getById(userId);
    await user.delete();
    res.sendStatus(200);
  }

  static async update(req: Request, res: Response) {
    const { userId } = req.params;
    const { password, newPassword, newEmail } = req.body as { password: string, newEmail?: string, newPassword?: string };
    const user = await UserRecord.getById(userId);
    if (!user) throw new Error('No user with that id');
    const match = await compare(password, user.password);
    if (!match) {
      throw new CustomError('Wrong password.', 401);
    }
    if (newEmail) {
      if (user.email === newEmail) throw new CustomError('You have already this email.', 400);
      await updateUserValidator({ email: newEmail});
      user.email = newEmail;
      await user.update();
    } else if (newPassword) {
      if (await compare(newPassword, user.password)) {
        throw new CustomError('You have already this password.');
      }
      await updateUserValidator({ password: newPassword });
      user.password = newPassword;
      await user.update(true);
    } else {
      throw new CustomError('All data are required.');
    }
    res.sendStatus(200);
  }

}
