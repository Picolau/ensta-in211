import express from 'express';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';

const router = express.Router();

//returns all movies of the database
router.get('/', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .find({})
    .then(function (movies) {
      res.json({ movies: movies });
    });
});

router.get('/:movieId', function (req, res) {
  const movie_id = req.params.movieId;
  appDataSource
    .getRepository(Movie)
    .findOneBy({ id: movie_id })
    .then(function (movie) {
      if (movie) {
        res.json({ movie: movie });
      } else {
        res.status(404).json({ message: 'Movie not found' });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the movie' });
    });
});

//creates a movie in the database
router.post('/', async function (req, res) {
  const movieRepository = appDataSource.getRepository(Movie);
  const newMovie = movieRepository.create({
    id: req.body.id,
    title: req.body.title,
    release_date: req.body.release_date,
    poster_path: req.body.poster_path,
    overview: req.body.overview,
    vote_average: req.body.vote_average,
  });

  movieRepository
    .insert(newMovie)
    .then(function () {
      res.status(201).json(newMovie);
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `Movie with ID "${newMovie.id}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the movie' });
      }
    });
});

router.put('/:movieId', async function (req, res) {
  const movieRepository = appDataSource.getRepository(Movie);
  const movie_id = req.params.movieId;
  const movieToUpdate = await movieRepository.findOneBy({ id: movie_id });
  console.log(movieToUpdate);

  if (movieToUpdate) {
    movieToUpdate.title = req.body.title || movieToUpdate.title;
    movieToUpdate.release_date =
      req.body.release_date || movieToUpdate.release_date;
    movieToUpdate.poster_path =
      req.body.poster_path || movieToUpdate.poster_path;
    movieToUpdate.overview = req.body.overview || movieToUpdate.overview;
    movieToUpdate.vote_average =
      req.body.vote_average || movieToUpdate.vote_average;

    await movieRepository.update({ id: movie_id }, movieToUpdate);

    res.json({ movie: movieToUpdate });
  } else {
    res.status(404).json({ message: 'Movie not found' });
  }
});

//deletes a movie of the database
router.delete('/:movieId', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .delete({ id: req.params.movieId })
    .then(function () {
      res.status(200).json({ message: 'Movie successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the movie' });
    });
});

export default router;
