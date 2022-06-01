import express, { Router } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import './utils/db';
import { habitRouter } from './routes/habit-routes';
import { corsConfig } from './config/cors.config';
import cors from 'cors';
import 'express-async-errors';
import { handleError } from './utils/handleError';

const app = express();
const apiRouter = Router();

app.use(express.json());
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(morgan('dev'));


app.use('/api', apiRouter);

apiRouter.use('/habits', habitRouter);

app.use(handleError);


app.listen(3001, 'localhost', () => {
  console.log('Server is listening on http://localhost:3001');
});