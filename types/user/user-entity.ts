import { AccountStatus } from './account-status';

export interface UserEntity {
  id?: string;
  email: string;
  password: string;
  accountStatus: AccountStatus;
  refreshToken?: string;
  registrationToken?: string;
}
