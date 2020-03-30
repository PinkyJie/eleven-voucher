import React from 'react';
import styled from '@emotion/styled';
import { Card, Button, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

import { FuelType } from '../../../../../generated/generated';

export interface FuelListItemProps {
  type: FuelType;
  price: number;
  updated: Date;
  storeName: string;
}

const StyledCard = styled(Card)`
  margin: 1em auto !important;
`;

export const FuelListItem = ({
  type,
  price,
  updated,
  storeName,
}: FuelListItemProps) => {
  const fuelMap = {
    [FuelType.E10]: {
      image: '/assets/fueltype_e10.gif',
      title: 'E10',
      route: '/fuel/e10',
    },
    [FuelType.U91]: {
      image: '/assets/fueltype_unleaded.gif',
      title: 'U91',
      route: '/fuel/u91',
    },
    [FuelType.U95]: {
      image: '/assets/fueltype_extra.gif',
      title: 'U95',
      route: '/fuel/u95',
    },
    [FuelType.U98]: {
      image: '/assets/fueltype_supreme.gif',
      title: 'U98',
      route: '/fuel/u98',
    },
    [FuelType.Diesel]: {
      image: '/assets/fueltype_diesel.gif',
      title: 'Diesel',
      route: '/fuel/diesel',
    },
    [FuelType.LPG]: {
      image: '/assets/fueltype_lpg.png',
      title: 'LPG',
      route: '/fuel/lpg',
    },
  };

  const now = new Date();

  return (
    <StyledCard>
      <Image src={fuelMap[type].image} wrapped ui={false} />
      <Card.Content textAlign="center">
        <Card.Header textAlign="center">
          {fuelMap[type].title} - ${price} c/L
        </Card.Header>
        <Card.Meta textAlign="center">
          Updated at {formatDistance(updated, now)}
        </Card.Meta>
        <Card.Meta textAlign="center">{storeName}</Card.Meta>
      </Card.Content>
      <Card.Content textAlign="center" extra>
        <Link to={fuelMap[type].route}>
          <Button primary>Get me a Voucher!</Button>
        </Link>
      </Card.Content>
    </StyledCard>
  );
};
