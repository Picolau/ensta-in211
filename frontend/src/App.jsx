import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Matches from './pages/Matches/Matches';
import './App.css';
import { Root } from './components/Root/Root';
import Login from './pages/Login/Login';
import AuthContext, { useSession } from './hooks/useSession';

function App() {
  const { loggedUser, setLoggedUser } = useSession();

  return (
    <AuthContext.Provider value={{ loggedUser, setLoggedUser }}>
      <Root>
        <Routes>
          <Route
            path="/"
            element={loggedUser ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/home"
            element={loggedUser ? <Home /> : <Navigate to="/login" replace />}
          />
          <Route
            path="login"
            element={loggedUser ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="matches"
            element={
              loggedUser ? <Matches /> : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </Root>
    </AuthContext.Provider>
  );
}

export const URL_API = 'http://localhost:8080/api';

export default App;
