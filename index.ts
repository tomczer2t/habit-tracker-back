import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import './utils/db';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));


app.listen(3001, 'localhost', () => {
  console.log('Server is listening on http://localhost:3001');
});