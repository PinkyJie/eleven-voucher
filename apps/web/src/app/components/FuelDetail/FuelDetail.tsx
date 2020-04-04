import React, { useContext, useEffect } from 'react';
import styled from '@emotion/styled';
import { useParams, Link } from 'react-router-dom';
import {
  Segment,
  Loader,
  Dimmer,
  Button,
  Message,
  Icon,
  Label,
  Modal,
  Placeholder,
} from 'semantic-ui-react';
import { useMutation } from '@apollo/client';
import bwipjs from 'bwip-js';
import { format } from 'date-fns';

import {
  FuelType,
  GetMeAVoucherMutation,
  GetMeAVoucherMutationVariables,
} from '../../../generated/generated';
import { FuelPriceContext } from '../../context';

import GET_ME_A_VOUCHER_MUTATION from './FuelDetail.graphql';

const StyledFuelDetail = styled.div`
  margin: 1em 0;
`;

const StyledCanvas = styled.canvas`
  max-width: 100%;
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

  const [getMeAVoucher, { data, loading, error }] = useMutation<
    GetMeAVoucherMutation,
    GetMeAVoucherMutationVariables
  >(GET_ME_A_VOUCHER_MUTATION);

  useEffect(() => {
    if (fuelType) {
      const fuelPrice = prices[fuelType];
      getMeAVoucher({
        variables: {
          getMeAVoucherInput: {
            fuelType,
            fuelPrice: fuelPrice.price,
            latitude: fuelPrice.lat,
            longitude: fuelPrice.lng,
          },
        },
      });
    }
  }, [prices, fuelType, getMeAVoucher]);

  useEffect(() => {
    const voucherCode = data?.getMeAVoucher.voucher?.code;
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
    <Message icon negative attached>
      <Icon name="question circle" />
      <Message.Content>
        <Message.Header>Tesla owner?</Message.Header>
        We can't find the fuel type you are looking for: &nbsp;
        <Label color="teal" horizontal>
          {fuelTypeInRouter}
        </Label>
      </Message.Content>
    </Message>
  );

  const loadingMessage = fuelType && (
    <Message icon info attached>
      <Icon name="circle notched" loading />
      <Message.Content>
        <Message.Header>Hang in there</Message.Header>
        We are trying to get a voucher of &nbsp;
        <Label color="teal" horizontal>
          {fuelType} - ${prices[fuelType].price} c/L
        </Label>
        for you.
      </Message.Content>
    </Message>
  );

  const loadingSegment = (
    <Segment attached>
      <Dimmer active inverted>
        <Loader size="small">Loading</Loader>
      </Dimmer>
      <Placeholder style={{ height: '100%', width: '100%' }}>
        <Placeholder.Image />
      </Placeholder>
    </Segment>
  );

  const voucherMessage = data && (
    <Message icon info attached>
      <Icon name="barcode" />
      <Message.Content>
        <Message.Header>Got you covered</Message.Header>
        Enjoy your voucher for &nbsp;
        <Label color="teal" horizontal>
          {fuelType} - ${data.getMeAVoucher.voucher?.fuelPrice} c/L
        </Label>
        before &nbsp;
        <Label color="teal" horizontal>
          {format(
            new Date(data.getMeAVoucher.voucher?.expiredAt * 1000),
            'do MMMM yyyy'
          )}
        </Label>
      </Message.Content>
    </Message>
  );

  const voucherSegment = data && (
    <Segment attached textAlign="center">
      <StyledCanvas id="code" />
    </Segment>
  );

  const accountInfo = data && (
    <Message attached="bottom" warning>
      <Icon name="help" />
      Not working? &nbsp;
      <Modal
        trigger={
          <Button basic compact>
            Show me the account instead
          </Button>
        }
        size="mini"
      >
        <Modal.Header>Account</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <p> {data.getMeAVoucher?.account?.email}</p>
            <p>{data.getMeAVoucher?.account?.password}</p>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    </Message>
  );

  const errorMessage = error && (
    <Message icon negative attached>
      <Icon name="ban" />
      <Message.Content>
        <Message.Header>Something's wrong</Message.Header>
        Sorry, please go back and try again later.
      </Message.Content>
    </Message>
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
          <>
            {errorMessage}
            {voucherMessage}
            {voucherSegment}
            {accountInfo}
          </>
        )
      ) : (
        invalidFuelMessage
      )}
    </StyledFuelDetail>
  );
};
