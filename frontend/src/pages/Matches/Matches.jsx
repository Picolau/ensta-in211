import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { URL_API } from '../../App';
import './Matches.css';
import AuthContext from '../../hooks/useSession';

function Matches() {
  const [userMatches, setUserMatches] = useState([]);
  const { loggedUser } = useContext(AuthContext);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    axios
      .get(`${URL_API}/userMovie/matches?user_id=${loggedUser.id}`)
      .then((results) => {
        setUserMatches(results.data);
      });
  }, []);

  return (
    <div className="Matches-container">
      <h1>Voici your best matches!</h1>
      <div className="Matches-user">
        {userMatches.map((userMatch) => {
          return (
            <div className="Matches-user-info">
              <div className="user">
                <a href={`/home?search=$${userMatch.username}`}>
                  {userMatch.username}
                </a>
              </div>
              <div className="score">
                <strong>{Math.round(userMatch.score * 10000) / 100}%</strong> of
                match
              </div>
              <div className="length">
                <strong>{userMatch.sameMoviesRated.length}</strong> movies that
                both of you rated!
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Matches;
