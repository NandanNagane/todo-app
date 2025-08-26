import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";
import { userModel } from "../db.js"; // Adjust path as needed

import "dotenv/config";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import AppError from "../utils/appError.js";
import { asyncWrap } from "../utils/asyncWrap.js";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;

const SERVER_URL = process.env.SERVER_URL;

// --- Strategy 1: For Verifying the ACCESS Token ---

// Extractor for the access token
const accessTokenExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.accessToken;
  }

  return token;
};

const accessOptions = {
  secretOrKey: process.env.ACCESS_KEY,
  jwtFromRequest: accessTokenExtractor,
};

// We name this strategy 'jwt-access'
passport.use(
  "jwt-access",
  new JwtStrategy(accessOptions, async (jwt_payload, done) => {
    try {
      // The 'sub' (subject) of the payload should be the user's ID
      const user = await userModel
        .findById(jwt_payload.id)
        .select("-password -__v -createdAt -updatedAt");
      if (user) {
        return done(null, user); // Success, user is found
      }
      return done(null, false); // No user found
    } catch (err) {
      return done(err, false);
    }
  })
);

// --- Strategy 2: For Verifying the REFRESH Token ---

// Extractor for the refresh token
const refreshTokenExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["refreshToken"];
  }
  return token;
};

const refreshOptions = {
  // IMPORTANT: Use the refresh key here!
  secretOrKey: process.env.REFRESH_KEY,
  jwtFromRequest: refreshTokenExtractor,
};

// We name this strategy 'jwt-refresh'
passport.use(
  "jwt-refresh",
  new JwtStrategy(refreshOptions, async (jwt_payload, done) => {
    try {
      // The logic is identical: find the user based on the token
      const user = await userModel
        .findById(jwt_payload.id)
        .select("-password -__v -createdAt -updatedAt");
      if (user) {
        return done(null, user); // Success, user is found
      }
      return done(null, false); // No user found
    } catch (err) {
      console.log(err);
      return done(err, false);
    }
  })
);

//google startegy

// passport.use(
//   "google",
//   new GoogleStrategy(
//     {
//       clientID: GOOGLE_CLIENT_ID,
//       clientSecret: GOOGLE_CLIENT_SECRET,
//       callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
//     },
//     async function (accessToken, refreshToken, profile, done) {
//       try {
//         // The 'created' boolean tells us if this is a new user
//         const user = await userModel.findOrCreate(
//           {
//             googleId: profile.id,
//           },
//           {
//             googleId: profile.id,
//             userName: profile.displayName,
//             email: profile.emails[0].value,
//             profilePictureUrl: profile.photos[0].value,
//             authProvider: "google",
//           }
//         );

//         // --- THIS IS THE KEY LOGIC ---
//         // If the user was just created (it's their first time), send the email.
//         if (user.created) {
//           await sendWelcomeEmail(user.doc);
//         }

//         return done(null, user.doc);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      const userEmail = profile.emails[0].value;
      const googleId = profile.id;
      try {
        const user = await userModel.findOne({ googleId: googleId });
        if (user) {
          // User found with Google ID, this is a returning social user
          return done(null, user);
        }

        const existingUser = await userModel.findOne({ email: userEmail });
        if (existingUser) {
          // The email exists, but not linked to a Google account.
          // This is a predictable authentication failure, not a server error.
          return done(null, false, { message: "email_exists" });
        }
        const newUser = await userModel.create({
          googleId: googleId,
          userName: profile.displayName,
          email: userEmail,
          profilePictureUrl: profile.photos[0].value,
          authProvider: "google",
        });
        return done(null, newUser);
      } catch (error) {
        console.log(error);
        
        return done(error, null);
      }
    }
  )
);

// twitter startegy

passport.use(
  "twitter",
  new TwitterStrategy(
    {
      clientType: "confidential", //depends on your Twitter app settings, valid values are `confidential` or `public`
      clientID: TWITTER_CLIENT_ID,
      clientSecret: TWITTER_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/twitter/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Safely get the photo URL from the profile object
        const photoUrl =
          profile.photos && profile.photos[0] ? profile.photos[0].value : null;

        // Pro Tip: Twitter's default image is small. Get a larger one by removing '_normal'.
        const fullSizePhotoUrl = photoUrl
          ? photoUrl.replace("_normal", "")
          : null;

        // 2. Use the URL when finding or creating the user
        const user = await userModel.findOrCreate(
          {
            twitterId: profile.id,
          },
          {
            twitterId: profile.id,
            userName: profile.displayName,
            // If email is not available, you need a strategy (e.g., generate a placeholder)
            email: profile.emails
              ? profile.emails[0].value
              : `${profile.username}@twitter.placeholder.com`,
            profilePictureUrl: fullSizePhotoUrl, // <-- SAVE THE URL HERE
            authProvider: "twitter",
            isEmailPaceholder: profile.emails ? false : true,
          }
        );

        return done(null, user.doc);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

//facebook startegy
// passport.use('facebook',new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));
