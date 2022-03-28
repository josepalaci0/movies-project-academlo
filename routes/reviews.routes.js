const express = require('express');

// Controllers
const {
  getAllReviews,
  getReviewById,
  createNewReview,
  updateReview,
  deleteMovie
} = require('../controllers/reviews.controller');

// Middlewares
const {
  validateSession,
  protectAdmin
} = require('../middlewares/auth.middleware');

const { reviewExists } = require('../middlewares/reviews.middleware');

const router = express.Router();

//init routes protected
router.use(validateSession);

router
  .route('/')
  .get(protectAdmin, getAllReviews)
  .post(protectAdmin, createNewReview);

router
  .use('/:id', reviewExists)
  .route('/:id')
  .get(getReviewById)
  .patch(protectAdmin, updateReview)
  .delete(protectAdmin, deleteMovie);

module.exports = { reviewsRouter: router };
