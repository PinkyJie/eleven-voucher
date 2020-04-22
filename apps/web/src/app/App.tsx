import React, { useEffect, useContext } from 'react';
import styled from '@emotion/styled';
import { Route, Switch, useLocation } from 'react-router-dom';
import { Header, Image, Button } from 'semantic-ui-react';

import { Routes } from '../utils/constants';
import { trackScreenView } from '../utils/firebase';

import {
  FuelList,
  FuelDetail,
  Login,
  PrivateRoute,
  Signup,
} from './components';
import { SessionContext } from './context';

const StyledApp = styled.div`
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;
  position: relative;
`;

const StyledHeader = styled(Header)`
  display: block !important;
`;

const StyledMain = styled.main`
  padding: 2.5em;
`;

const StyledLogoutButton = styled(Button)`
  position: absolute;
  top: 0;
  left: 3em;
`;

export const App = () => {
  const location = useLocation();
  useEffect(trackScreenView, [location.hash]);

  const { user, clearUser } = useContext(SessionContext);

  return (
    <StyledApp>
      {user && (
        <StyledLogoutButton
          color="teal"
          size="medium"
          onClick={() => clearUser()}
        >
          Logout
        </StyledLogoutButton>
      )}
      <Image src="/assets/fuel.png" size="small" centered />
      <StyledHeader as="h2" icon>
        Eleven Voucher
        <Header.Subheader>
          Get your fuel voucher with just one-click.
        </Header.Subheader>
      </StyledHeader>
      <StyledMain>
        <Switch>
          <Route path={Routes.Login} exact>
            <Login />
          </Route>
          <Route path={Routes.Signup} exact>
            <Signup />
          </Route>
          <PrivateRoute path={Routes.Home} exact>
            <FuelList />
          </PrivateRoute>
          <PrivateRoute path={Routes.FuelDetail} exact>
            <FuelDetail />
          </PrivateRoute>
          <Route path="*">404 Not Found</Route>
        </Switch>
      </StyledMain>
    </StyledApp>
  );
};
