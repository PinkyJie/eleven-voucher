import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { Loader } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import {
  GetSessionUserQuery,
  GetSessionUserQueryVariables,
} from '../../../generated/generated';
import { getTokenFromStore, saveTokenToStore } from '../../../utils/auth';

import GET_SESSION_USER_QUERY from './SessionContext.graphql';

export interface SessionContextData {
  user: GetSessionUserQuery['sessionUser'];
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

  useEffect(() => {
    if (data?.sessionUser?.uid) {
      setUser(data.sessionUser);
      history.replace('/');
    }
  }, [data, token, history]);

  const value: SessionContextData = {
    user,
    setToken: setTokenHandler,
  };

  return (
    <SessionContext.Provider value={value}>
      {loading ? <Loader active /> : children}
    </SessionContext.Provider>
  );
};
