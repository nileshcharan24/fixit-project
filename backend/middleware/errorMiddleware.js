const errorHandler = (err, req, res, next) => {
  // Determine the status code. If an error occurs but the status code is still 200 (OK),
  // it means it's a server error, so we default to 500. Otherwise, we use the existing status code.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error for the developer to see in the console
  console.error(err.stack);

  res.status(statusCode).json({
    message: err.message,
    // We only want to show the detailed error stack in development mode for security reasons
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { errorHandler };