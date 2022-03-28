const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { validationResult } = require('express-validator');

// Models
const { Movie } = require('../models/movie.model');
const { Actor } = require('../models/actor.model');
const { ActorInMovie } = require('../models/actorInMovie.model');

// Utils
const { catchAsync } = require('../util/catchAsync');
const { AppError } = require('../util/appError');
const { filterObj } = require('../util/filterObj');
const { storage } = require('../util/firebase');

//getAllMovies
exports.getAllMovies = catchAsync(async (req, res, next) => {
  const movies = await Movie.findAll({
    where: { status: 'active' },
    include: [{ model: Actor }]
  });

  if (!movies) {
    return next(204, 'failed operation list movies');
  }

  res.status(200).json({
    status: 'success',
    data: { movies }
  });
});

//getOneMovieById
exports.getMovieById = catchAsync(async (req, res, next) => {
  const { movie } = req;

  if (!movie) {
    next(204, 'failed operation list one movie');
  }
  res.status(200).json({
    status: 'success',
    data: { movie }
  });
});

//createMovies
exports.createMovie = catchAsync(async (req, res, next) => {
  const { title, description, duration, rating, genre, actors } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMsg = errors
      .array()
      .map(({ msg }) => msg)
      .join('. ');
    return next(new AppError(400, errorMsg));
  }

  // Upload img to firebase
  const fileExtension = req.file.originalname.split('.')[1];

  const imgRef = ref(
    storage,
    `imgs/movies/${title}-${Date.now()}.${fileExtension}`
  );

  const imgUploaded = await uploadBytes(imgRef, req.file.buffer);

  const newMovie = await Movie.create({
    title,
    description,
    duration,
    img: imgUploaded.metadata.fullPath,
    rating,
    genre
  });

  const actorsInMoviesPromises = actors.map(async (actorId) => {
    // Assign actors to newly created movie
    return await ActorInMovie.create({ actorId, movieId: newMovie.id });
  });

  await Promise.all(actorsInMoviesPromises);

  res.status(200).json({
    status: 'success',
    data: { newMovie }
  });
});

//updateMovieById
exports.updateMovie = catchAsync(async (req, res, next) => {
  const { movie } = req;

  const data = filterObj(
    req.body,
    'title',
    'description',
    'duration',
    'rating',
    'genre'
  );

  if (!movie) {
    return next(204, 'failed operation update movie');
  }
  await movie.update({ ...data });

  res.status(204).json({ status: 'success' });
});

//deleteMovieById -- status change "deleted"
exports.deleteMovie = catchAsync(async (req, res, next) => {
  const { movie } = req;
  if (!movie) {
    return next(204, 'failed operation delete movie');
  }
  await movie.update({ status: 'deleted' });

  res.status(204).json({ status: 'success' });
});
