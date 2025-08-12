import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      // Options for the Google strategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/users/auth/google/callback', // Must match the one in Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called when a user successfully authenticates with Google
      try {
        // 1. Check if user already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, call 'done' with that user
          done(null, user);
        } else {
          // 2. If user does not exist, create a new user in our database
          const newUser = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            // We can add a default role or other fields here if needed
          });
          done(null, newUser);
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// These functions are used by Passport to manage user sessions
// Although we use JWTs, they are good practice to include
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});