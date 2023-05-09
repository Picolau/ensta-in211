/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */

import { useContext, useEffect, useState } from 'react';
import './MovieInfo.css';
import axios from 'axios';
import { URL_API } from '../../../App';
import AuthContext from '../../../hooks/useSession';
import userImg from './user.png';

function MovieInfo({ movie, onClose }) {
  const { loggedUser } = useContext(AuthContext);
  const [comment, setComment] = useState('');
  const [userComments, setUserComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [mouseRating, setMouseRating] = useState(0);

  const fetchRating = async () => {
    try {
      const response = await axios.get(
        `${URL_API}/userMovie?user_id=${loggedUser.id}&movie_id=${movie.id}`
      );

      setRating(response.data.rating);
    } catch (e) {
      setRating(0);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `${URL_API}/userMovie/comment?movie_id=${movie.id}`
      );

      setUserComments(response.data);
    } catch (e) {
      setUserComments([]);
    }
  };

  useEffect(() => {
    fetchRating();
    fetchComments();
  }, []);

  const rate = async (val) => {
    try {
      await axios.post(`${URL_API}/userMovie/rateMovie`, {
        movie: movie,
        user: loggedUser,
        rating: val,
      });
      setRating(val);
      setIsRating(false);
    } catch (e) {
      console.error(e);
    }
  };

  const mouseRate = (val) => {
    setIsRating(true);
    setMouseRating(val);
  };

  const handleClickModal = (event) => {
    if (event.target.className === 'movie-info-wrapper') {
      onClose();
    }
  };

  const sendComment = async () => {
    try {
      await axios.post(`${URL_API}/userMovie/comment`, {
        movie: movie,
        user: loggedUser,
        comment: comment,
      });

      const userComment = {
        comment: comment,
        user: {
          username: loggedUser.username,
        },
      };

      setComment('');
      setUserComments([userComment, ...userComments]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="movie-info-wrapper" onClick={handleClickModal}>
        <div className="movie-info-modal">
          <div className="movie-info-content">
            {movie.poster_path && (
              <img
                className="movie-info-poster-image"
                src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                alt=""
              />
            )}
            {!movie.poster_path && (
              <div className="movie-noposter-image">No image available</div>
            )}
            <div className="movie-info-text">
              <div className="movie-info-title">{movie.title}</div>
              <div className="movie-info-release-date">
                {movie.release_date}
              </div>
              <div className="movie-info-vote-avg">{movie.vote_average}</div>
              <div className="movie-info-overview">{movie.overview}</div>
              <div className="movie-info-rating-wrapper">
                <div className="movie-info-rating-text">Rate this movie!</div>
                <div className="movie-info-rating"></div>
                <div
                  onMouseLeave={() => setIsRating(false)}
                  className="movie-info-rating"
                >
                  {[1, 2, 3, 4, 5].map((e) => {
                    let color = 'white';

                    if (isRating) {
                      if (mouseRating >= e) {
                        color = 'grey';
                      }
                    } else {
                      if (rating >= e) {
                        color = 'red';
                      }
                    }

                    return (
                      <span
                        key={e}
                        onMouseEnter={() => mouseRate(e)}
                        onClick={() => rate(e)}
                        style={{ color: color }}
                      >
                        &#9829;
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            <div onClick={onClose} className="movie-info-close">
              X
            </div>
          </div>
          <div className="Comment-section">
            <input
              type="text"
              className="Comment-input-text"
              placeholder="Make a comment about this movie"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendComment();
                }
              }}
            />
            <div className="Small-text">
              Press <strong>enter</strong> to send!
            </div>
            <div className="User-comments">
              {userComments.map((userComment, idx) => {
                return (
                  <div className="User-comment-wrapper" key={idx}>
                    <div className="user">
                      <img src={userImg} alt="" />
                      {userComment.user.username}
                    </div>
                    <div className="comment">{userComment.comment}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MovieInfo;
