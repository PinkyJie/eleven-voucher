import { css } from '@emotion/core';
import styled from '@emotion/styled';
import bwipjs from 'bwip-js';
import { format, differenceInDays } from 'date-fns';
import React, { useEffect } from 'react';

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
  position: absolute;
  font-weight: bold;
  font-size: 4vw;
`;

const StyledFuelTypeTop = styled.div`
  position: absolute;
  color: white;
  font-size: 3vw;
`;

const StyledFuelTypeBottom = styled.div`
  position: absolute;
  color: #354945;
  font-size: 2.7vw;
`;

const StyledFuelPriceDigit = styled.div`
  position: absolute;
  font-weight: bold;
  font-size: 15.4vw;
  color: white;
`;

const StyledFuelPriceDigitGray = styled(StyledFuelPriceDigit)`
  color: #9b9b9c;
`;

const StyledExpireTime = styled.div`
  color: #ee3e30;
  position: absolute;
  font-size: 2.9vw;
`;

const StyledExpireDay = styled.div`
  color: #ee3e30;
  position: absolute;
  font-size: 2.9vw;
  font-weight: bold;
`;

const StyledVoucherContainer = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  padding: 9px 8%;
`;

const StyledCanvas = styled.canvas`
  flex: 1;
`;

const StyledVoucherCodeText = styled.div`
  position: absolute;
  width: 100%;
  font-size: 3.4vw;
  text-align: center;
`;

const fuelNameMap = {
  [FuelType.E10]: 'Special E10',
  [FuelType.U91]: 'Special Unleaded',
  [FuelType.U95]: 'Extra 95',
  [FuelType.U98]: 'Supreme+ 98',
  [FuelType.Diesel]: 'Special Diesel',
  [FuelType.LPG]: 'AutoGas',
};

const backgroundImageSize = {
  width: 1440,
  height: 2880,
};

const barCodeFrameSize = {
  width: 1366,
  height: 257,
};

interface CoordinatesType {
  [key: string]: {
    x: number;
    y: number;
  };
}

const coordinates: CoordinatesType = {
  timeText: {
    x: 52.5,
    y: 16,
  },
  fuelTypeTop: {
    x: 675,
    y: 501,
  },
  digit1: {
    x: 140,
    y: 707.7,
  },
  digit2: {
    x: 425,
    y: 707.7,
  },
  digit3: {
    x: 700,
    y: 707.7,
  },
  digit4: {
    x: 1025,
    y: 707.7,
  },
  expireTime: {
    x: 235,
    y: 1570,
  },
  expireDay: {
    x: 50,
    y: 1570,
  },
  code: {
    x: 0,
    y: 1670,
  },
  codeText: {
    x: 0,
    y: 1934,
  },
  fuelTypeBottom: {
    x: 35,
    y: 2060,
  },
};

export interface VoucherScreenProps {
  voucher: Partial<Voucher>;
  onClick: () => void;
}

export const VoucherScreen = ({ voucher, onClick }: VoucherScreenProps) => {
  const viewportWidth = Math.min(
    Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    backgroundImageSize.width
  );
  const ratio = viewportWidth / backgroundImageSize.width;
  const responsiveCoordinates = Object.keys(coordinates).reduce(
    (result, key) => {
      result[key] = {
        x: Number((coordinates[key].x * ratio).toFixed(1)),
        y: Number((coordinates[key].y * ratio).toFixed(1)),
      };
      return result;
    },
    {} as CoordinatesType
  );

  const voucherPriceDigits = voucher.fuelPrice.toString().split('');
  if (voucherPriceDigits.length < 5) {
    voucherPriceDigits.unshift('0');
  }

  const voucherCodeText = voucher.code.replace(
    /(\d{4})(\d{4})(\d{4})(\d{1})/g,
    (_, str1, str2, str3, str4) =>
      `${str1} &nbsp; ${str2} &nbsp; ${str3} &nbsp; ${str4}`
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

  useEffect(() => {
    const width = 65;
    const height = 10;
    bwipjs.toCanvas('appCode', {
      bcid: 'code128',
      text: voucher.code,
      width,
      height,
    });
  }, [voucher.code]);

  return (
    <StyledContainer onClick={onClick}>
      <img alt="bg" src="assets/voucher-bg.png" width="100%" />
      <StyledTime
        css={css`
          top: ${responsiveCoordinates.timeText.y}px;
          left: ${responsiveCoordinates.timeText.x}px;
        `}
      >
        {format(new Date(), 'HH:mm')}
      </StyledTime>
      <StyledFuelTypeTop
        css={css`
          top: ${responsiveCoordinates.fuelTypeTop.y}px;
          left: ${responsiveCoordinates.fuelTypeTop.x}px;
        `}
      >
        {fuelNameMap[voucher.fuelType].toUpperCase()}
      </StyledFuelTypeTop>
      {voucherPriceDigits[0] === '0' ? (
        <StyledFuelPriceDigitGray
          css={css`
            top: ${responsiveCoordinates.digit1.y}px;
            left: ${responsiveCoordinates.digit1.x}px;
          `}
        >
          0
        </StyledFuelPriceDigitGray>
      ) : (
        <StyledFuelPriceDigit
          css={css`
            top: ${responsiveCoordinates.digit1.y}px;
            left: ${responsiveCoordinates.digit1.x}px;
          `}
        >
          {voucherPriceDigits[0]}
        </StyledFuelPriceDigit>
      )}
      <StyledFuelPriceDigit
        css={css`
          top: ${responsiveCoordinates.digit2.y}px;
          left: ${responsiveCoordinates.digit2.x}px;
        `}
      >
        {voucherPriceDigits[1]}
      </StyledFuelPriceDigit>
      <StyledFuelPriceDigit
        css={css`
          top: ${responsiveCoordinates.digit3.y}px;
          left: ${responsiveCoordinates.digit3.x}px;
        `}
      >
        {voucherPriceDigits[2]}
      </StyledFuelPriceDigit>
      <StyledFuelPriceDigit
        css={css`
          top: ${responsiveCoordinates.digit4.y}px;
          left: ${responsiveCoordinates.digit4.x}px;
        `}
      >
        {voucherPriceDigits[4]}
      </StyledFuelPriceDigit>
      <StyledExpireTime
        css={css`
          top: ${responsiveCoordinates.expireTime.y}px;
          left: ${responsiveCoordinates.expireTime.x}px;
        `}
      >
        {format(new Date(voucher.expiredAt * 1000), 'h:mm aaa d/M/yy')}
      </StyledExpireTime>
      <StyledExpireDay
        css={css`
          top: ${responsiveCoordinates.expireDay.y}px;
          right: ${responsiveCoordinates.expireDay.x}px;
        `}
      >
        {daysLeftText}
      </StyledExpireDay>
      <StyledVoucherContainer
        css={css`
          top: ${responsiveCoordinates.code.y}px;
          left: ${responsiveCoordinates.code.x}px;
          height: ${Math.floor(barCodeFrameSize.height * ratio)}px;
        `}
      >
        <StyledCanvas id="appCode" />
      </StyledVoucherContainer>
      <StyledVoucherCodeText
        css={css`
          top: ${responsiveCoordinates.codeText.y}px;
          left: ${responsiveCoordinates.codeText.x}px;
        `}
        dangerouslySetInnerHTML={{ __html: voucherCodeText }}
      />
      <StyledFuelTypeBottom
        css={css`
          top: ${responsiveCoordinates.fuelTypeBottom.y}px;
          left: ${responsiveCoordinates.fuelTypeBottom.x}px;
        `}
      >
        NEAREST 7-ELEVEN WITH &nbsp;
        {fuelNameMap[voucher.fuelType].toUpperCase()}
      </StyledFuelTypeBottom>
    </StyledContainer>
  );
};
