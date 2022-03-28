const express = require('express');
const cors = require('cors');
// Controllers
const { globalErrorHandler } = require('./controllers/error.controller');

// Routers
const { usersRouter } = require('./routes/users.routes');
const { actorsRouter } = require('./routes/actors.routes');
const { moviesRouter } = require('./routes/movies.routes');
const { reviewsRouter } = require('./routes/reviews.routes');

const app = express();

//Enable Cors
app.use(cors());

// Enable incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoints
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/actors', actorsRouter);
app.use('/api/v1/movies', moviesRouter);
app.use('/api/v1/reviews', reviewsRouter);

app.use(globalErrorHandler);

module.exports = { app };
