import React from 'react';
import { Route } from 'react-router';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { Authorized } from './components/Authorized';
import AuthorizeRoute from './authorization/AuthorizeRoute';
import ApiAuthorizationRoutes from './authorization/ManagerRoutes';
import { ApplicationPaths } from './authorization/AuthorizationConstants';

import './App.css';
import { Layout } from './components/Layout';

function App() {
  return (
    <Layout>
      <Route exact path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <AuthorizeRoute path="/authorized" component={Authorized} />
      <Route
        path={ApplicationPaths.ApiAuthorizationPrefix}
        component={ApiAuthorizationRoutes}
      />
    </Layout>
  );
}

export default App;
