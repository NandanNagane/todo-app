import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js";
import dotenv from "dotenv";
import authRouter from "./routes/auth-routes.js";
import taskRouter from "./routes/task-routes.js";
import connectDB from "./utils/conntect-to-DB.js";

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://todo-app-nandan.vercel.app"],
    credentials: true,
  })
);


// Standard middleware
app.use(express.json());
app.use(cookieParser());



// Passport middleware
app.use(passport.initialize());


// Connect to MongoDB (for serverless)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

// Basic route for testing

app.get("/", (req, res) => {
  res.json({ message: "Backend is running on Vercel!" });
});

// Error handler
app.use(errorHandler);

// For local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
