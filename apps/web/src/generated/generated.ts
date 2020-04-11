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

export type AccountAndVoucher = {
   __typename?: 'AccountAndVoucher';
  /** The newly registered account */
  account: NewAccount;
  /** The lock in voucher */
  voucher?: Maybe<Voucher>;
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

export type GetMeAVoucherInput = {
  /** Fuel type */
  fuelType: FuelType;
  /** Fuel price */
  fuelPrice: Scalars['Float'];
  /** Latitude for the location */
  latitude: Scalars['Float'];
  /** Longitude for the location */
  longitude: Scalars['Float'];
};

export type LockInInput = {
  /** Account ID */
  accountId: Scalars['String'];
  /** Fuel type */
  fuelType: FuelType;
  /** Liters */
  liters?: Maybe<Scalars['Float']>;
  /** The latitude of the device location */
  deviceLatitude: Scalars['Float'];
  /** The longitude of the device location */
  deviceLongitude: Scalars['Float'];
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
  /** Verify account */
  verify: Account;
  /** Lock in the fuel price voucher. */
  lockInVoucher?: Maybe<Voucher>;
  /** Get a voucher directly. */
  getMeAVoucher: AccountAndVoucher;
  /** Refresh all fuel prices. */
  refreshAllFuelPrices: Scalars['Boolean'];
  /** Refresh the voucher with email/password. */
  refreshVoucher: AccountAndVoucher;
};


export type MutationRegisterArgs = {
  registerAccountInput: RegisterAccountInput;
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationLogoutArgs = {
  logoutInput: LogoutInput;
};


export type MutationVerifyArgs = {
  verificationCode: Scalars['String'];
};


export type MutationLockInVoucherArgs = {
  lockInInput: LockInInput;
};


export type MutationGetMeAVoucherArgs = {
  getMeAVoucherInput: GetMeAVoucherInput;
};


export type MutationRefreshVoucherArgs = {
  refreshVoucherInput: RefreshVoucherInput;
};

export type NewAccount = {
   __typename?: 'NewAccount';
  /** The account email address */
  email: Scalars['String'];
  /** The account password */
  password: Scalars['String'];
};

export type Query = {
   __typename?: 'Query';
  /** Health check */
  healthCheck: Scalars['String'];
  /** Retrieve best fuel price for all types. */
  fuel: Fuel;
  /** Retrieve the voucher list. */
  vouchers: Array<Maybe<Voucher>>;
  /** Retrieve the refreshed voucher. */
  refreshedVoucher: Voucher;
  /** Retrieve messages for a specific email address. */
  emailMessages: Array<Maybe<EmailMessage>>;
  /** Retrieve a message with a specific message ID. */
  emailMessage?: Maybe<EmailMessageWithBody>;
  /** Retrieve the verification code in the email. */
  findVerificationCodeInEmail?: Maybe<Scalars['String']>;
};


export type QueryVouchersArgs = {
  accessToken: Scalars['String'];
  deviceSecretToken: Scalars['String'];
};


export type QueryRefreshedVoucherArgs = {
  accessToken: Scalars['String'];
  deviceSecretToken: Scalars['String'];
  voucherId: Scalars['String'];
};


export type QueryEmailMessagesArgs = {
  email: Scalars['String'];
};


export type QueryEmailMessageArgs = {
  id: Scalars['Float'];
  email: Scalars['String'];
};


export type QueryFindVerificationCodeInEmailArgs = {
  email: Scalars['String'];
};

export type RefreshVoucherInput = {
  /** The account email address */
  email: Scalars['String'];
  /** The account password */
  password: Scalars['String'];
  /** The id of the voucher */
  voucherId: Scalars['String'];
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

export type AccountAndVoucherFragment = (
  { __typename?: 'AccountAndVoucher' }
  & { account: (
    { __typename?: 'NewAccount' }
    & Pick<NewAccount, 'email' | 'password'>
  ), voucher?: Maybe<(
    { __typename?: 'Voucher' }
    & Pick<Voucher, 'id' | 'status' | 'code' | 'fuelType' | 'fuelPrice' | 'expiredAt'>
  )> }
);

export type GetMeAVoucherMutationVariables = {
  getMeAVoucherInput: GetMeAVoucherInput;
};


export type GetMeAVoucherMutation = (
  { __typename?: 'Mutation' }
  & { getMeAVoucher: (
    { __typename?: 'AccountAndVoucher' }
    & AccountAndVoucherFragment
  ) }
);

export type RefreshVoucherMutationVariables = {
  refreshVoucherInput: RefreshVoucherInput;
};


export type RefreshVoucherMutation = (
  { __typename?: 'Mutation' }
  & { refreshVoucher: (
    { __typename?: 'AccountAndVoucher' }
    & AccountAndVoucherFragment
  ) }
);

export type GetFuelPriceQueryVariables = {};


export type GetFuelPriceQuery = (
  { __typename?: 'Query' }
  & { fuel: (
    { __typename?: 'Fuel' }
    & Pick<Fuel, 'updated'>
    & { E10: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ), U91: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ), U95: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ), U98: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ), Diesel: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ), LPG: (
      { __typename?: 'FuelPrice' }
      & Pick<FuelPrice, 'price' | 'name' | 'lat' | 'lng'>
    ) }
  ) }
);
