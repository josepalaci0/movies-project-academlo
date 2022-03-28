const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');

// Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');
const { filterObj } = require('../util/filterObj');

//folder root
dotenv.config({ path: './config.env' });

//login access
exports.loginUser = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Find user given an email and has status active
  const user = await User.findOne({
    where: { email, status: 'active' }
  });

  // Compare entered password vs hashed password
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError(400, 'Credentials are invalid'));
  }
  console.log('creating token .....');
  // Create JWT
  const token = await jwt.sign(
    { id: user.id }, // Token payload
    process.env.JWT_SECRET, // Secret key
    {
      expiresIn: process.env.JWT_EXPRES_IN
    }
  );
  console.log('token : ', token);

  res.status(200).json({
    status: 'success',
    data: { token }
  });
});

//getAllUsers
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password'] },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    where: { status: 'active' }
  });
  if (users == '') {
    return next(new AppError(204, 'No Content'));
  }
  res.status(200).json({ status: 'success', data: { users } });
});

//getOneUserById
exports.getUserById = catchAsync(async (req, res, next) => {
  const { user } = req;

  res.status(200).json({ status: 'success', data: { user } });
});

//createUser
exports.createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role
  });

  if (!newUser) {
    return next(new AppError(204, 'User creation failed'));
  }
  console.log(newUser);
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: { newUser }
  });
});

//updateUserByID
exports.updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  const data = filterObj(req.body, 'username', 'email');
  if (user == '') {
    return next(204, 'update failed');
  }
  await user.update({ ...data });

  res.status(204).json({ status: 'success', data: { user } });
});

//deleteUser  -- status change "deleted"
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  if (user == '') {
    return next(204, 'update failed');
  }
  await user.update({ status: 'deleted' });

  res.status(204).json({ status: 'success' });
});
