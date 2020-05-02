import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';

import { App } from './app/App';
import {
  SessionContextProvider,
  FuelPriceContextProvider,
} from './app/context';
import { client } from './utils/apollo.client';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <ApolloProvider client={client}>
        <SessionContextProvider>
          <FuelPriceContextProvider>
            <App />
          </FuelPriceContextProvider>
        </SessionContextProvider>
      </ApolloProvider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
