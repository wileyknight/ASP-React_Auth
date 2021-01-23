import React, { useState, useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  ApplicationPaths,
  QueryParameterNames,
} from './AuthorizationConstants';
import authService from './AuthorizeService';

interface IProps {
  path: string;
  component: any;
}

const AuthorizeRoute: React.FC<IProps> = (props: IProps) => {
  let _subscription: number | undefined;

  const [ready, setReady] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    _subscription = authService.subscribe(() => authenticationChanged());
    populateAuthenticationState();
    return authService.unsubscribe(_subscription);
  }, []);

  const populateAuthenticationState = async () => {
    const auth = await authService.isAuthenticated();
    setReady(true);
    setAuthenticated(auth);
  };

  const authenticationChanged = async () => {
    setReady(false);
    setAuthenticated(false);
    await populateAuthenticationState();
  };

  const redirectUrl = `${ApplicationPaths.Login}?${
    QueryParameterNames.ReturnUrl
  }=${encodeURI(window.location.href)}`;
  if (!ready) {
    return <div></div>;
  } else {
    // create route and send there if authenticated
    const { component: Component, ...rest } = props;
    return (
      <Route
        {...rest}
        render={(props) => {
          if (authenticated) {
            return <Component {...props} />;
          } else {
            return <Redirect to={redirectUrl} />;
          }
        }}
      />
    );
  }
};

export default AuthorizeRoute;
