export default function errorHandler(err, req, res, next) {
  // Log the error for debugging purposes (optional)
  console.error(err.stack);

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

  // 4. Default to a generic 500 Internal Server Error
  // This catches any other unexpected errors

 
  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
  });
 
}