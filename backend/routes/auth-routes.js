import express from "express";
const authRouter = express.Router();
import { asyncWrap } from "../utils/asyncWrap.js";
import passport from "passport";
import dotenv from "dotenv";
import refreshMiddleware from "../middlewares/refreshTokenMiddleware.js";
import { 
  signupPost, 
  loginPost, 
  refreshGet, 
  googleCallbackGet, 
  userGet, 
  logoutPost 
} from '../controllers/authRoutes.controller.js';
import { accessTokenMiddlware } from "../middlewares/accessTokenMiddlware.js";

dotenv.config();

//signup endpoint

authRouter.post("/signup", signupPost);

//login endpoint
authRouter.post("/login", loginPost);

//refresh_token endpoint
authRouter.get("/refresh", refreshMiddleware, refreshGet);

//google auth
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//google  callback
authRouter.get("/google/callback", (req, res, next) => {
  googleCallbackGet(req, res, next, passport);
});

// get user
authRouter.get(
  "/user",
  accessTokenMiddlware,
  userGet
);

//logout
authRouter.post("/logout", logoutPost);

export default authRouter;
