import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { URL_API } from '../../App';
import './Matches.css';
import AuthContext from '../../hooks/useSession';

function Matches() {
  const { loggedUser } = useContext(AuthContext);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    axios
      .get(`${URL_API}/userMovie/matches?user_id=${loggedUser.id}`)
      .then((results) => {
        console.log(results.data);
      });
  }, []);

  return (
    <div className="Counter-container">
      <h1>This is a counter example</h1>
      <div>Counter value : {counter}</div>
      <button onClick={() => setCounter(counter + 1)}>Increment counter</button>
    </div>
  );
}

export default Matches;
