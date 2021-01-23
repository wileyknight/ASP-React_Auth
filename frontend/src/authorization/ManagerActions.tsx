import React, { ChangeEvent, FormEvent, useEffect, useReducer } from 'react';
import authService from './AuthorizeService';
import { AuthenticationResultStatus } from './AuthorizeService';
import { LoginActions, QueryParameterNames } from './AuthorizationConstants';

interface IProps {
  action: string;
}

interface IResult {
  status: string;
  state?: string | object | undefined;
  message?: string;
}

export interface userState {
  message: string | undefined | null;
  newUser: string;
  newPass: string;
  newPassVerify: string;
  verify: boolean;
}

type UserAction =
  | { type: 'UPDATE_MSG'; payload: string | undefined | null }
  | { type: 'SET_NEWUSER'; payload: string }
  | { type: 'SET_NEWPASS'; payload: string }
  | { type: 'SET_PASSVERIFY'; payload: string }
  | { type: 'UPDATE_VERIFY'; payload: boolean }
  | { type: 'RESET_USER' };

export const userReducer = (state: userState, action: UserAction) => {
  switch (action.type) {
    case 'SET_NEWUSER': {
      return { ...state, newUser: action.payload };
    }
    case 'SET_NEWPASS': {
      return { ...state, newPass: action.payload };
    }
    case 'SET_PASSVERIFY': {
      return { ...state, newPassVerify: action.payload };
    }
    case 'UPDATE_MSG': {
      return { ...state, message: action.payload };
    }
    case 'UPDATE_VERIFY': {
      return { ...state, verify: action.payload };
    }
    case 'RESET_USER': {
      return { ...state, newUser: '', newPass: '', newPassVerify: '' };
    }
    default: {
      return state;
    }
  }
};

const initialMovieListState: userState = {
  message: '',
  newUser: '',
  newPass: '',
  newPassVerify: '',
  verify: false,
};

export const Login: React.FC<IProps> = (props: IProps) => {
  const [
    { message, newUser, newPass, newPassVerify, verify },
    dispatch,
  ] = React.useReducer(userReducer, initialMovieListState);

  useEffect(() => {
    const action = props.action;
    switch (action) {
      case LoginActions.Login:
        break;
      case LoginActions.LoginCallback:
        processLoginCallback();
        break;
      case LoginActions.LoginFailed:
        const params = new URLSearchParams(window.location.search);
        const error = params.get(QueryParameterNames.Message);
        dispatch({ type: 'UPDATE_MSG', payload: error });
        break;
      case LoginActions.Profile:
        // No Action Needed.
        break;
      case LoginActions.Register:
        // No Action Needed.
        break;
      default:
        throw new Error(`Invalid action '${action}'`);
    }
  }, []);

  const sendLogin = async (e: FormEvent) => {
    e.preventDefault();

    dispatch({ type: 'UPDATE_VERIFY', payload: true });
    const redirectUrl = 'https://localhost:5001/authentication/login-callback/';

    const responseType = 'code';
    const scope = 'openid ApiOne rc.scope';

    const authUrl =
      '/connect/authorize/callback' +
      '?client_id=client_id_js' +
      '&redirect_uri=' +
      encodeURIComponent(redirectUrl) +
      '&response_type=' +
      encodeURIComponent(responseType) +
      '&scope=' +
      encodeURIComponent(scope) +
      '&state=assdofinaowinfwsoiefnasosudfiuiawefboweyfb' +
      '&nonce=NonceValueuiasfiubwouefybaowuefbywuoefby';

    const returnUrl = encodeURIComponent(authUrl);

    const baseURL = `https://localhost:5001/authorization/login`;

    const data = JSON.stringify({
      userName: newUser,
      password: newPass,
      returnUrl: returnUrl,
    });

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
        dispatch({ type: 'RESET_USER' });
        login(returnUrl);
      })
      .catch((err) => {
        console.log('error', err);
      });
  };

  const registerUser = async (e: FormEvent) => {
    e.preventDefault();

    const redirectUrl = 'https://localhost:5001/authorization/login';

    const baseURL = `https://localhost:5001/authorization/register`;

    const data = JSON.stringify({
      userName: newUser,
      Password: newPass,
      VerifyPassword: newPassVerify,
      returnUrl: redirectUrl,
    });

    await fetch(baseURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data,
    }).catch((err) => {
      console.log('error', err);
    });
    dispatch({ type: 'RESET_USER' });
  };

  const updateUser = (newVal: string): void => {
    dispatch({ type: 'SET_NEWUSER', payload: newVal });
  };

  const updatePass = (newVal: string): void => {
    dispatch({ type: 'SET_NEWPASS', payload: newVal });
  };

  const updatePassVerify = (newVal: string): void => {
    dispatch({ type: 'SET_PASSVERIFY', payload: newVal });
  };

  const login = async (returnUrl: string) => {
    const state = { returnUrl };
    const result: IResult = await authService.signIn(state);
    switch (result.status) {
      case AuthenticationResultStatus.Redirect:
        break;
      case AuthenticationResultStatus.Success:
        await navigateToReturnUrl(returnUrl);
        navigateToReturnUrl(`/${LoginActions.Default}`);
        break;
      case AuthenticationResultStatus.Fail:
        dispatch({ type: 'UPDATE_MSG', payload: result.message });
        break;
      default:
        throw new Error(`Invalid status result ${result.status}.`);
    }
  };

  const getReturnUrl = (state?: any): string => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get(QueryParameterNames.ReturnUrl);
    if (fromQuery && !fromQuery.startsWith(`${window.location.origin}/`)) {
      // This is an extra check to prevent open redirects.
      throw new Error(
        'Invalid return url. The return url needs to have the same origin as the current page.',
      );
    }
    return (
      (state && state.returnUrl) || fromQuery || `${window.location.origin}/`
    );
  };

  const redirectToApiAuthorizationPath = (
    apiAuthorizationPath: string,
  ): void => {
    const redirectUrl = `${window.location.origin}${apiAuthorizationPath}`;
    // It's important that we do a replace here so that when the user hits the back arrow on the
    // browser he gets sent back to where it was on the app instead of to an endpoint on this
    // component.
    window.location.replace(redirectUrl);
  };

  const navigateToReturnUrl = (returnUrl: string): void => {
    // It's important that we do a replace here so that we remove the callback uri with the
    // fragment containing the tokens from the browser history.
    window.location.replace(returnUrl);
  };

  const processLoginCallback = async () => {
    const url = window.location.href;
    const result: IResult = await authService.completeSignIn(url);
    switch (result.status) {
      case AuthenticationResultStatus.Redirect:
        // There should not be any redirects as the only time completeSignIn finishes
        // is when we are doing a redirect sign in flow.
        throw new Error('Should not redirect.');
      case AuthenticationResultStatus.Success:
        await navigateToReturnUrl(getReturnUrl(result.state));
        break;
      case AuthenticationResultStatus.Fail:
        dispatch({ type: 'UPDATE_MSG', payload: result.message });
        break;
      default:
        throw new Error(
          `Invalid authentication result status '${result.status}'.`,
        );
    }
  };

  const action = props.action;

  if (!!message) {
    return <div>{message}</div>;
  } else {
    switch (action) {
      case LoginActions.Login:
        if (!verify) {
          return (
            <form onSubmit={(event: FormEvent) => sendLogin(event)}>
              <input
                type="text"
                name="username"
                value={newUser}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  updateUser(event.target.value)
                }
              />
              <input
                type="password"
                name="password"
                value={newPass}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  updatePass(event.target.value)
                }
              />
              <button type="submit">Login</button>
            </form>
          );
        } else {
          return <div>Just a moment. Processing login...</div>;
        }
      case LoginActions.LoginCallback:
        return <div>Processing login callback</div>;
      case LoginActions.Profile:
      case LoginActions.Register:
        return (
          <form onSubmit={(event: FormEvent) => registerUser(event)}>
            <input
              type="text"
              name="username"
              value={newUser}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                updateUser(event.target.value)
              }
            />
            <input
              type="password"
              name="password"
              value={newPass}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                updatePass(event.target.value)
              }
            />
            <input
              type="password"
              name="passwordVerify"
              value={newPassVerify}
              onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                updatePassVerify(event.target.value)
              }
            />
            <button type="submit">Login</button>
          </form>
        );
      default:
        throw new Error(`Invalid action '${action}'`);
    }
  }
};
