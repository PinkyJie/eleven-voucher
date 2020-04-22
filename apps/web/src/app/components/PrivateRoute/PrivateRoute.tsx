import { RouteProps, Route, Redirect } from 'react-router-dom';
import React, { useContext } from 'react';

import { Routes } from '../../../utils/constants';
import { SessionContext } from '../../context';

export const PrivateRoute = ({ children, ...rest }: RouteProps) => {
  const { user } = useContext(SessionContext);

  return (
    <Route
      {...rest}
      render={() =>
        user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: Routes.Login,
            }}
          />
        )
      }
    />
  );
};
