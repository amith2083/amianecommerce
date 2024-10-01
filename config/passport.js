import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
import generateToken from "../utils/generateToken.js";
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);

// Configure the Google strategy for use by Passport.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:7001/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) {
          const token = generateToken(user._id); // Generate JWT token
          return done(null, { user, token });
        } else {
          // Check if a user with the same email exists (signed up via email/password)
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists, don't create a new user, redirect to login
            return done(null, false, {
              message: "This email is already registered. Please log in.",
            });
          } else {
            user = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
            });
            await user.save();
            const token = generateToken(user._id); // Generate JWT token
            return done(null, { user, token });
          }
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
// passport.serializeUser((data, done) =>{
//     done(null, data);
//   });

//   passport.deserializeUser((data, done)=> {
//     User.findById(data.user._id)
//     .then(user=>{
//         done(null, {token: data.token });
//     })

//   .catch(err => done(err, null))
// });

export default passport;
