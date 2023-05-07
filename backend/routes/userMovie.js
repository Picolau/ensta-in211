import express from 'express';
import axios from 'axios';
import { appDataSource } from '../datasource.js';
import UserMovie from '../entities/user-movie.js';
import Movie from '../entities/movie.js';
const router = express.Router();

//func to rank a film
router.post('/rateMovie/:userId', async (req, res) => {
  const movieRepository = appDataSource.getRepository(Movie);
  const newMovie = movieRepository.create({
    id: req.body.movieId,
    title: req.body.title,
    release_date: req.body.release_date,
    poster_path: req.body.poster_path,
    overview: req.body.overview,
    vote_average: req.body.vote_average,
  });

  //checking if there is a movie
  appDataSource
    .getRepository(Movie)
    .findOneBy({ id: req.body.movieId })
    .then(async function (movie) {
      if (movie) {
        console.log('Movie already in DB');
      } else {
        console.log('Movie not in DB, creating...');
        const movieCreated = await axios.post(
          `http://localhost:8080/api/movies`,
          newMovie
        );
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the movie' });
    });

  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const newUserMovie = userMovieRepository.create({
    user_id: req.params.userId,
    movie_id: req.body.movieId,
    rating: req.body.rating,
  });

  try {
    const UserMovieCreated = await axios.post(
      `http://localhost:8080/api/userMovie`,
      newUserMovie
    );
    res.status(201).json(UserMovieCreated.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating userMovie' });
  }
});

//returns all user-movies of tha DB
router.get('/', async function (req, res) {
  try {
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const userMovies = await userMovieRepository.find();
    res.json({ userMovies });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while retrieving user movies' });
  }
});

//returns one user-movie by id
router.get('/:userMovieId', async function (req, res) {
  const user_movie_id = req.params.userMovieId;
  try {
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const userMovie = await userMovieRepository.findOneBy({
      id: user_movie_id,
    });
    if (userMovie) {
      res.json({ userMovie });
    } else {
      res.status(404).json({ message: 'User movie not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while retrieving user movie' });
  }
});

//returns the movie-ids with given userId
router.get('/user/:userId', function (req, res) {
  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const user_id = req.params.userId;

  userMovieRepository
    .find({ where: { user_id: user_id } })
    .then(function (userMovies) {
      res.json({ userMovies: userMovies });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving userMovies' });
    });
});

//checks if a user (given in URL) liked a movie (given in body)
//returns {"hasAlike" : true/false}
router.get('/hasALike/:userId', async (req, res) => {
  const user_id = req.params.userId;
  const movie_id = req.body.movieId;

  const moviesOfAnUser = await axios.get(
    `http://localhost:8080/api/userMovie/user/${user_id}`
  );

  const hasMovieId = moviesOfAnUser.data.userMovies.some(
    (userMovie) => userMovie.movie_id === movie_id
  );

  hasMovieId ? res.json({ hasAlike: true }) : res.json({ hasALike: false });
});

//returns user-movie with given movieId
router.get('/movie/:movie_id', async (request, response) => {
  const { movie_id } = request.params;

  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const userMovies = await userMovieRepository.find({
    where: { movie_id },
  });

  return response.json(userMovies);
});

router.post('/', async function (req, res) {
  try {
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const newUserMovie = userMovieRepository.create({
      user_id: req.body.user_id,
      movie_id: req.body.movie_id,
      rating: req.body.rating,
    });
    await userMovieRepository.save(newUserMovie);
    res.status(201).json(newUserMovie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating user movie' });
  }
});

router.put('/:userMovieId', async function (req, res) {
  const user_movie_id = req.params.userMovieId;
  try {
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const userMovieToUpdate = await userMovieRepository.findOneBy({
      id: user_movie_id,
    });
    if (!userMovieToUpdate) {
      return res.status(404).json({ message: 'User movie not found' });
    }
    userMovieToUpdate.user_id = req.body.user_id || userMovieToUpdate.user_id;
    userMovieToUpdate.movie_id =
      req.body.movie_id || userMovieToUpdate.movie_id;
    userMovieToUpdate.rating = req.body.rating || userMovieToUpdate.rating;
    await userMovieRepository.save(userMovieToUpdate);
    res.json({ userMovie: userMovieToUpdate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while updating user movie' });
  }
});

router.delete('/:userMovieId', async function (req, res) {
  try {
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const deleteResult = await userMovieRepository.delete({
      id: req.params.userMovieId,
    });
    if (deleteResult.affected === 0) {
      return res.status(404).json({ message: 'User movie not found' });
    }
    res.status(200).json({ message: 'User movie successfully deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while deleting user movie' });
  }
});

export default router;
