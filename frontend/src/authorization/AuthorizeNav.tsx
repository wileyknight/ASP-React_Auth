import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from './AuthorizeService';
import { ApplicationPaths } from './AuthorizationConstants';
import Button from '@material-ui/core/Button';

export const LoginMenu = () => {
  let _subscription: number | undefined;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    _subscription = authService.subscribe(() => populateState());
    populateState();
    return authService.unsubscribe(_subscription);
  }, []);

  const populateState = async () => {
    const [isAuthenticated, user] = await Promise.all([
      authService.isAuthenticated(),
      authService.getUser(),
    ]);
    setIsAuthenticated(isAuthenticated);
    setUserName(user && user.name);
  };

  const authenticatedView = (
    userName: string | null,
    profilePath: string,
    logoutPath: object,
  ) => {
    return (
      <>
        <Button variant="contained">
          <Link className="text-dark" to={profilePath}>
            Hello {userName}
          </Link>
        </Button>
        <Button variant="contained">
          <Link className="text-dark" to={logoutPath}>
            Logout
          </Link>
        </Button>
      </>
    );
  };

  const anonymousView = (registerPath: string, loginPath: string) => {
    return (
      <>
        <Button variant="contained">
          <Link className="text-dark" to={registerPath}>
            Register
          </Link>
        </Button>
        <Button variant="contained">
          <Link className="text-dark" to={loginPath}>
            Login
          </Link>
        </Button>
      </>
    );
  };

  if (!isAuthenticated) {
    const registerPath = `${ApplicationPaths.Register}`;
    const loginPath = `${ApplicationPaths.Login}`;
    return anonymousView(registerPath, loginPath);
  } else {
    const profilePath = `${ApplicationPaths.Profile}`;
    const logoutPath = {
      pathname: `${ApplicationPaths.LogOut}`,
      state: { local: true },
    };
    return authenticatedView(userName, profilePath, logoutPath);
  }
};
