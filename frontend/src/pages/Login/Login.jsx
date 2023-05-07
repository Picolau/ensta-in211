// eslint-disable-next-line import/no-extraneous-dependencies
import { useContext, useState } from 'react';

import axios from 'axios';
import img from '../../../images/watchin-movie.gif';
import './Login.css';
import { URL_API } from '../../App';
import AuthContext from '../../hooks/useSession';

const STEP_EMAIL = 'email';
const STEP_NAME = 'name';
const STEP_PASSWORD = 'password';
const ACTION_LOGIN = 'login';
const ACTION_SIGNUP = 'signup';

function Login() {
  const { setLoggedUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(STEP_EMAIL);
  const [userAction, setUserAction] = useState(ACTION_LOGIN);
  const [errorMessage, setErrorMessage] = useState(null);

  const loginApiRequest = async () => {
    try {
      const response = await axios.post(`${URL_API}/users/login`, {
        email: email,
        password: password,
      });

      return response.data;
    } catch (e) {
      console.error(e);
      setErrorMessage('Login failed, try again later');

      return null;
    }
  };

  const signupApiRequest = async () => {
    try {
      const response = await axios.post(`${URL_API}/users/signup`, {
        email: email,
        username: name,
        password: password,
      });

      return response.data;
    } catch (e) {
      console.error(e);
      setErrorMessage('Signup failed, try again later');

      return null;
    }
  };

  const userExistsRequest = async () => {
    const response = await axios.post(`${URL_API}/users/exists`, {
      identifier: email,
    });

    return response.data.userExists;
  };

  const nextStep = async () => {
    setErrorMessage(null);

    if (step === STEP_EMAIL) {
      try {
        const userAlreadyExists = await userExistsRequest();
        if (userAlreadyExists) {
          setUserAction(ACTION_LOGIN);
          setStep(STEP_PASSWORD);
        } else {
          setUserAction(ACTION_SIGNUP);
          setStep(STEP_NAME);
        }
      } catch (e) {
        console.error(e);
        setErrorMessage('Something went wrong, try again later.');
      }
    } else if (step === STEP_NAME) {
      setStep(STEP_PASSWORD);
    } else if (step === STEP_PASSWORD) {
      let user = null;
      if (userAction === ACTION_LOGIN) {
        user = await loginApiRequest();
      } else if (userAction === ACTION_SIGNUP) {
        user = await signupApiRequest();
      }

      if (user) {
        setLoggedUser(user);
      }
    }
  };

  const handleInputChange = (e) => {
    if (step === STEP_EMAIL) {
      setEmail(e.target.value);
    } else if (step === STEP_NAME) {
      setName(e.target.value);
    } else if (step === STEP_PASSWORD) {
      setPassword(e.target.value);
    }
  };

  const stepValue = () => {
    if (step === STEP_EMAIL) {
      return email;
    }
    if (step === STEP_NAME) {
      return name;
    }
    if (step === STEP_PASSWORD) {
      return password;
    }
  };

  const getPlaceholder = () => {
    if (step === STEP_EMAIL) {
      return 'Email';
    }
    if (step === STEP_NAME) {
      return 'Name';
    }
    if (step === STEP_PASSWORD) {
      return 'Password';
    }
  };

  const getMessage = () => {
    if (step === STEP_EMAIL) {
      return (
        <>
          Press enter to <strong>login</strong> or <strong>signup</strong>!
        </>
      );
    }
    if (step === STEP_NAME) {
      return (
        <>
          Email not registered yet, continue the <strong>signup</strong>{' '}
          process!
        </>
      );
    }
    if (step === STEP_PASSWORD) {
      if (userAction === ACTION_LOGIN) {
        return (
          <>
            Email already registered, input your password to{' '}
            <strong>login</strong>!
          </>
        );
      }
      if (userAction === ACTION_SIGNUP) {
        return <>Register your password to finish!</>;
      }
    }
  };

  const getInputType = () => {
    if (step === STEP_EMAIL) {
      return 'email';
    }
    if (step === STEP_NAME) {
      return 'text';
    }
    if (step === STEP_PASSWORD) {
      return 'password';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={img} className="App-logo" alt="logo" />
        <p>EMDB - Ensta Movie Database.</p>
        <input
          type={getInputType()}
          className="App-input-text"
          placeholder={getPlaceholder()}
          value={stepValue()}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              nextStep();
            }
          }}
          tabIndex={0}
        />
        <div className="Small-text">{getMessage()}</div>
        {errorMessage && (
          <div className="Small-text Error-text">{errorMessage}</div>
        )}
      </header>
    </div>
  );
}

export default Login;
