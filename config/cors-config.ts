import { CorsOptions } from 'cors';
import { config } from './config';

export const corsConfig: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (config.ALLOWED_ORIGINS.includes(requestOrigin) || requestOrigin === undefined) {
      callback(null, true);
    } else {
      callback(new Error('Not alloweb by CORS policy.'));
    }
  },
  optionsSuccessStatus: 200,
};