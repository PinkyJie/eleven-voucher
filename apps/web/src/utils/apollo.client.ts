import { ApolloClient, InMemoryCache } from '@apollo/client';

import { environment } from '../environments/environment';

import { getTokenFromStore } from './token';

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  uri: environment.backendUrl,
  headers: {
    authorization: getTokenFromStore() ? `Bearer ${getTokenFromStore()}` : '',
  },
});
