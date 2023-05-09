/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Link } from 'react-router-dom';
import './Header.css';
import { useContext } from 'react';
import logoutImg from './logout.png';
import userImg from './user.png';
import AuthContext from '../../hooks/useSession';

const Header = () => {
  const { loggedUser, setLoggedUser } = useContext(AuthContext);

  return (
    <div className="Header-container">
      <div className="Welcome-user">
        <img src={userImg} alt="" />{' '}
        <div>{loggedUser ? loggedUser.username : 'Unkown'}</div>
      </div>
      <div>
        <Link className="Link" to="/home">
          Home
        </Link>
        <a className="Link" href={'/home?search=$top'}>
          Top
        </a>
        <a className="Link" href={`/home?search=$${loggedUser?.username}`}>
          Rated
        </a>
        <Link to="/matches" className="Link">
          Matches
        </Link>
      </div>
      <div
        className="Logout-user"
        onClick={() => {
          setLoggedUser(null);
        }}
      >
        <img src={logoutImg} alt="" />
      </div>
    </div>
  );
};

export default Header;
