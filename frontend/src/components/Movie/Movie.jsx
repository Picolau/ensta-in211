import './Movie.css';

function Movie({ movie, className }) {
  return (
    <>
      <div className={`movie-container ${className}`}>
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
