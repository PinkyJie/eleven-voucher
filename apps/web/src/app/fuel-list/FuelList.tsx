import React from 'react';
import Slider, { Settings } from 'react-slick';
import styled from '@emotion/styled';
import { Card, Button, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';

const StyledFuelCard = styled(Card)`
  margin: 1em auto !important;
`;

const FuelCard = ({ type, price, updated }) => {
  const fuelMap = {
    E10: {
      image: '/assets/fueltype_e10.gif',
      title: 'E10',
      route: '/fuel/e10',
    },
    U91: {
      image: '/assets/fueltype_unleaded.gif',
      title: 'U91',
      route: '/fuel/u91',
    },
    U95: {
      image: '/assets/fueltype_extra.gif',
      title: 'U95',
      route: '/fuel/u95',
    },
    U98: {
      image: '/assets/fueltype_supreme.gif',
      title: 'U98',
      route: '/fuel/u98',
    },
    Diesel: {
      image: '/assets/fueltype_diesel.gif',
      title: 'Diesel',
      route: '/fuel/diesel',
    },
    LPG: {
      image: '/assets/fueltype_lpg.png',
      title: 'LPG',
      route: '/fuel/lpg',
    },
  };

  const updatedDate = new Date(updated * 1000);
  const now = new Date();

  return (
    <StyledFuelCard>
      <Image src={fuelMap[type].image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>
          {fuelMap[type].title} - ${price} c/L
        </Card.Header>
        <Card.Meta>Updated at {formatDistance(updatedDate, now)}</Card.Meta>
      </Card.Content>
      <Card.Content extra>
        <Link to={fuelMap[type].route}>
          <Button primary>Get me a Voucher!</Button>
        </Link>
      </Card.Content>
    </StyledFuelCard>
  );
};

const StyledFuelList = styled.div``;

export const FuelList = () => {
  const settings: Settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  const now = Math.floor(new Date().getTime() / 1000);

  return (
    <StyledFuelList>
      <Slider {...settings}>
        <FuelCard type="E10" price="101.1" updated={now}></FuelCard>
        <FuelCard type="U91" price="102.2" updated={now}></FuelCard>
        <FuelCard type="U95" price="103.3" updated={now}></FuelCard>
        <FuelCard type="U98" price="104.4" updated={now}></FuelCard>
        <FuelCard type="Diesel" price="105.5" updated={now}></FuelCard>
        <FuelCard type="LPG" price="105.6" updated={now}></FuelCard>
      </Slider>
    </StyledFuelList>
  );
};
