import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/link-context';

import { environment } from '../environments/environment';

import { getTokenFromStore } from './token';

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

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink),
});
