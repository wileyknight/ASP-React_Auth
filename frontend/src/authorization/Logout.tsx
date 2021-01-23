import React, { useState, useEffect } from 'react';
import authService from './AuthorizeService';
import { AuthenticationResultStatus } from './AuthorizeService';
import {
  QueryParameterNames,
  LogoutActions,
  ApplicationPaths,
} from './AuthorizationConstants';

interface IProps {
  action: string;
}

interface IResult {
  status: string;
  state?: string | object | undefined;
  message?: string;
}

export const Logout: React.FC<IProps> = (props: IProps) => {
  const [message, setMessage] = useState<string | undefined>();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const action = props.action;
    switch (action) {
      case LogoutActions.Logout:
        sendLogOut(getReturnUrl());
        break;
      case LogoutActions.LogoutCallback:
        processLogoutCallback();
        break;
      case LogoutActions.LoggedOut:
        setIsReady(true);
        setMessage('You successfully logged out!');
        break;
      default:
        throw new Error(`Invalid action '${action}'`);
    }

    populateAuthenticationState();
  }, []);

  const sendLogOut = async (returnUrl: string) => {
    const baseURL = `https://localhost:5001/authorization/logout`;

    const data = JSON.stringify({ returnUrl: 'https://localhost:5001/login' });

    await fetch(baseURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data,
    })
      .then((res) => {
        logout(getReturnUrl());
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  const logout = async (returnUrl: string) => {
    const state = { returnUrl };
    const isauthenticated = await authService.isAuthenticated();
    if (isauthenticated) {
      const result: IResult = await authService.signOut(state);
      switch (result.status) {
        case AuthenticationResultStatus.Redirect:
          break;
        case AuthenticationResultStatus.Success:
          await navigateToReturnUrl(returnUrl);
          break;
        case AuthenticationResultStatus.Fail:
          setMessage(result.message);
          break;
        default:
          throw new Error('Invalid authentication result status.');
      }
    } else {
      setMessage('You successfully logged out!');
    }
  };

  const processLogoutCallback = async () => {
    const url: string = window.location.href;
    const result: IResult = await authService.completeSignOut(url);
    switch (result.status) {
      case AuthenticationResultStatus.Redirect:
        throw new Error('Should not redirect.');
      case AuthenticationResultStatus.Success:
        await navigateToReturnUrl(getReturnUrl(result.state));
        break;
      case AuthenticationResultStatus.Fail:
        setMessage(result.message);
        break;
      default:
        throw new Error('Invalid authentication result status.');
    }
  };

  const populateAuthenticationState = async () => {
    const auth = await authService.isAuthenticated();
    setIsReady(true);
    setAuthenticated(auth);
  };

  const getReturnUrl = (state?: any): string => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get(QueryParameterNames.ReturnUrl);
    if (fromQuery && !fromQuery.startsWith(`${window.location.origin}/`)) {
      throw new Error(
        'Invalid return url. The return url needs to have the same origin as the current page.',
      );
    }
    return (
      (state && state.returnUrl) ||
      fromQuery ||
      `${window.location.origin}${ApplicationPaths.LoggedOut}`
    );
  };

  const navigateToReturnUrl = (returnUrl: string) => {
    return window.location.replace(returnUrl);
  };

  if (!isReady) {
    return <div></div>;
  }
  if (!!message) {
    return <div>{message}</div>;
  } else {
    const action = props.action;
    switch (action) {
      case LogoutActions.Logout:
        return <div>Processing logout</div>;
      case LogoutActions.LogoutCallback:
        return <div>Processing logout callback</div>;
      case LogoutActions.LoggedOut:
        return <div>{message}</div>;
      default:
        throw new Error(`Invalid action '${action}'`);
    }
  }
};
