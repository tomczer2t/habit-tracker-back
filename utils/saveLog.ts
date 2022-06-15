import fsPromises from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

export const saveLog = async (txt: string, fileName: string) => {
  const logsPathDir = join(__dirname, '..', 'logs');
  if (!existsSync(logsPathDir)) {
    await fsPromises.mkdir(logsPathDir);
  }
  const dateTime = new Date().toLocaleDateString();
  const message = `${ dateTime }\t${uuid()}\t${ txt }\n`;
  await fsPromises.appendFile(join(logsPathDir, fileName), message);
};