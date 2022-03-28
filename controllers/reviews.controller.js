// utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');
const { filterObj } = require('../util/filterObj');
//models
const { Review } = require('../models/review.model');
const { User } = require('../models/user.model');
const { Movie } = require('../models/movie.model');

// getAllActors --
exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.findAll({
    where: { status: 'active' },
    attributes: { exclude: ['createdAt', 'updatedAt'] },
    include: [
      { model: User, attributes: { exclude: ['createdAt', 'updatedAt'] } },
      { model: Movie, attributes: { exclude: ['createdAt', 'updatedAt'] } }
    ]
  });

  if (!reviews) {
    return next(204, 'failed operation list reviews');
  }

  res.status(200).json({
    status: 'success',
    data: { reviews }
  });
});

// getReviewById
exports.getReviewById = async (req, res) => {
  const { Review } = req.params;

  if (!Review) {
    return next(204, 'fail operation get List Review');
  }
  const review = await Review.findOne({ where: { id } });

  res.status(200).json({
    status: 'success',
    data: { review }
  });
};
//create Reviews
exports.createNewReview = catchAsync(async (req, res, next) => {
  const { title, comment, rating, userId, movieId } = req.body;

  if (!title || !comment || !rating || !userId || !movieId) {
    return next(new AppError(400, 'invalidate operation on the review'));
  }

  const newReview = await Review.create({
    title,
    comment,
    rating,
    userId,
    movieId
  });

  res.status(201).json({
    status: 'success',
    data: { newReview }
  });
});

//update Review
exports.updateReview = catchAsync(async (req, res, next) => {
  const { title, comment, rating, userId, movieId, status } = req.body;

  const data = filterObj(
    req.body,
    'title',
    'comment',
    'rating',
    'userId',
    'movieId',
    'status'
  );

  const review = {
    title,
    comment,
    rating,
    userId,
    movieId,
    status
  };

  if (review == '') {
    return next(204, 'failed operation update review');
  }
  await review.update({ ...data });

  res.status(204).json({ status: 'success' });
});

//deleteReviewById -- status change "deleted"
exports.deleteMovie = catchAsync(async (req, res, next) => {
  const { review } = req;
  if (review == '') {
    return next(204, 'failed operation delete movie');
  }
  await review.update({ status: 'deleted' });

  res.status(204).json({ status: 'success' });
});
