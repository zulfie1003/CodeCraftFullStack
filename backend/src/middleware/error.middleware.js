const errorMiddleware = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    return res.status(400).json({
      success: false,
      status: 400,
      message: `Validation Error: ${message}`,
      ...(process.env.NODE_ENV === 'development' && { details: err.errors })
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    return res.status(400).json({
      success: false,
      status: 400,
      message
    });
  }

  console.error(`[${new Date().toISOString()}] ❌ Error:`, err);

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack, fullError: err })
  });
};

export default errorMiddleware;
