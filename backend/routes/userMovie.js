import express from 'express';
import { appDataSource } from '../datasource.js';
import UserMovie from '../entities/user-movie.js';
import User from '../entities/user.js';
import Movie from '../entities/movie.js';
const router = express.Router();

function compareScoreDescending(a, b) {
  return b.score - a.score;
}

//FAZER ROTA DE RECUPERAR COMENTARIOS PELO ID DE UM FILME!!!!!!!!!!!!!!!!!!!


router.post('/comment', async (req, res) => {
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
      if (!movie) {
        await movieRepository.insert(newMovie);
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the movie' });

      return;
    });

  const userMovieRepository = appDataSource.getRepository(UserMovie);
  let userMovie = await userMovieRepository.findOneBy({
    user_id: req.body.user.id,
    movie_id: req.body.movie.id,
  });

  try {
    if (userMovie) {
      userMovie.comment = req.body.comment;
      await userMovieRepository.update({ id: userMovie.id }, userMovie);
    } else {
      userMovie = userMovieRepository.create({
        user_id: req.body.user.id,
        movie_id: req.body.movie.id,
        comment: req.body.comment,
      });

      await userMovieRepository.save(userMovie);
    }

    res.status(201).json(userMovie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating userMovie' });
  }
})


router.get('/recommendations', async (req, res) => {
    //gets all userMovies of a user -> movies that an user liked
    const userMovieRepository = appDataSource.getRepository(UserMovie);
    const movieRepository = appDataSource.getRepository(Movie);

    const page = req.query.page || 1; //QUERYYYYYY

    //userMovies of user
    const userMoviesOfUser = await userMovieRepository.find({
      where: { user_id: req.query.user_id }, //QUERYYYYYYYYY
    });
    
    //userMovies of the recommandateur
    const recommanderUserMovies = await userMovieRepository.createQueryBuilder("userMovie")
    .where("userMovie.user_id = :recommander_id", { recommander_id: req.query.recommander_id }) //QUERYYYYYYYYY
    .andWhere("userMovie.movie_id NOT IN (:...user_movie_ids)", { user_movie_ids: userMoviesOfUser.map(userMovie => userMovie.movie_id) })
    .orderBy("rating", "DESC")
    .take(3)
    .skip((page - 1) * 3)      
    .getMany()
    
    const recommendations = []

    for(const recommanderUserMovie of recommanderUserMovies){
      
        let recommendedFilm = await movieRepository.findOne({
          where: { id: recommanderUserMovie.movie_id },
        })
        recommendedFilm.recommender_rating = recommanderUserMovie.rating
        recommendations.push(recommendedFilm);
    }
    

    return res.json(recommendations);
})


router.get('/matches', async (req, res) => {
  //gets all userMovies of a user -> movies that an user liked
  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const userRepository = appDataSource.getRepository(User);
  const movieRepository = appDataSource.getRepository(Movie);

  const userMoviesOfUser = await userMovieRepository.find({
    where: { user_id: req.query.user_id },
  });

  const usersSawSameMovie = [];
  //for each one of movies liked see people who liked the same movie
  for (const movieLiked of userMoviesOfUser) {
    const userMovie_ofPeopleSawSameMovie = await userMovieRepository
      .createQueryBuilder('userMovie')
      .where('userMovie.movie_id = :movie_id', {
        movie_id: movieLiked.movie_id,
      })
      .andWhere('userMovie.user_id != :user_id', { user_id: req.query.user_id })
      .getMany();

    //for each person that saw the same movie, add this person to a list
    //of people that saw the same movie, with the movies that each one saw and were the same
    for (const userMovie_ofPersonSawSameMovie of userMovie_ofPeopleSawSameMovie) {
      const userSawSameMovie = usersSawSameMovie.find(
        (samMovie) => samMovie.userId === userMovie_ofPersonSawSameMovie.user_id
      );

      if (userSawSameMovie) {
        userSawSameMovie.sameMoviesRated.push(userMovie_ofPersonSawSameMovie);
      } else {
        usersSawSameMovie.push({
          userId: userMovie_ofPersonSawSameMovie.user_id,
          sameMoviesRated: [userMovie_ofPersonSawSameMovie],
          score: 0,
        });
      }
    }
  }

  console.log(usersSawSameMovie);

  //calculating the score of each person -> mesure of distance:
  //for each filme => |user_rate - person_rate|/number_of_rating
  for (const userSawSameMovie of usersSawSameMovie) {
    for (const personRating of userSawSameMovie.sameMoviesRated) {
      const usersRating = userMoviesOfUser.find(
        (userMovieOfUser) => userMovieOfUser.movie_id === personRating.movie_id
      );
      userSawSameMovie.score += Math.abs(
        usersRating.rating - personRating.rating
      );
    }
    //4 is the max_score -> (4 - score)/4 gives the score in percentage
    userSawSameMovie.score =
      (4 - userSawSameMovie.score / userSawSameMovie.sameMoviesRated.length) /
      4;
  }

  usersSawSameMovie.sort(compareScoreDescending);

  for (const userSawSameMovie of usersSawSameMovie) {
    const user = await userRepository.findOneBy({
      id: userSawSameMovie.userId,
    });
    userSawSameMovie.username = user.username;
  }

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
      if (!movie) {
        await movieRepository.insert(newMovie);
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the movie' });

      return;
    });

  const userMovieRepository = appDataSource.getRepository(UserMovie);
  let userMovie = await userMovieRepository.findOneBy({
    user_id: req.body.user.id,
    movie_id: req.body.movie.id,
  });

  try {
    if (userMovie) {
      userMovie.rating = req.body.rating;
      await userMovieRepository.update({ id: userMovie.id }, userMovie);
    } else {
      userMovie = userMovieRepository.create({
        user_id: req.body.user.id,
        movie_id: req.body.movie.id,
        rating: req.body.rating,
      });

      await userMovieRepository.save(userMovie);
    }

    res.status(201).json(userMovie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating userMovie' });
  }
});

//returns one user-movie by id
router.get('/', async function (req, res) {
  const userMovieRepository = appDataSource.getRepository(UserMovie);
  const userRepository = appDataSource.getRepository(User);
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

  const movie_id = req.query.movie_id;
  console.log(user_id);

  if (!user_id && !movie_id) {
    try {
      const userMovies = await userMovieRepository.find();
      res.json({ userMovies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving user movies' });
    }
  } else if (user_id && !movie_id) {
    userMovieRepository
      .find({ where: { user_id: user_id } })
      .then(function (userMovies) {
        res.json(userMovies);
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).json({ message: 'Error while retrieving userMovies' });
      });
  } else if (user_id && movie_id) {
    try {
      const userMovie = await userMovieRepository.findOneBy({
        user_id: user_id,
        movie_id: movie_id,
      });
      if (userMovie) {
        res.json(userMovie);
      } else {
        res.status(404).json({ message: 'User movie not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving user movie' });
    }
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
      comment: req.body.comment,
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
