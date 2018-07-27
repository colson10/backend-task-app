'use strict';

import superagent from 'superagent';
import { Router } from 'express';
import Account from '../model/account';
import Profile from '../model/profile';

const GOOGLE_OAUTH_URL = 'https://www.googleapis.com/oauth2/v4/token';
const OPEN_ID_URL = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

const googleRouter = new Router();

const createProfile = (user) => {
  return new Profile({
    username: user.username,
    email: user.email,
    account: user.id,
  }).save();
};

googleRouter.get('/oauth/google', (request, response) => {
  const user = {};
  console.log('__STEP 3.1 - RECEIVING CODE__');
  if (!request.query.code) {
    response.redirect(process.env.CLIENT_URL);
  } else {
    console.log('__THIS_IS_THE_CODE__', request.query.code);

    console.log('__STEP 3.2 - SENDING THE CODE BACK__');

    return superagent.post(GOOGLE_OAUTH_URL)
      .type('form')
      .send({
        code: request.query.code,
        grant_type: 'authorization_code',
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_SECRET,
        redirect_uri: `${process.env.API_URL}/oauth/google`,
      })
      .then((tokenResponse) => {
        console.log('__STEP 3.3 - ACCESS TOKEN__', tokenResponse.body.access_token, 'end of token response');

        if (!tokenResponse.body.access_token) {
          response.redirect(process.env.CLIENT_URL);
        }
        const accessToken = tokenResponse.body.access_token;
        return superagent.get(OPEN_ID_URL)
          .set('Authorization', `Bearer ${accessToken}`);
      })
      .then((openIDResponse) => {
        console.log('__STEP 4 - OPEN ID__');
        user.username = openIDResponse.body.name;
        user.email = openIDResponse.body.email;
        return Account.findOne({ email: user.email })
          .then((account) => {
            if (!account) {
              return Account.create(user.email, user.username)
                .then((newAccount) => {
                  user.id = newAccount._id;
                  return newAccount.pCreateLoginToken()
                    .then((token) => {
                      return createProfile(user)
                        .then(() => {
                          response
                            .cookie('TASKsubTASK', token)
                            .redirect(process.env.CLIENT_URL);
                        });
                    });
                });
            } 
            return account.pCreateLoginToken()
              .then((token) => {
                return response
                  .cookie('TASKsubTASK', token)
                  .redirect(process.env.CLIENT_URL);
              });
          });
      })
      .catch(() => {
        console.log('error');
        response.redirect(`${process.env.CLIENT_URL}?erro=oauth`);
      });
  }
  return undefined;
});

export default googleRouter;