import express from 'express';
import { appDataSource } from '../datasource.js';
import UserMovie from '../entities/user-movie.js';
const router = express.Router();

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
      comment: req.body.comment,
      liked: req.body.liked,
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
    userMovieToUpdate.comment = req.body.comment || userMovieToUpdate.comment;
    userMovieToUpdate.liked = req.body.liked || userMovieToUpdate.liked;
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
