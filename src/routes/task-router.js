'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import Task from '../model/task';

const jsonParser = bodyParser.json();
const taskRouter = new Router();

taskRouter.post('/tasks', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.body.profile) {
    return next(new HttpError(404, 'TASK ROUTER ERROR: profile not found'));
  }
  if (!request.body.title) {
    logger.log(logger.ERROR, 'TASK_ROUTER - POST - Responding with 400 code - title is required');
    return next(new HttpError(400, 'TASK title is required'));
  }
  
  return new Task(request.body).save()
    .then((task) => {
      logger.log(logger.INFO, 'TASK ROUTER - POST - responding with a 200 status code');
      response.json(task);
    })
    .catch(next);
});

taskRouter.get('/tasks/:id', bearerAuthMiddleware, (request, response, next) => {
  return Task.find({ list: request.params.id })
    .then((tasks) => {
      logger.log(logger.INFO, '200 - TASK ROUTER - GET ALL');
      return response.json(tasks);
    })
    .catch(next);
});

taskRouter.put('/task/:id', bearerAuthMiddleware, (request, response, next) => {
  console.log(request.body, 'this is the body.done');
  const options = { runValidators: true, new: true };
  return Task.findByIdAndUpdate(request.params.id, { done: request.body }, options)
    .then((task) => {
      console.log(task);
      logger.log(logger.INFO, '200 - TASK ROUTER - UPDATE');
      return response.json(task);
    })
    .catch(next);
});

export default taskRouter;
