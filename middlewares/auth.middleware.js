const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');

// Utils
const { AppError } = require('../util/appError');
const { catchAsync } = require('../util/catchAsync');

dotenv.config({ path: './config.env' });

exports.validateSession = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Invalid session'));
  }
  console.log(token);

  // Verify that token is still valid
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const user = await User.findOne({
    attributes: { exclude: ['password'] },
    where: { id: decodedToken.id, status: 'active' }
  });

  if (!user) {
    return next(new AppError(401, 'Invalid session'));
  }

  req.currentUser = user;
  console.log(req.currentUser.role);
  next();
});

exports.protectAdmin = catchAsync(async (req, res, next) => {
  if (req.currentUser.role !== 'admin') {
    return next(new AppError(403, 'Access denied'));
  }

  next();
});
