import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
} from '@apollo/client';
import { setContext } from '@apollo/link-context';
import { onError } from '@apollo/link-error';

import { environment } from '../environments/environment';

import { getTokenFromStore, removeTokenFromStore } from './token';
import { Routes } from './constants';
const httpLink = createHttpLink({
  uri: environment.backendUrl,
});

const authLink = setContext((_, { headers }) => {
  const token = getTokenFromStore();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) {
    const unauthorizedError = graphQLErrors.find(
      graphQLError => graphQLError?.message === 'Unauthorized'
    );
    if (unauthorizedError) {
      removeTokenFromStore();
      window.location.hash = Routes.Login;
    }
  }
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([errorLink, authLink, httpLink]),
});
