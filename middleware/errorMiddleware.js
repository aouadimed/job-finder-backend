const ApiError = require("../utils/apiError");

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") err = handleJwtInvalidSignature();
    if (err.name === "TokenExpiredError") err = handleJwtExpiredToken();

    sendErrorForProd(err, res);
  }
};

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid Token please login again !", 401);

const handleJwtExpiredToken = () =>
  new ApiError("Expired Token please login again !", 401);

const sendErrorForDev = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });

const sendErrorForProd = (err, res) =>
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

module.exports = globalError;