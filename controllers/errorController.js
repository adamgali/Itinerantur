const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// DEVELOPMENT ERROR HANDLING
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // RENDERED WEBSITE
  return res.status(err.statusCode).render('error', {
    title: '404',
    msg:
      'Looks like you’ve taken a wrong turn. Don’t worry, it’s only a minor  setback. You can easily find your way off this error page.',
    code: err.statusCode,
  });
};

// PRODUCTION ERROR HANDLING
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // OPARATIONAL, TRUSTED ERROR: SEND MESSAGE TO CLIENT.
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // PROGRAMMING OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR DETAILS.
    console.error('ERROR 💥', err);

    // SEND GENERIC MESSAGE.
    return res.status(500).json({
      status: 'error',
      msg:
        'Looks like you’ve taken a wrong turn. Don’t worry, it’s only a minor  setback. You can easily find your way off this error page.',
    });
  }
  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: '404',
      msg:
        'Looks like you’ve taken a wrong turn. Don’t worry, it’s only a minor  setback. You can easily find your way off this error page.',
      code: err.statusCode,
    });
  }
  // PROGRAMMING OR OTHER UNKNOWN ERROR: DON'T LEAK ERROR DETAILS.
  console.error('ERROR 💥', err);
  // SEND GENERIC MESSAGE.
  return res.status(err.statusCode).render('error', {
    title: '404',
    msg: err.message,
    code: err.statusCode,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
