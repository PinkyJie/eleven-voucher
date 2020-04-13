import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

import { environment } from '../environments/environment';

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: environment.backendUrl,
  }),
});
