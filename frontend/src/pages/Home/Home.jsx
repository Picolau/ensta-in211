// import logo from './logo.svg';
import { useCallback, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Element, scroller } from 'react-scroll';

import axios from 'axios';
import img from '../../../images/watchin-movie.gif';
import './Home.css';
import Movie from '../../components/Movie/Movie';

function Home() {
  const [movieName, setMovieName] = useState('');
  const [movies, setMovies] = useState([]);
  const apiKey = 'a0a7e40dc8162ed7e37aa2fc97db5654';
  const language = 'en-US';
  const [page, setPage] = useState(1);

  const getPopularMovies = useCallback(() => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=${language}&page=${page}`
      )
      .then((response) => {
        // Do something if call succeeded
        setMovies(response.data.results);
      })
      .catch((error) => {
        // Do something if call failed
        console.log(error);
      });
  }, [page]);

  const getSearchMovies = useCallback(() => {
    axios
      .get(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=${language}&query=${movieName}&page=${page}&include_adult=false`
      )
      .then((response) => {
        setMovies(response.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page, movieName]);

  const getTopRatedMovies = useCallback(() => {
    axios
      .get(
        `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}&language=${language}&page=${page}`
      )
      .then((response) => {
        setMovies(response.data.results);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [page]);

  useEffect(() => {
    if (movieName === '#top') {
      getTopRatedMovies();
    } else if (movieName === '') {
      getPopularMovies();
    } else {
      getSearchMovies();
    }
  }, [movieName, getPopularMovies, getSearchMovies, getTopRatedMovies]);

  useEffect(() => {
    setPage(1);
  }, [movieName]);

  useEffect(() => {
    scroller.scrollTo('Movies-container', {
      duration: 1200,
      delay: 200,
      smooth: true,
      offset: -70,
    });
  }, [movies]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={img} className="App-logo" alt="logo" />
        <p>EMDB - Ensta Movie Database.</p>
        <Element name="Movies-container">
          <input
            type="text"
            className="App-input-text"
            placeholder="Input the movie name"
            value={movieName}
            onChange={(e) => setMovieName(e.target.value)}
          />
        </Element>
        <div className="Small-text">
          Type to search! Try also: <strong>#top</strong>
        </div>
        <div className="Movies-container">
          {movies.length !== 0 &&
            movies.map((movie) => {
              return (
                <Movie
                  className="Movie-card"
                  key={movie.id}
                  movie={movie}
                ></Movie>
              );
            })}
          {movies.length === 0 && (
            <div className="Movie-not-found">
              No movie was found with that name!
            </div>
          )}
        </div>
        <input
          type="button"
          value="Previous"
          onClick={() => setPage(Math.max(page - 1, 1))}
        />
        Page: {page}
        <input type="button" value="Next" onClick={() => setPage(page + 1)} />
      </header>
    </div>
  );
}

export default Home;
