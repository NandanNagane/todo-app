import passport from "passport"; 

export default async function refreshMiddleware(req, res, next){

  (passport.authenticate("jwt-refresh", { session: false }, (err, user, info) => {
    // Handle any unexpected errors first
    if (err) {
     
      return next(err);
    }
    
    // This is the key part: Passport puts expiration info in the `info` object
    if (info && info.name === "TokenExpiredError") {

      // The refresh token itself has expired. The session is over.
      console.log("Refresh token expired. Clearing cookies and logging out.");
      
      // Clear the invalid cookies from the user's browser
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      
      // Send a specific response that the frontend can identify
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please log in again." 
      });
    }
    
    // Handle other authentication failures (e.g., token was tampered with)
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: Invalid token." 
      });
    }

    
    // --- SUCCESS ---
    // If we get here, the refresh token was valid. Issue a new access token.
     
    req.user=user
    next();
      

  }))(req,res,next)

}
