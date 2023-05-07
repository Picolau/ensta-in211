import express from 'express';
import { appDataSource } from '../datasource.js';
import UserMovie from '../entities/user-movie.js';
import Movie from '../entities/movie.js';
import User from '../entities/user.js';
const router = express.Router();

function compareScoreDescending(a, b) {
  return b.score - a.score;
}

router.get('/matches/:userId', async (req, res) => {

  //gets all userMovies of a user -> movies that an user liked
  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const userMoviesOfUser = await userMovieRepository.find({ where: { user_id: req.params.userId } })
  
  let usersSawSameMovie = []
  //for each one of movies liked see people who liked the same movie
  for(const movieLiked of userMoviesOfUser){
    const userMovie_ofPeopleSawSameMovie = await userMovieRepository.createQueryBuilder('userMovie')
    .where('userMovie.movie_id = :movie_id', { movie_id: movieLiked.movie_id })
    .andWhere('userMovie.user_id != :user_id', { user_id: req.params.userId })
    .getMany();

    //for each person that saw the same movie, add this person to a list 
    //of people that saw the same movie, with the movies that each one saw and were the same

    for(const userMovie_ofPersonSawSameMovie of userMovie_ofPeopleSawSameMovie){

      let userSawSameMovie = usersSawSameMovie.find(samMovie => samMovie.userId === userMovie_ofPersonSawSameMovie.user_id);

      if (userSawSameMovie) {
        userSawSameMovie.sameMoviesRated.push(userMovie_ofPersonSawSameMovie)
      } else {
        usersSawSameMovie.push({
          "userId": userMovie_ofPersonSawSameMovie.user_id,
          "sameMoviesRated" : [userMovie_ofPersonSawSameMovie],
          "score": 0
        })
      }
    }
  }

  //calculating the score of each person -> mesure of distance:
  //for each filme => |user_rate - person_rate|/number_of_rating 
  for(const userSawSameMovie of usersSawSameMovie){
    for(const personRating of userSawSameMovie.sameMoviesRated){
      let usersRating = userMoviesOfUser.find(userMovieOfUser => userMovieOfUser.movie_id === personRating.movie_id)
      userSawSameMovie.score += Math.abs(usersRating.rating - personRating.rating)
    }
    //4 is the max_score -> (4 - score)/4 gives the score in percentage  
    userSawSameMovie.score = (4 - (userSawSameMovie.score / userSawSameMovie.sameMoviesRated.length))/4 
  }

  usersSawSameMovie.sort(compareScoreDescending);

  return res.json(usersSawSameMovie);
});


//func to rank a film
router.post('/rateMovie', async (req, res) => {
  const movieRepository = appDataSource.getRepository(Movie);
  const newMovie = movieRepository.create({
    id: req.body.movie.id,
    title: req.body.movie.title,
    release_date: req.body.movie.release_date,
    poster_path: req.body.movie.poster_path,
    overview: req.body.movie.overview,
    vote_average: req.body.movie.vote_average,
  });

  //checking if there is a movie
  appDataSource
    .getRepository(Movie)
    .findOneBy({ id: req.body.movie.id })
    .then(async function (movie) {
      if (movie) {
      } else {
        await movieRepository.insert(newMovie);
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the movie' });

      return;
    });

  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const newUserMovie = userMovieRepository.create({
    user_id: req.body.user.id,
    movie_id: req.body.movie.id,
    rating: req.body.rating,
  });

  try {
    await userMovieRepository.save(newUserMovie);
    res.status(201).json(newUserMovie);
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
