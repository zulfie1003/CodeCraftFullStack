// utils/response.js

export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data
  });
};

export const sendError = (res, message = 'Error occurred', statusCode = 400, data = null) => {
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(data && { data })
  });
};