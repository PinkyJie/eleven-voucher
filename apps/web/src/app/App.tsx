import React, { Component } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/core';
import { Route } from 'react-router-dom';
import { Header, Icon } from 'semantic-ui-react';

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
        <StyledHeader as="h2" icon>
          <Icon name="bolt" />
          Eleven Voucher
          <Header.Subheader>
            Get your fuel voucher with just one-click.
          </Header.Subheader>
        </StyledHeader>
        <FuelPriceContextProvider>
          <main>
            <Route path="/" exact>
              <FuelList />
            </Route>
            <Route path="/fuel/:fuelType" exact>
              <FuelDetail />
            </Route>
          </main>
        </FuelPriceContextProvider>
      </StyledApp>
    );
  }
}
