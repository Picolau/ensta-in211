import typeorm from 'typeorm';

const Movie = new typeorm.EntitySchema({
  name: 'Movie',
  columns: {
    id: {
      primary: true,
      type: String,
    },
    title: {
      type: String,
    },
    release_date: {
      type: String,
    },
    poster_path: {
      type: String,
    },
    overview: {
      type: String,
    },
    vote_average: {
      type: 'float',
    },
  },
});

export default Movie;
