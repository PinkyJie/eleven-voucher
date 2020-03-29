import React from 'react';
import Slider, { Settings } from 'react-slick';
import styled from '@emotion/styled';
import { useQuery } from '@apollo/client';
import { Loader } from 'semantic-ui-react';

import {
  GetFuelPriceQuery,
  GetFuelPriceQueryVariables,
  FuelType,
} from '../../generated/generated';

import { FuelCard } from './FuelCard';
import getFuelPriceQuery from './FuelList.graphql';

const StyledFuelList = styled.div``;

export const FuelList = () => {
  const sliderSettings: Settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const allFuelTypes = [
    FuelType.E10,
    FuelType.U91,
    FuelType.U95,
    FuelType.U98,
    FuelType.Diesel,
    FuelType.LPG,
  ];

  const { loading, data } = useQuery<
    GetFuelPriceQuery,
    GetFuelPriceQueryVariables
  >(getFuelPriceQuery);

  return (
    <StyledFuelList>
      {loading && <Loader active />}
      {data?.fuel && (
        <Slider {...sliderSettings}>
          {allFuelTypes.map(fuelType => (
            <FuelCard
              key={fuelType}
              type={fuelType as FuelType}
              price={data.fuel[fuelType].price}
              updated={new Date(data.fuel.updated * 1000)}
              storeName={data.fuel[fuelType].name}
            />
          ))}
        </Slider>
      )}
    </StyledFuelList>
  );
};
