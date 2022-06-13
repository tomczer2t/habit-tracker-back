
import { CustomError } from './handleError';
import { EMAIL_REGEX, UserRecord } from '../records/user-record';

export const updateUserValidator = async ({ email, password }: { email?: string, password?: string}) => {
  if (password) {
    if (password.length < 8) {
      throw new CustomError('Password must be equal or longer than 8 characters.');
    }
    if (password.length > 100) {
      throw new CustomError('Password is to long. Maximum characters for password is 100.');
    }
    if (!/[A-Z]/.test(password)) {
      throw new CustomError('Password must contains at least one capital letter.');
    }
    if (!/[a-z]/.test(password)) {
      throw new CustomError('Password must contains at least one normal letter.');
    }
    if (!/\d/.test(password)) {
      throw new CustomError('Password must contains at least one number.');
    }
    if (!/[?!@#$%]/.test(password)) {
      throw new CustomError('Password must contains at least one special character: "?", "!", "@", "#", "$" or "%".');
    }
  } else if (email) {
    const existsUser = await UserRecord.getByEmail(email);
    if (existsUser) throw new CustomError('Email is already taken.', 409);
    if (!EMAIL_REGEX.test(email)) {
      throw new CustomError('Email is not valid. Type correct email.');
    }
  }
}