import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Loader } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';

import {
  GetSessionUserQuery,
  GetSessionUserQueryVariables,
} from '../../../generated/generated';
import { TOKEN_KEY } from '../../../utils/constants';

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
  const [token, setToken] = useState(window.localStorage.getItem(TOKEN_KEY));
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
  });

  useEffect(() => {
    if (data?.sessionUser?.uid) {
      window.localStorage.setItem(TOKEN_KEY, token);
      setUser(data.sessionUser);
      history.replace('/');
    }
  }, [data, token, history]);

  const value: SessionContextData = {
    user,
    setToken,
  };

  return (
    <SessionContext.Provider value={value}>
      {loading ? <Loader active /> : children}
    </SessionContext.Provider>
  );
};
