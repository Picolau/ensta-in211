import express from 'express';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';

const router = express.Router();

router.get('/', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .find({})
    .then(function (movies) {
      res.json({ movies: movies });
    });
});

router.post('/new', async function (req, res) {
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
    .then(function (newDocument) {
      res.status(201).json(newDocument);
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

// router.delete('/:userId', function (req, res) {
//   appDataSource
//     .getRepository(User)
//     .delete({ id: req.params.userId })
//     .then(function () {
//       res.status(204).json({ message: 'User successfully deleted' });
//     })
//     .catch(function () {
//       res.status(500).json({ message: 'Error while deleting the user' });
//     });
// });

export default router;
