import { createContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export default AuthContext;

export const useSession = () => {
  const session = sessionStorage.getItem('logged-user');
  const [loggedUser, setLoggedUser] = useState(
    session ? JSON.parse(session) : null
  );

  useEffect(() => {
    if (loggedUser != null) {
      sessionStorage.setItem('logged-user', JSON.stringify(loggedUser));
    } else {
      sessionStorage.removeItem('logged-user');
    }
  }, [loggedUser]);

  return { loggedUser, setLoggedUser };
};
