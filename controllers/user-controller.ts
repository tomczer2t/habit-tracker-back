import { UserRecord } from '../records/user-record';
import { Request, Response } from 'express';
import { CustomError } from '../utils/handleError';
import { compare } from 'bcrypt';
import { updateUserValidator } from '../utils/updateUserValidator';
import { getUniqueToken } from '../utils/getUniqueToken';
import { sendMail } from '../utils/email/nodemailer';
import { newUserTemplate } from '../utils/email/templates/new-user-template';
import { AccountStatus } from '../types';

export class UserController {
  static async register(req: Request, res: Response) {
    const userReq = req.body;
    const user = new UserRecord(userReq);
    user.registrationToken = await getUniqueToken();
    await user.insert();
    const template = newUserTemplate(user.registrationToken);
    const mailRes = await sendMail(user.email, template.subject, template.body);
    console.log({ mailRes });
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
    const {
      password,
      newPassword,
      newEmail,
    } = req.body as { password: string, newEmail?: string, newPassword?: string };
    const user = await UserRecord.getById(userId);
    if (!user) throw new Error('No user with that id');
    const match = await compare(password, user.password);
    if (!match) {
      throw new CustomError('Wrong password.', 401);
    }
    if (newEmail) {
      if (user.email === newEmail) throw new CustomError('You have already this email.', 400);
      await updateUserValidator({ email: newEmail });
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

  static async verifyAccount(req: Request, res: Response) {
    const { registrationToken } = req.params;
    if (!registrationToken) throw new CustomError('Token is required', 400);
    const user = await UserRecord.getByRegistrationToken(registrationToken);
    if (!user)  throw new CustomError('Wrong token', 400);
    if (user.accountStatus === AccountStatus.ACTIVE) throw new CustomError('Account is already verified', 400);
    user.accountStatus = AccountStatus.ACTIVE;
    user.registrationToken = null;
    await user.update();
  }
}
