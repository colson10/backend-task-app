'use strict';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import logger from './logger';
import googleRouter from '../routes/google-oauth-router';
import profileRouter from '../routes/profile-router';
import listRouter from '../routes/list-router';
import loggerMiddleware from './logger-middleware';
import taskRouter from '../routes/task-router';
import auth from './auth';

const passport = require('passport');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');


const app = express();
let server = null;

auth(passport);
app.use(passport.initialize());

app.use(cookieSession({
  name: 'session',
  keys: ['SECRECT KEY'],
  maxAge: 24 * 60 * 60 * 1000,
}));
app.use(cookieParser());

app.get('/', (req, res) => {
  if (req.session.token) {
    res.cookie('token', req.session.token);
    res.json({
      status: 'session cookie set',
    });
  } else {
    res.cookie('token', '');
    res.json({
      status: 'session cookie not set',
    });
  }
});

app.get('/logout', (req, res) => {
  req.logout();
  req.session = null;
  res.redirect('/');
});

app.get('/oauth/google', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/userinfo.profile'],
}));

app.get('/oauth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/',
  }),
  (req, res) => {
    console.log(req.user.token);
    req.session.token = req.user.token;
    res.redirect(process.env.CLIENT_URL);
  });

// app.use(cors({
//   credentials: true,
//   origin: process.env.CORS_ORIGIN,
// }));
// app.use(loggerMiddleware);
// app.use(googleRouter);
// app.use(profileRouter);
// app.use(listRouter);
// app.use(taskRouter);
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
