// middleware/auth.middleware.js

import passport from "passport";

/**
 * A custom middleware to authenticate JWT access tokens.
 * It provides detailed JSON error responses for the frontend.
 */
export const accessTokenMiddlware = (req, res, next) => {
  // We use passport.authenticate with a custom callback to handle the result.
  passport.authenticate("jwt-access", { session: false }, (err, user, info) => {
    // 1. Handle Server Errors
    // If an unexpected error occurred during the process (e.g., database error).
    if (err) {
      return next(err); // Pass the error to the Express error handler.
    }

    // 2. Handle JWT-specific Errors (like expiration)
    // The 'info' object contains details about why authentication failed.
    if (info) {
      // If the error is specifically 'TokenExpiredError', send a custom response.
      if (info.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "TokenExpired",
          message: "Access token has expired. Please refresh.",
        });
      }
      // For any other JWT error (e.g., malformed token), send a generic invalid token error.
      return res.status(401).json({
        success: false,
        error: "InvalidToken",
        message: "Your access token is invalid.",
      });
    }

    // 3. Handle 'No User Found' Case
    // If the token is valid but the user doesn't exist in the DB.
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "You are not authorized to access this resource.",
      });
    }

    // 4. Handle Success
    // If everything is fine, attach the user to the request and continue.
    req.user = user;
    return next();
    
  })(req, res, next); // This immediately invokes the middleware function.
};