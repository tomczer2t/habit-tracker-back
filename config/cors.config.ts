import { CorsOptions } from 'cors';
import { allowedOrigins } from './allowedOrigins';

export const corsConfig: CorsOptions = {
  origin: (requestOrigin, callback) => {
    if (allowedOrigins.includes(requestOrigin) || requestOrigin === undefined) {
      callback(null, true);
    } else {
      callback(new Error('Not alloweb by CORS policy.'));
    }
  },
  optionsSuccessStatus: 200,
};