import React, { useContext, useEffect } from 'react';
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
import { useMutation } from '@apollo/client';
import bwipjs from 'bwip-js';

import {
  FuelType,
  GenAccountAndLockInVoucherMutation,
  GenAccountAndLockInVoucherMutationVariables,
} from '../../../generated/generated';
import { FuelPriceContext } from '../../context';

import GEN_ACCOUNT_AND_LOCK_IN_VOUCHER_MUTATION from './FuelDetail.graphql';

const StyledFuelDetail = styled.div`
  margin: 1em 0;
`;

const StyledImage = styled(Image)`
  margin: 0 auto;
`;

const StyledLabel = styled(Label)`
  margin-left: 5px !important;
`;

export interface FuelDetailRouterParams {
  fuelType: string;
}

function convertRouterParamsToFuelType(fuelTypeInRouter: string): FuelType {
  const fuelTypeMap = {
    e10: FuelType.E10,
    u91: FuelType.U91,
    u95: FuelType.U95,
    u98: FuelType.U98,
    diesel: FuelType.Diesel,
    lpg: FuelType.LPG,
  };
  return fuelTypeMap[fuelTypeInRouter.toLowerCase()];
}

export const FuelDetail = () => {
  const { fuelType: fuelTypeInRouter } = useParams<FuelDetailRouterParams>();
  const { prices } = useContext(FuelPriceContext);
  const fuelType = convertRouterParamsToFuelType(fuelTypeInRouter);

  const [getMeAVoucher, { data, loading }] = useMutation<
    GenAccountAndLockInVoucherMutation,
    GenAccountAndLockInVoucherMutationVariables
  >(GEN_ACCOUNT_AND_LOCK_IN_VOUCHER_MUTATION);

  useEffect(() => {
    if (fuelType) {
      getMeAVoucher({ variables: { fuelType } });
    }
  }, [fuelType, getMeAVoucher]);

  useEffect(() => {
    const voucherCode = data?.genAccountAndLockInVoucher.voucher?.code;
    if (voucherCode) {
      bwipjs.toCanvas('code', {
        bcid: 'code128',
        text: voucherCode,
        scaleX: 3,
        scaleY: 1,
        includetext: true,
        textxalign: 'center',
        textsize: 13,
        textyoffset: 5,
      });
    }
  }, [data]);

  const invalidFuelMessage = (
    <Message icon negative>
      <Icon name="question circle" />
      <Message.Content>
        <Message.Header>Tesla owner?</Message.Header>
        We can't find the fuel type you are looking for:
        <StyledLabel color="teal" horizontal>
          {fuelTypeInRouter}
        </StyledLabel>
      </Message.Content>
    </Message>
  );

  const loadingMessage = fuelType && (
    <Message icon info>
      <Icon name="circle notched" loading />
      <Message.Content>
        <Message.Header>Hang in there</Message.Header>
        We are trying to get a voucher of
        <StyledLabel color="teal" horizontal>
          {fuelType} - ${prices[fuelType].price} c/L
        </StyledLabel>
        for you.
      </Message.Content>
    </Message>
  );

  const loadingSegment = (
    <Segment raised>
      <Dimmer active inverted>
        <Loader size="small">Loading</Loader>
      </Dimmer>
      <StyledImage src="/assets/placeholder.png" size="small" />
    </Segment>
  );

  const voucherSegment = (
    <Segment raised textAlign="center">
      <canvas id="code"></canvas>
    </Segment>
  );

  return (
    <StyledFuelDetail>
      <Link to="/">
        <Button
          content="Back"
          icon="arrow alternate circle left"
          labelPosition="left"
        />
      </Link>
      {fuelType ? (
        loading ? (
          <>
            {loadingMessage}
            {loadingSegment}
          </>
        ) : (
          voucherSegment
        )
      ) : (
        invalidFuelMessage
      )}
    </StyledFuelDetail>
  );
};
