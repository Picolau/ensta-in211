// import logo from './logo.svg';
import { useCallback, useContext, useEffect, useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Element, scroller } from 'react-scroll';

import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import img from '../../../images/watchin-movie.gif';
import './Home.css';
import Movie from '../../components/Movie/Movie';
import { URL_API } from '../../App';
import AuthContext from '../../hooks/useSession';

function Home() {
  const { loggedUser } = useContext(AuthContext);
  const [queryParameters] = useSearchParams();
  const [movieName, setMovieName] = useState('');
  const [movies, setMovies] = useState([]);
  const apiKey = 'a0a7e40dc8162ed7e37aa2fc97db5654';
  const language = 'en-US';
  const [page, setPage] = useState(1);

  const getPopularMovies = () => {
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
  };

  const getSearchMovies = () => {
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
  };

  const getTopRatedMovies = () => {
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
  };

  const getRatedMovies = (username) => {
    axios
      .get(`${URL_API}/movies?username=${username}&page=${page}`)
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const search = (searchStr) => {
    if (searchStr === '' || !searchStr) {
      getPopularMovies();
    } else if (searchStr === '$top') {
      getTopRatedMovies();
    } else if (searchStr.startsWith('$')) {
      getRatedMovies(searchStr.substring(1));
    } else {
      getSearchMovies();
    }
  };

  useEffect(() => {
    search(movieName);
  }, [page]);

  useEffect(() => {
    const searchParam = queryParameters.get('search');
    if (searchParam) {
      search(`${searchParam}`);
      setMovieName(searchParam);
    }
  }, []);

  useEffect(() => {
    if (movies.length !== 0) {
      scroller.scrollTo('Movies-container', {
        duration: 1200,
        delay: 200,
        smooth: true,
        offset: -70,
      });
    }
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (page !== 1) {
                  setPage(1);
                } else {
                  search(movieName);
                }
              }
            }}
          />
        </Element>
        <div className="Small-text">
          Press <strong>enter</strong> to search!
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
            <div className="Movie-not-found">No movie was found!</div>
          )}
        </div>
        <div className="Page-control-wrapper">
          <input
            type="button"
            value="Previous"
            onClick={() => setPage(Math.max(page - 1, 1))}
          />
          Page: {page}
          <input type="button" value="Next" onClick={() => setPage(page + 1)} />
        </div>
      </header>
    </div>
  );
}

export default Home;
