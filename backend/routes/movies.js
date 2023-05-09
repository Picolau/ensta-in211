import express from 'express';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';
import User from '../entities/user.js';
import UserMovie from '../entities/user-movie.js';

const router = express.Router();

//returns all movies of the database
router.get('/', async function (req, res) {
  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const userRepository = appDataSource.getRepository(User);
  const movieRepository = appDataSource.getRepository(Movie);
  const page = req.query.page || 1;
  let user_id = req.query.user_id;
  if (!user_id) {
    const username = req.query.username;

    if (username) {
      try {
        const user = await userRepository.findOneBy({ username: username });
        user_id = user.id;
      } catch (error) {
        console.error(error);
        res.status(404).json({ message: 'User not found' });
      }
    }
  }

  if (!user_id) {
    movieRepository
      .find({})
      .then(function (movies) {
        res.json({ movies: movies });
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    const userMovies = await userMovieRepository
      .createQueryBuilder('user_movie')
      .where({ user_id: user_id })
      .take(10)
      .skip((page - 1) * 10)
      .getMany();
    const movies = [];
    for (const userMovie of userMovies) {
      const movie = await movieRepository.findOneBy({ id: userMovie.movie_id });
      console.log(movie);
      movie['rating'] = userMovie.rating;
      movies.push(movie);
    }

    res.json(movies);
  }
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
