import passport from "passport";
import { Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../db/userModel.js"; // Adjust path as needed

import "dotenv/config";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import AppError from "../utils/appError.js";
import { asyncWrap } from "../utils/asyncWrap.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
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
const refreshTokenExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["refreshToken"];
  }
  return token;
};

const accessOptions = {
  secretOrKey: process.env.ACCESS_KEY,
  jwtFromRequest: accessTokenExtractor,
};

const refreshOptions = {
  // IMPORTANT: Use the refresh key here!
  secretOrKey: process.env.REFRESH_KEY,
  jwtFromRequest: refreshTokenExtractor,
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


