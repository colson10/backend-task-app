const GoogleStrategy = require('passport-google-oauth')
  .OAuth2Strategy;

export default function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: '/oauth/google/callback',
  }, (token, refreshToken, profile, done) => {
    return done(null, {
      profile,
      token,
    });
  }));
}
