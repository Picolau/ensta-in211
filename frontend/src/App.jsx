import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import About from './pages/About/About';
import './App.css';
import { Root } from './components/Root/Root';
import Counter from './pages/Counter/Counter';
import Login from './pages/Login/Login';
import Users from './pages/Users/Users';
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
          <Route path="counter" element={<Counter />} />
          <Route
            path="login"
            element={loggedUser ? <Navigate to="/" replace /> : <Login />}
          />
          <Route path="users" element={<Users />} />
          <Route path="about" element={<About />} />
        </Routes>
      </Root>
    </AuthContext.Provider>
  );
}

export const URL_API = 'http://localhost:8080/api';

export default App;
