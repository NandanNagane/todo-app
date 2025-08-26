class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Call the parent constructor with the message

    this.statusCode = statusCode;
    // Set the status based on the statusCode (fail for 4xx, error for 5xx)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Differentiate our errors from other programming errors
    this.isOperational = true;

    // Capture the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;