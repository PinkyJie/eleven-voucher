import React from 'react';
import styled from '@emotion/styled';
import { useParams, Link } from 'react-router-dom';
import {
  Segment,
  Loader,
  Dimmer,
  Image,
  Button,
  Message,
  Icon,
  Label,
} from 'semantic-ui-react';

export interface FuelDetailRouterParams {
  fuelType: string;
}

const StyledFuelDetail = styled.div`
  margin: 1em 0;
`;

const StyledImage = styled(Image)`
  margin: 0 auto;
`;

const StyledLabel = styled(Label)`
  margin-left: 5px !important;
`;

export const FuelDetail = () => {
  const { fuelType } = useParams<FuelDetailRouterParams>();
  return (
    <StyledFuelDetail>
      <Link to="/">
        <Button
          content="Back"
          icon="arrow alternate circle left"
          labelPosition="left"
        />
      </Link>
      <Message icon>
        <Icon name="circle notched" loading />
        <Message.Content>
          <Message.Header>Hang in there</Message.Header>
          We are trying to lock in
          <StyledLabel color="teal" horizontal>
            {fuelType}
          </StyledLabel>
          for you.
        </Message.Content>
      </Message>
      <Segment>
        <Dimmer active inverted>
          <Loader size="small">Loading</Loader>
        </Dimmer>
        <StyledImage src="/assets/placeholder.png" size="small" />
      </Segment>
    </StyledFuelDetail>
  );
};
