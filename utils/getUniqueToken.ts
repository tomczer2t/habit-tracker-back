import { v4 as uuid } from 'uuid';
import { UserRecord } from '../records/user-record';

export const getUniqueToken = async (): Promise<string> => {
    const token = uuid();
    if (await UserRecord.getByRegistrationToken(token)) {
      return await getUniqueToken();
    }
    return token;
};
