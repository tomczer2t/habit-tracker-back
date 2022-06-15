import express, { Router } from 'express';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import './utils/db';
import { corsConfig } from './config/cors-config';
import cors from 'cors';
import { habitsRouter } from './routes/habits-routes';
import { handleError } from './utils/handleError';
import { usersRouter } from './routes/users-routes';
import { sessionsRouter } from './routes/sessions-routes';
import { credentials } from './middleware/credentials';
import { verifyAccessToken } from './middleware/verifyAccessToken';
import { rateLimiter } from './middleware/rateLimiter';


const app = express();
const apiRouter = Router();

app.use(credentials);
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());
// app.use(rateLimiter);
app.use(morgan('dev'));


app.use('/api', apiRouter);

apiRouter.use('/users', usersRouter);
apiRouter.use('/sessions', sessionsRouter);
apiRouter.use('/habits', verifyAccessToken, habitsRouter);

app.use(handleError);


app.listen(3001, '0.0.0.0', () => {
  console.log('Server is listening on http://localhost:3001');
});