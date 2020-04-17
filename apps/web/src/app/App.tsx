import React from 'react';
import styled from '@emotion/styled';
import { Route, Switch } from 'react-router-dom';
import { Header, Image } from 'semantic-ui-react';

import {
  FuelList,
  FuelDetail,
  Login,
  PrivateRoute,
  Signup,
} from './components';

const StyledApp = styled.div`
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;
`;

const StyledHeader = styled(Header)`
  display: block !important;
`;

const StyledMain = styled.main`
  padding: 2.5em;
`;

export const App = () => {
  return (
    <StyledApp>
      <Image src="/assets/fuel.png" size="small" centered />
      <StyledHeader as="h2" icon>
        Eleven Voucher
        <Header.Subheader>
          Get your fuel voucher with just one-click.
        </Header.Subheader>
      </StyledHeader>
      <StyledMain>
        <Switch>
          <Route path="/login" exact>
            <Login />
          </Route>
          <Route path="/signup" exact>
            <Signup />
          </Route>
          <PrivateRoute path="/" exact>
            <FuelList />
          </PrivateRoute>
          <PrivateRoute path="/fuel/:fuelType" exact>
            <FuelDetail />
          </PrivateRoute>
          <Route path="*">aaaa</Route>
        </Switch>
      </StyledMain>
    </StyledApp>
  );
};
