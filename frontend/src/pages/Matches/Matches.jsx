import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { URL_API } from '../../App';
import './Matches.css';
import AuthContext from '../../hooks/useSession';
import Movie from '../../components/Movie/Movie';

function Matches() {
  const [userMatches, setUserMatches] = useState([]);
  const { loggedUser } = useContext(AuthContext);

  useEffect(() => {
    async function fetchData() {
      const results = await axios.get(
        `${URL_API}/userMovie/matches?user_id=${loggedUser.id}`
      );
      const matches = results.data;
      setUserMatches(matches);
      const newUserMatches = [];
      for (const userMatch of matches) {
        const recommendationsResult = await axios.get(
          `${URL_API}/userMovie/recommendations?user_id=${loggedUser.id}&recommender_id=${userMatch.userId}`
        );
        const recommendations = recommendationsResult.data;
        userMatch.recommendations = recommendations;
        newUserMatches.push(userMatch);
      }
      setUserMatches(newUserMatches);
    }

    fetchData();
  }, []);

  return (
    <div className="Matches-container">
      <h1>Voici your best matches!</h1>
      <div className="Matches-user">
        {userMatches.map((userMatch) => {
          return (
            <div className="Matches-user-wrapper">
              <div key={userMatch.userId} className="Matches-user-info">
                <div className="user">
                  <a href={`/home?search=$${userMatch.username}`}>
                    {userMatch.username}
                  </a>
                </div>
                <div className="score">
                  <strong>{Math.round(userMatch.score * 10000) / 100}%</strong>{' '}
                  of match
                </div>
                <div className="length">
                  <strong>{userMatch.sameMoviesRated.length}</strong> movies
                  that both of you rated!
                </div>
              </div>
              {userMatch.recommendations && (
                <>
                  <h1>
                    <strong>Recommendations</strong>
                  </h1>
                  <div className="Matches-user-recommendations">
                    {userMatch.recommendations.map((movie) => {
                      return (
                        <Movie
                          key={movie.id}
                          className={'Matches-user-movie-recommendation'}
                          movie={movie}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;
