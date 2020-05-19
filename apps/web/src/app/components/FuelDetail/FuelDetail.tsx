import {
  useMutation,
  MutationFunctionOptions,
  FetchResult,
} from '@apollo/client';
import styled from '@emotion/styled';
import bwipjs from 'bwip-js';
import { format } from 'date-fns';
import React, { useContext, useEffect, useRef, useState } from 'react';
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

import {
  FuelType,
  GetMeAVoucherMutation,
  GetMeAVoucherMutationVariables,
  RefreshVoucherMutation,
  RefreshVoucherMutationVariables,
  AccountAndVoucherFragment,
} from '../../../generated/generated';
import { Routes } from '../../../utils/constants';
import { firebaseAnalytics } from '../../../utils/firebase';
import { FuelPriceContext } from '../../context';
import { VoucherScreen } from '../VoucherScreen';

import {
  GetMeAVoucher as GET_ME_A_VOUCHER_MUTATION,
  RefreshVoucher as REFRESH_VOUCHER_MUTATION,
} from './FuelDetail.graphql';

const StyledFuelDetail = styled.div`
  margin: 1em 0;
`;

const StyledCanvas = styled.canvas`
  max-width: 100%;
`;

const StyledRefreshContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
`;

const StyledRefreshOverlay = styled.div`
  width: 100%;
  height: 100%;
  background-color: #eee;
  opacity: 0.8;
  position: absolute;
`;

const StyledRefreshButton = styled(Button)`
  position: absolute;
  align-self: center;
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

function pollRefreshedVoucher(
  refreshVoucher: (
    options?: MutationFunctionOptions<
      RefreshVoucherMutation,
      RefreshVoucherMutationVariables
    >
  ) => Promise<FetchResult<RefreshVoucherMutation>>,
  email: string,
  password: string,
  voucher: AccountAndVoucherFragment['voucher'],
  timer: React.MutableRefObject<number>
) {
  timer.current = window.setTimeout(async () => {
    const refreshedVoucher = await refreshVoucher({
      variables: {
        refreshVoucherInput: {
          email: email,
          password: password,
          voucherId: voucher.id,
        },
      },
    });
    if (refreshedVoucher.data.refreshVoucher.voucher.status === 0) {
      pollRefreshedVoucher(refreshVoucher, email, password, voucher, timer);
    } else {
      firebaseAnalytics.logEvent('voucher_expired', {
        fuelType: voucher.fuelType,
        code: voucher.code,
      });
    }
  }, 5000);
}

export const FuelDetail = () => {
  const [showApp, setShowApp] = useState(false);
  const { fuelType: fuelTypeInRouter } = useParams<FuelDetailRouterParams>();
  const { prices } = useContext(FuelPriceContext);
  const fuelType = convertRouterParamsToFuelType(fuelTypeInRouter);

  const [getMeAVoucher, { data, loading, error }] = useMutation<
    GetMeAVoucherMutation,
    GetMeAVoucherMutationVariables
  >(GET_ME_A_VOUCHER_MUTATION);

  const [refreshVoucher, { data: refreshedVoucher }] = useMutation<
    RefreshVoucherMutation,
    RefreshVoucherMutationVariables
  >(REFRESH_VOUCHER_MUTATION);

  const timer = useRef(0);

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
    const { account, voucher } = data?.getMeAVoucher || {};
    if (voucher?.code) {
      firebaseAnalytics.logEvent('view_fuel_voucher', {
        code: voucher.code,
        fuelType: voucher.fuelType,
      });
      bwipjs.toCanvas('code', {
        bcid: 'code128',
        text: voucher.code,
        scaleX: 3,
        scaleY: 1,
        includetext: true,
        textxalign: 'center',
        textsize: 13,
        textyoffset: 5,
      });

      // keep refreshing voucher in case it's used by someone elses
      pollRefreshedVoucher(
        refreshVoucher,
        account.email,
        account.password,
        voucher,
        timer
      );
    }
    return () => {
      if (timer.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(timer.current);
      }
    };
  }, [data, refreshVoucher]);

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
      <Placeholder style={{ maxWidth: '100%' }}>
        <Placeholder.Image />
      </Placeholder>
    </Segment>
  );

  const voucherMessage = data && (
    <Message icon info attached>
      <Icon name="barcode" />
      <Message.Content>
        <Message.Header>
          {data.getMeAVoucher.voucher?.fuelPrice < prices[fuelType].price
            ? 'Magic! Lower than lower'
            : 'Got you covered'}
        </Message.Header>
        Enjoy your voucher for &nbsp;
        <Label color="teal" horizontal>
          {fuelType} - ${data.getMeAVoucher.voucher?.fuelPrice} c/L
        </Label>
        before &nbsp;
        <Label color="teal" horizontal>
          {format(
            new Date(data.getMeAVoucher.voucher?.expiredAt * 1000),
            'HH:mm:ss do MMMM yyyy'
          )}
        </Label>
      </Message.Content>
    </Message>
  );

  const voucherSegment = data && (
    <Segment
      attached
      textAlign="center"
      onClick={() => {
        firebaseAnalytics.logEvent('view_voucher_in_app', {
          code: data.getMeAVoucher.voucher?.code,
          fuelType: data.getMeAVoucher.voucher?.fuelType,
        });
        // eslint-disable-next-line no-unused-expressions
        document.documentElement.webkitRequestFullscreen?.();
        setShowApp(true);
      }}
    >
      <StyledCanvas id="code" />
      {(refreshedVoucher?.refreshVoucher.voucher?.status === 1 ||
        refreshedVoucher?.refreshVoucher.voucher?.status === 2) && (
        <StyledRefreshContainer>
          <StyledRefreshOverlay />
          <StyledRefreshButton
            primary
            onClick={() => {
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
            }}
          >
            Expired! Click to refresh
          </StyledRefreshButton>
        </StyledRefreshContainer>
      )}
    </Segment>
  );

  const accountInfo = data && (
    <Message attached="bottom" warning>
      <Icon name="help" />
      Not working? &nbsp;
      <Modal
        trigger={
          <Button
            onClick={() => {
              firebaseAnalytics.logEvent('show_account_info', {
                fuelType,
                email: data.getMeAVoucher.account?.email,
              });
            }}
            basic
            compact
          >
            Show me the account instead
          </Button>
        }
        size="mini"
      >
        <Modal.Header>Account</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <p>Email: {data.getMeAVoucher?.account?.email}</p>
            <p>Password: {data.getMeAVoucher?.account?.password}</p>
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
      <Link to={Routes.Home}>
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
            {showApp && (
              <VoucherScreen
                voucher={data?.getMeAVoucher?.voucher}
                onClick={() => {
                  // eslint-disable-next-line no-unused-expressions
                  document.exitFullscreen?.();
                  setShowApp(false);
                }}
              />
            )}
          </>
        )
      ) : (
        invalidFuelMessage
      )}
    </StyledFuelDetail>
  );
};
