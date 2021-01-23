import { UserManager, WebStorageStateStore } from 'oidc-client';
import { ApplicationPaths, ApplicationName } from './AuthorizationConstants';

interface IUser {
  profile?: object | null | undefined;
}

interface ICallback {
  callback(): any;
  subscription: number;
}

export class AuthorizeService {
  _callbacks: Array<ICallback> = [];
  _nextSubscriptionId = 0;
  _user: IUser | undefined | null = {};
  _isAuthenticated = false;
  userManager: any;
  callback: any;
  _popUpDisabled = true;

  async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  }

  async getUser() {
    if (this._user && this._user.profile) {
      return this._user.profile;
    }

    await this.ensureUserManagerInitialized();
    const user = await this.userManager.getUser();
    return user && user.profile;
  }

  async getAccessToken() {
    await this.ensureUserManagerInitialized();
    const user = await this.userManager.getUser();
    return user && user.access_token;
  }

  async signIn(state: object) {
    await this.ensureUserManagerInitialized();
    try {
      const silentUser = await this.userManager.signinSilent(
        this.createArguments(),
      );
      this.updateState(silentUser);
      return this.success(state);
    } catch (silentError) {
      console.log('Silent authentication error: ', silentError);

      try {
        if (this._popUpDisabled) {
          throw new Error(
            "Popup disabled. Change 'AuthorizeService.js:AuthorizeService._popupDisabled' to false to enable it.",
          );
        }

        const popUpUser = await this.userManager.signinPopup(
          this.createArguments(),
        );
        this.updateState(popUpUser);
        return this.success(state);
      } catch (popUpError) {
        if (popUpError.message === 'Popup window closed') {
          return this.error('The user closed the window.');
        } else if (!this._popUpDisabled) {
          console.log('Popup authentication error: ', popUpError);
        }

        try {
          await this.userManager.signinRedirect(this.createArguments(state));
          return this.redirect();
        } catch (redirectError) {
          console.log('Redirect authentication error: ', redirectError);
          return this.error(redirectError);
        }
      }
    }
  }

  async completeSignIn(url: string) {
    try {
      await this.ensureUserManagerInitialized();
      const user = await this.userManager.signinCallback(url);
      this.updateState(user);
      return this.success(user && user.state);
    } catch (error) {
      console.log('There was an error signing in: ', error);
      return this.error('There was an error signing in.');
    }
  }

  async signOut(state: object) {
    await this.ensureUserManagerInitialized();
    try {
      if (this._popUpDisabled) {
        throw new Error(
          "Popup disabled. Change 'AuthorizeService.js:AuthorizeService._popupDisabled' to false to enable it.",
        );
      }
      await this.userManager.signoutPopup(this.createArguments());
      this.updateState(undefined);
      return this.success(state);
    } catch (popupSignOutError) {
      console.log('Popup signout error: ', popupSignOutError);
      try {
        await this.userManager.signoutRedirect(this.createArguments(state));
        return this.redirect();
      } catch (redirectSignOutError) {
        return this.error(redirectSignOutError);
      }
    }
  }

  async completeSignOut(url: string) {
    await this.ensureUserManagerInitialized();
    try {
      const response = await this.userManager.signoutCallback(url);
      this.updateState(null);
      return this.success(response && response.data);
    } catch (error) {
      console.log(`There was an error trying to log out '${error}'.`);
      return this.error(error);
    }
  }

  updateState(user: object | null | undefined) {
    this._user = user;
    this._isAuthenticated = !!this._user;
    this.notifySubscribers();
  }

  subscribe(callback: any) {
    this._callbacks.push({
      callback,
      subscription: this._nextSubscriptionId++,
    });
    return this._nextSubscriptionId - 1;
  }

  unsubscribe(subscriptionId: number | undefined) {
    const subscriptionIndex: any = this._callbacks
      .map((element, index) =>
        element.subscription === subscriptionId
          ? { found: true, index }
          : { found: false },
      )
      .filter((element) => element.found === true);
    if (subscriptionIndex.length !== 1) {
      throw new Error(
        `Found an invalid number of subscriptions ${subscriptionIndex.length}`,
      );
    }

    this._callbacks = this._callbacks.splice(subscriptionIndex[0].index, 1);
  }

  notifySubscribers() {
    for (let i = 0; i < this._callbacks.length; i++) {
      const callback = this._callbacks[i].callback;
      callback();
    }
  }

  createArguments(state?: object) {
    return { useReplaceToNavigate: true, data: state };
  }

  error(message: string) {
    return { status: AuthenticationResultStatus.Fail, message };
  }

  success(state: object | string) {
    return { status: AuthenticationResultStatus.Success, state };
  }

  redirect() {
    return { status: AuthenticationResultStatus.Redirect };
  }

  async ensureUserManagerInitialized() {
    if (this.userManager !== undefined) {
      return;
    }

    let response = await fetch(
      ApplicationPaths.ApiAuthorizationClientConfigurationUrl,
    );
    if (!response.ok) {
      throw new Error(`Could not load settings for '${ApplicationName}'`);
    }

    let settings = await response.json();
    settings.automaticSilentRenew = true;
    settings.includeIdTokenInSilentRenew = true;
    settings.userStore = new WebStorageStateStore({
      prefix: ApplicationName,
    });

    this.userManager = new UserManager(settings);

    this.userManager.events.addUserSignedOut(async () => {
      await this.userManager.removeUser();
      this.updateState(undefined);
    });
  }

  static get instance() {
    return authService;
  }
}

const authService = new AuthorizeService();

export default authService;

export const AuthenticationResultStatus = {
  Redirect: 'redirect',
  Success: 'success',
  Fail: 'fail',
};
