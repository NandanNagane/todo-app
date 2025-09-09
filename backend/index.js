import express from "express";
import cors from "cors";

import mongoose from "mongoose";
import session from "express-session";

import errorHandler from "./middlewares/errorHandler.js";


import cookieParser from "cookie-parser";

import passport from "passport";
import "./config/passport.js";

import dotenv from "dotenv";
import authRouter from "./routes/auth-routes.js";
import taskRouter from "./routes/task-routes.js";
dotenv.config();

// --- Standard Middleware ---
const app = express();
app.use(
  cors({
    origin: `${process.env.UI_URL}`,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    // This is the secret used to sign the session ID cookie.
    // It should be a long, random string. Store this in your .env file for security.
    secret: process.env.SESSION_SECRET,

    // resave: Forces the session to be saved back to the session store,
    // even if the session was never modified during the request.
    // 'false' is generally recommended.
    resave: false,

    // saveUninitialized: Forces a session that is "uninitialized" to be saved to the store.
    // A session is uninitialized when it is new but not modified.
    // 'false' is good for login sessions, reducing server storage.
    saveUninitialized: false,

    // Optional: configure a cookie, e.g., for security in production
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS. Set to true in production.
      maxAge: 1000 * 60 * 5, // 5 minutes
    },
  })
);

// --- Passport Middleware ---
app.use(passport.initialize());
app.use(passport.session());

// --- Routes ---
app.use("/auth",authRouter);
app.use("/task",taskRouter);

// error handler
app.use(errorHandler);

async function main() {
  await mongoose.connect(process.env.DB_URL);
  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
}

main();
