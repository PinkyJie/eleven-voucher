import { useQuery } from '@apollo/client';
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';

import {
  GetSessionUserQuery,
  GetSessionUserQueryVariables,
} from '../../../generated/generated';
import {
  getTokenFromStore,
  saveTokenToStore,
  removeTokenFromStore,
} from '../../../utils/auth';
import { Routes } from '../../../utils/constants';
import { firebaseAuth } from '../../../utils/firebase';

import GET_SESSION_USER_QUERY from './SessionContext.graphql';

export interface SessionContextData {
  user: GetSessionUserQuery['sessionUser'];
  clearUser: () => void;
  setToken: (token: string) => void;
}

export const SessionContext = React.createContext({} as SessionContextData);

export interface SessionContextProviderProps {
  children: React.ReactNode;
}

export const SessionContextProvider = ({
  children,
}: SessionContextProviderProps) => {
  const [token, setToken] = useState(getTokenFromStore());
  const [user, setUser] = useState(null);
  const history = useHistory();

  const { loading, data } = useQuery<
    GetSessionUserQuery,
    GetSessionUserQueryVariables
  >(GET_SESSION_USER_QUERY, {
    skip: !token,
    variables: {
      token,
    },
    fetchPolicy: 'network-only',
  });

  const setTokenHandler = useCallback((_token: string) => {
    saveTokenToStore(_token);
    setToken(_token);
  }, []);

  const clearUser = useCallback(() => {
    firebaseAuth.signOut();
    removeTokenFromStore();
    setUser(null);
    history.replace(Routes.Login);
  }, [history]);

  useEffect(() => {
    if (data?.sessionUser?.uid) {
      setUser(data.sessionUser);
      history.replace(Routes.Home);
    }
  }, [data, token, history]);

  const value: SessionContextData = {
    user,
    clearUser,
    setToken: setTokenHandler,
  };

  return (
    <SessionContext.Provider value={value}>
      {loading ? <Loader active /> : children}
    </SessionContext.Provider>
  );
};
