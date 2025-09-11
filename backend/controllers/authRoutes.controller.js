import * as z from "zod";
import { userModel } from "../db/userModel.js";
import bcrypt from "bcrypt";
import { asyncWrap } from "../utils/asyncWrap.js";
import jwt from "jsonwebtoken";

import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";
import dotenv from "dotenv";
dotenv.config();

// ✅ Centralized cookie configuration
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
};

const signupSchema = z
  .strictObject({
    userName: z
      .string()
      .min(5, { message: "Username must be at least 5 characters." }),

    email: z.string().email({ message: "Invalid email address." }),

    password: z
      .string()
      .min(8, { message: "Must be 8+ characters long" })
      .regex(/[a-z]/, { message: "Must contain a lowercase letter" })
      .regex(/[A-Z]/, { message: "Must contain an uppercase letter" })
      .regex(/[0-9]/, { message: "Must contain a number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Must contain a special character" }),

    confirmPassword: z.string(),
    agree: z.literal(true, {
      message: "You must agree to all terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords does not match",
    path: ["confirmPassword"],
  });

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const signupPost = asyncWrap(async (req, res, next) => {
  // 'next' is available via asyncWrap
  // 1. Zod validation (specific to this route, so we handle it here)
  const parsedBody = signupSchema.safeParse(req.body);
  if (!parsedBody.success) {
    const errors = parsedBody.error.flatten().fieldErrors;
    return res.status(400).json({ success: false, errors });
  }

  const { userName, email, password } = parsedBody.data;

  // 2. Business logic check (user already exists)
  const foundUser = await userModel.findOne({ email: email });
  if (foundUser) {
    return res.status(409).json({
      success: false,
      // Return the error in the same shape as your validation errors
      errors: {
        email: ["An account with this email already exists. Please log in."],
      },
    });
  }

  const hash = await bcrypt.hash(password, 10);

  // Any error during .create() (e.g., duplicate username if it's unique)
  // will be automatically caught by asyncWrap and sent to your central handler.
  const newUser = await userModel.create({
    email,
    userName,
    password: hash,
    authProvider: "local",
  });

  // sendWelcomeEmail(newUser);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
  });
});

export const loginPost = asyncWrap(async (req, res) => {
  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      errors: parsedBody.error.flatten().fieldErrors,
    });
  }

  const { email, password } = parsedBody.data;

  const foundUser = await userModel.findOne({ email: email });

  if (!foundUser) {
    return res.status(404).json({
      success: false,
      errors: {
        email: ["No user was found with this email."],
      },
    });
  }

  const isMatch = await bcrypt.compare(password, foundUser.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      errors: {
        password: ["The password you entered is incorrect."],
      },
    });
  }

  const accessToken = jwt.sign(
    { id: foundUser._id },
    process.env.ACCESS_KEY,
    {
      expiresIn: "7d",
    }
  );

  const refreshToken = jwt.sign(
    { id: foundUser._id },
    process.env.REFRESH_KEY,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Logged in", success: true });
});

export const refreshGet = asyncWrap(async (req, res) => {
  const user = req.user;
  const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_KEY, {
    expiresIn: "7d",
  });

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ success: true, message: "Token refreshed successfully." });
});

export const googleCallbackGet = (req, res, next, passport) => {
  (passport.authenticate(
    "google",
    { session: false },
    (err, user, info) => {
      // 1. Handle server errors
      if (err) {
        return next(err);
      }

      // 2. Handle custom "email exists" failure
      if (info && info.message === "email_exists") {
        return res.redirect(
          `${process.env.UI_URL}/auth/login?error=email_exists`
        );
      }

      // 3. Handle generic failures
      if (!user) {
        return res.redirect(
          `${process.env.UI_URL}/auth/login?error=auth_failed`
        );
      }

      // 4. Handle SUCCESS
      // The authenticated user is in the 'user' variable from our callback, NOT req.user.
      try {
        // Use user._id instead of req.user._id
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_KEY, {
          expiresIn: "7d",
        });

        // Use user._id instead of req.user._id
        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.REFRESH_KEY,
          {
            expiresIn: "15d",
          }
        );

        res.cookie("accessToken", accessToken, {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
          ...cookieOptions,
          maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${process.env.UI_URL}/app/today`);
      } catch (tokenError) {
        return next(tokenError);
      }
    }
  ))(req, res, next);
};

//twitter callback 

export const twitterCallbackGet = async (req, res) => {
  const accessToken = jwt.sign({ id: req.user._id }, process.env.ACCESS_KEY, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(
    { id: req.user._id },
    process.env.REFRESH_KEY,
    {
      expiresIn: "15d",
    }
  );

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.redirect(`${process.env.UI_URL}/app/today`);
};

export const userGet = asyncWrap((req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

export const logoutPost = asyncWrap((req, res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  
  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});
