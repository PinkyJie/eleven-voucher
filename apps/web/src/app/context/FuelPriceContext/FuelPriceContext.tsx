import { useQuery } from '@apollo/client';
import React, { useContext } from 'react';
import { Loader } from 'semantic-ui-react';

import {
  GetFuelPriceQuery,
  GetFuelPriceQueryVariables,
} from '../../../generated/generated';
import { SessionContext } from '../SessionContext';

import GET_FUEL_PRICE_QUERY from './FuelPriceContext.graphql';

export interface FuelPriceContextData {
  prices?: GetFuelPriceQuery['fuel'];
}

export const FuelPriceContext = React.createContext({} as FuelPriceContextData);

export interface FuelPriceContextProviderProps {
  children: React.ReactNode;
}

export const FuelPriceContextProvider = ({
  children,
}: FuelPriceContextProviderProps) => {
  const { user } = useContext(SessionContext);

  const { loading, data } = useQuery<
    GetFuelPriceQuery,
    GetFuelPriceQueryVariables
  >(GET_FUEL_PRICE_QUERY, {
    skip: !user,
  });

  const value: FuelPriceContextData = {
    prices: data?.fuel,
  };

  return (
    <FuelPriceContext.Provider value={value}>
      {loading ? <Loader active /> : children}
    </FuelPriceContext.Provider>
  );
};
