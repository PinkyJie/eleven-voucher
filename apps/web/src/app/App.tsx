import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';
import { Route } from 'react-router-dom';
import { Header, Image } from 'semantic-ui-react';

import { FuelList, FuelDetail } from './components';
import { FuelPriceContextProvider } from './context';

const StyledApp = styled.div`
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;
`;

const StyledHeader = styled(Header)`
  display: block !important;
`;

const StyledMain = styled.main`
  padding: 2.5em;
`;

export class App extends Component {
  render() {
    return (
      <StyledApp>
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
        <Image src="/assets/fuel.png" size="small" centered />
        <StyledHeader as="h2" icon>
          Eleven Voucher
          <Header.Subheader>
            Get your fuel voucher with just one-click.
          </Header.Subheader>
        </StyledHeader>
        <FuelPriceContextProvider>
          <StyledMain>
            <Route path="/" exact>
              <FuelList />
            </Route>
            <Route path="/fuel/:fuelType" exact>
              <FuelDetail />
            </Route>
          </StyledMain>
        </FuelPriceContextProvider>
      </StyledApp>
    );
  }
}
