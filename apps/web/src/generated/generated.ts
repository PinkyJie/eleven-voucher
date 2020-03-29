export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Account = {
   __typename?: 'Account';
  /** Account ID */
  id: Scalars['String'];
  /** First name */
  firstName: Scalars['String'];
  /** Email */
  email: Scalars['String'];
  /** Device secret token */
  deviceSecretToken: Scalars['String'];
  /** Access token */
  accessToken: Scalars['String'];
};

export type EmailMessage = {
   __typename?: 'EmailMessage';
  /** Message ID */
  id: Scalars['Int'];
  /** Sender email address */
  from: Scalars['String'];
  /** Message subject */
  subject: Scalars['String'];
  /** Receive date */
  date: Scalars['String'];
};

export type EmailMessageWithBody = {
   __typename?: 'EmailMessageWithBody';
  /** Message ID */
  id: Scalars['Int'];
  /** Sender email address */
  from: Scalars['String'];
  /** Message subject */
  subject: Scalars['String'];
  /** Receive date */
  date: Scalars['String'];
  /** Message body */
  body: Scalars['String'];
};

export type Fuel = {
   __typename?: 'Fuel';
  /** Best fuel price of E10 */
  E10: FuelPrice;
  /** Best fuel price of U91 */
  U91: FuelPrice;
  /** Best fuel price of U95 */
  U95: FuelPrice;
  /** Best fuel price of U98 */
  U98: FuelPrice;
  /** Best fuel price of Diesel */
  Diesel: FuelPrice;
  /** Best fuel price of LPG */
  LPG: FuelPrice;
  /** Last updated timestamp */
  updated: Scalars['Int'];
};

export type FuelPrice = {
   __typename?: 'FuelPrice';
  /** Fuel type */
  type: FuelType;
  /** Fuel price */
  price: Scalars['Float'];
  /** The suburb for the store */
  suburb: Scalars['String'];
  /** The post code for the store */
  postcode: Scalars['String'];
  /** The state for the store */
  state: Scalars['String'];
  /** The name of the store */
  name: Scalars['String'];
  /** Longitude of the store which has this price */
  lng: Scalars['Float'];
  /** Latitude of the store which has this price */
  lat: Scalars['Float'];
};

export enum FuelType {
  E10 = 'E10',
  U91 = 'U91',
  U95 = 'U95',
  U98 = 'U98',
  Diesel = 'Diesel',
  LPG = 'LPG'
}

export type LockInInput = {
  /** Account ID */
  accountId: Scalars['String'];
  /** Fuel type */
  fuelType: FuelType;
  /** Liters */
  liters?: Maybe<Scalars['Float']>;
  /** The latitude of the store location */
  storeLatitude: Scalars['Float'];
  /** The longitude of the store location */
  storeLongitude: Scalars['Float'];
  /** Device secret token */
  deviceSecretToken: Scalars['String'];
  /** Access token */
  accessToken: Scalars['String'];
};

export type LoginInput = {
  /** Email address */
  email: Scalars['String'];
  /** Password */
  password: Scalars['String'];
};

export type LogoutInput = {
  /** Device secret token */
  deviceSecretToken: Scalars['String'];
  /** Access token */
  accessToken: Scalars['String'];
};

export type Mutation = {
   __typename?: 'Mutation';
  /** Register a new account */
  register: Scalars['Boolean'];
  /** Log in */
  login: Account;
  /** Log out */
  logout: Scalars['Boolean'];
  /** Lock in the fuel price voucher. */
  lockInVoucher: Scalars['Boolean'];
  /** Click the verification link in the email. */
  clickVerificationLinkInEmail: Scalars['Boolean'];
};


export type MutationregisterArgs = {
  registerAccountInput: RegisterAccountInput;
};


export type MutationloginArgs = {
  loginInput: LoginInput;
};


export type MutationlogoutArgs = {
  logoutInput: LogoutInput;
};


export type MutationlockInVoucherArgs = {
  lockInInput: LockInInput;
};


export type MutationclickVerificationLinkInEmailArgs = {
  email: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  /** Health check */
  healthCheck: Scalars['String'];
  /** Retrieve best fuel price for all types. */
  fuel: Fuel;
  /** Retrieve the voucher list. */
  vouchers: Array<Maybe<Voucher>>;
  /** Retrieve the voucher list. */
  lastUsedVoucher: Scalars['Boolean'];
  /** Retrieve messages for a specific email address. */
  emailMessages: Array<Maybe<EmailMessage>>;
  /** Retrieve a message with a specific message ID. */
  emailMessage?: Maybe<EmailMessageWithBody>;
};


export type QueryvouchersArgs = {
  accessToken: Scalars['String'];
  deviceSecretToken: Scalars['String'];
};


export type QuerylastUsedVoucherArgs = {
  accessToken: Scalars['String'];
  deviceSecretToken: Scalars['String'];
  voucherId: Scalars['String'];
};


export type QueryemailMessagesArgs = {
  email: Scalars['String'];
};


export type QueryemailMessageArgs = {
  id: Scalars['Float'];
  email: Scalars['String'];
};

export type RegisterAccountInput = {
  /** Email address */
  email: Scalars['String'];
  /** Password */
  password: Scalars['String'];
  /** First name */
  firstName: Scalars['String'];
  /** Last name */
  lastName: Scalars['String'];
  /** Mobile phone number */
  phone: Scalars['String'];
  /** Date of birth */
  dobTimestamp: Scalars['String'];
};

export type Voucher = {
   __typename?: 'Voucher';
  /** Voucher ID */
  id: Scalars['String'];
  /** Voucher status: 0: Active, 1: Expired, 2: Redeemed */
  status: Scalars['Int'];
  /** The voucher code */
  code: Scalars['String'];
  /** The fuel type for the voucher */
  fuelType: FuelType;
  /** The fuel price for the voucher */
  fuelPrice: Scalars['Float'];
  /** The maximum liters available for the voucher */
  liters: Scalars['Int'];
  /** The store id which this voucher belongs to */
  storeId: Scalars['String'];
  /** The creation timestamp for the voucher */
  createdAt: Scalars['Int'];
  /** The expiration timestamp for the voucher */
  expiredAt: Scalars['Int'];
};

export type GetFuelPriceQueryVariables = {};


export type GetFuelPriceQuery = (
  { __typename?: 'Query' }
  & { fuel: (
    { __typename?: 'Fuel' }
    & Pick<Fuel, 'updated'>
    & { E10: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ), U91: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ), U95: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ), U98: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ), Diesel: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ), LPG: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name'>
    ) }
  ) }
);
