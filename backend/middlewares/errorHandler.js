export default function errorHandler(err, req, res, next) {
  // Log the error for debugging purposes (optional)
  console.error(err.stack);

  // Set default values from AppError or fallback to 500
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 1. Mongoose Validation Error
  // This happens if a required field is missing, etc.
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return res.status(400).json({ success: false, message });
  }

  // 2. Mongoose Duplicate Key Error
  // This happens when a `unique: true` field is violated (e.g., email or username)
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `An account with that ${field} already exists.`;
    return res.status(409).json({ success: false, message }); // 409 Conflict
  }

  // 3. Mongoose Cast Error (e.g., invalid ObjectId format)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return res.status(400).json({ success: false, message });
  }

  // 4. AppError or any other operational error with statusCode
  // This handles custom AppError instances
  if (err.isOperational || err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  }

  // 5. Default to a generic 500 Internal Server Error
  // This catches any other unexpected programming errors
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
  });
}