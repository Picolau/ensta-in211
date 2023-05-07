/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { useState } from 'react';
import './Movie.css';
import MovieInfo from './MovieInfo/MovieInfo';

function Movie({ movie, className }) {
  const [isShowingInfo, setIsShowingInfo] = useState(false);

  return (
    <>
      {isShowingInfo && (
        <MovieInfo movie={movie} onClose={() => setIsShowingInfo(false)} />
      )}
      <div
        onClick={() => setIsShowingInfo(true)}
        className={`movie-container ${className}`}
      >
        {movie.poster_path && (
          <img
            className="movie-poster-image"
            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
            alt=""
          />
        )}
        {!movie.poster_path && (
          <div className="movie-noposter-image">No image available</div>
        )}

        <div className="movie-title">{movie.title}</div>
        <div className="movie-release-date">{movie.release_date}</div>
      </div>
    </>
  );
}

export default Movie;
