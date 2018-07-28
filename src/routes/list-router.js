'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import HttpError from 'http-errors';
import logger from '../lib/logger';
import bearerAuthMiddleware from '../lib/bearer-auth-middleware';
import List from '../model/list';

const jsonParser = bodyParser.json();
const listRouter = new Router();

listRouter.post('/lists', bearerAuthMiddleware, jsonParser, (request, response, next) => {
  if (!request.body.profile) {
    return next(new HttpError(404, 'LIST ROUTER ERROR: profile not found'));
  }
  if (!request.body.title) {
    logger.log(logger.ERROR, 'LIST_ROUTER - POST - Responding with 400 code - title is required');
    return next(new HttpError(400, 'LIST title is required'));
  }
  
  return new List(request.body).save()
    .then((list) => {
      logger.log(logger.INFO, 'LIST ROUTER - POST - responding with a 200 status code');
      response.json(list);
    })
    .catch(next);
});

listRouter.get('/lists/:id', bearerAuthMiddleware, (request, response, next) => {
  console.log(request.params.id);
  return List.find({ profile: request.params.id })
    .then((lists) => {
      console.log(lists, 'these are the lists');
      logger.log(logger.INFO, '200 - LIST ROUTER - GET ALL');
      return response.json(lists);
    })
    .catch(next);
});

export default listRouter;
