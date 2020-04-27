import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { format, differenceInDays } from 'date-fns';
import bwipjs from 'bwip-js';

import { Voucher, FuelType } from '../../../generated/generated';

const StyledContainer = styled.div`
  width: 100%;
  height: 100%;
  z-index: 100;
  position: absolute;
  top: 0;
  left: 0;
`;

const StyledTime = styled.div`
  color: white;
  top: 0.6%;
  left: 4%;
  position: absolute;
  font-weight: bold;
`;

const StyledFuelTypeTop = styled.div`
  position: absolute;
  color: white;
  top: 19.5%;
  font-size: 17px;
  left: 47%;
`;

const StyledFuelTypeBottom = styled.div`
  position: absolute;
  color: #354945;
  top: 80.5%;
  left: 2%;
  font-size: 12px;
`;

const StyledFuelPriceDigit = styled.div`
  position: absolute;
  font-weight: bold;
  font-size: 68px;
  color: white;
  top: 28%;
`;

const StyledFuelPriceDigit1 = styled(StyledFuelPriceDigit)`
  left: 9.5%;
`;

const StyledFuelPriceDigit1Gray = styled(StyledFuelPriceDigit1)`
  color: #9b9b9c;
`;

const StyledFuelPriceDigit2 = styled(StyledFuelPriceDigit)`
  left: 28.5%;
`;

const StyledFuelPriceDigit3 = styled(StyledFuelPriceDigit)`
  left: 47.5%;
`;

const StyledFuelPriceDigit4 = styled(StyledFuelPriceDigit)`
  left: 71%;
`;

const StyledExpireTime = styled.div`
  color: #ee3e30;
  position: absolute;
  top: 61.4%;
  left: 17%;
  font-size: 13px;
`;

const StyledExpireDay = styled.div`
  color: #ee3e30;
  position: absolute;
  top: 61.4%;
  right: 4%;
  font-size: 13px;
  font-weight: bold;
`;

const StyledVoucherContainer = styled.div`
  position: absolute;
  top: 66.5%;
  left: 5%;
`;

const StyledVoucherCodeText = styled.div`
  position: absolute;
  width: 100%;
  top: 75.5%;
  font-size: 15px;
  text-align: center;
`;

const fuelNameMap = {
  [FuelType.E10]: 'Special E10',
  [FuelType.U91]: 'Special Unleaded 91',
  [FuelType.U95]: 'Extra 95',
  [FuelType.U98]: 'Supreme+ 98',
  [FuelType.Diesel]: 'Special Diesel',
  [FuelType.LPG]: 'AutoGas',
};

export interface VoucherScreenProps {
  voucher: Partial<Voucher>;
  onClick: () => void;
}

export const VoucherScreen = ({ voucher, onClick }: VoucherScreenProps) => {
  useEffect(() => {
    bwipjs.toCanvas('appCode', {
      bcid: 'code128',
      text: voucher.code,
      height: 9,
      width: 66,
    });
  });

  const voucherPriceDigits = voucher.fuelPrice.toString().split('');
  if (voucherPriceDigits.length < 5) {
    voucherPriceDigits.unshift('0');
  }

  const voucherCodeText = voucher.code.replace(
    /(\d{4})(\d{4})(\d{4})(\d{1})/g,
    (_, str1, str2, str3, str4) => `${str1}  ${str2}  ${str3}  ${str4}`
  );

  const daysLeft = differenceInDays(
    new Date(voucher.expiredAt * 1000),
    new Date()
  );
  let daysLeftText = `${daysLeft} days left`;
  if (daysLeft === 0) {
    daysLeftText = 'Today';
  } else if (daysLeft === 1) {
    daysLeftText = 'Tomorrow';
  }

  return (
    <StyledContainer onClick={onClick}>
      <img alt="bg" src="assets/voucher-bg.png" width="100%" />
      <StyledTime>{format(new Date(), 'HH:mm')}</StyledTime>
      <StyledFuelTypeTop>
        {fuelNameMap[voucher.fuelType].toUpperCase()}
      </StyledFuelTypeTop>
      {voucherPriceDigits[0] === '0' ? (
        <StyledFuelPriceDigit1Gray>0</StyledFuelPriceDigit1Gray>
      ) : (
        <StyledFuelPriceDigit1>{voucherPriceDigits[0]}</StyledFuelPriceDigit1>
      )}
      <StyledFuelPriceDigit2>{voucherPriceDigits[1]}</StyledFuelPriceDigit2>
      <StyledFuelPriceDigit3>{voucherPriceDigits[2]}</StyledFuelPriceDigit3>
      <StyledFuelPriceDigit4>{voucherPriceDigits[4]}</StyledFuelPriceDigit4>
      <StyledExpireTime>
        {format(new Date(voucher.expiredAt * 1000), 'h:mm aaa d/M/yy')}
      </StyledExpireTime>
      <StyledExpireDay>{daysLeftText}</StyledExpireDay>
      <StyledVoucherContainer>
        <canvas id="appCode" />
      </StyledVoucherContainer>
      <StyledVoucherCodeText>{voucherCodeText}</StyledVoucherCodeText>
      <StyledFuelTypeBottom>
        NEAREST 7-ELEVEN WITH &nbsp;
        {fuelNameMap[voucher.fuelType].toUpperCase()}
      </StyledFuelTypeBottom>
    </StyledContainer>
  );
};
