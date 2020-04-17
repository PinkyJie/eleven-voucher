import React, { useContext, useEffect } from 'react';
import Slider, { Settings } from 'react-slick';
import styled from '@emotion/styled';
import { css, Global } from '@emotion/core';

import { logPageView } from '../../../utils/firebase';
import { FuelType } from '../../../generated/generated';
import { FuelPriceContext } from '../../context';

import { FuelListItem } from './_items';

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

  const { prices } = useContext(FuelPriceContext);

  useEffect(logPageView, []);

  return (
    <StyledFuelList>
      <Global
        styles={css`
          .slick-next:before {
            color: black;
          }
          .slick-prev:before {
            color: black;
          }
        `}
      />
      <Slider {...sliderSettings}>
        {allFuelTypes.map(fuelType => (
          <FuelListItem
            key={fuelType}
            type={fuelType as FuelType}
            price={prices[fuelType].price}
            updated={new Date(prices.updated * 1000)}
            storeName={prices[fuelType].name}
          />
        ))}
      </Slider>
    </StyledFuelList>
  );
};
