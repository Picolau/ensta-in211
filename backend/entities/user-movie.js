import typeorm from 'typeorm';

const UserMovie = new typeorm.EntitySchema({
  name: 'UserMovie',
  columns: {
    id: {
      primary: true,
      generated: 'uuid',
      type: String,
    },
    user_id: {
      type: String,
    },
    movie_id: {
      type: String,
    },
    rating: {
      type: Number,
    },
    comment: {
      type: String,
      nullable: true
    }
  },
});

export default UserMovie;
