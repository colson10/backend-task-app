'use strict';

import cors from 'cors';
import express from 'express';
import expressSession from 'express-session';
import mongoose from 'mongoose';
import logger from './logger';
import googleRouter from '../routes/google-oauth-router';
import profileRouter from '../routes/profile-router';
import listRouter from '../routes/list-router';
import loggerMiddleware from './logger-middleware';

const app = express();
let server = null;

app.enable('trust proxy'); // optional, not needed for secure cookies
app.use(expressSession({
  secret: 'somesecret',
  key: 'sid',
  proxy: true, // add this when behind a reverse proxy, if you need secure cookies
  cookie: {
    secure: true,
    maxAge: 5184000000, // 2 months
  },
}));

app.use(cors({
  credentials: true,
  origin: process.env.CORS_ORIGIN,
}));
app.use(loggerMiddleware);
app.use(googleRouter);
app.use(profileRouter);
app.use(listRouter);
app.all('*', (request, response) => {
  logger.log(logger.INFO, 'Returning a 404 from the catch/all default route');
  return response.sendStatus(404);
});

const startServer = () => {
  return mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      server = app.listen(process.env.PORT, () => {
        logger.log(logger.INFO, `SERVER IS LISTENING ON PORT ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `SERVER START ERROR ${JSON.stringify(err)}`);
    });
};

const stopServer = () => {
  return mongoose.disconnect()
    .then(() => {
      server.close(() => {
        logger.log(logger.INFO, 'SERVER IS OFF');
      });
    })
    .catch((err) => {
      logger.log(logger.ERROR, `STOP SERVER ERROR, ${JSON.stringify(err)}`);
    });
};

export { startServer, stopServer };
