import { Field, ObjectType } from '@nestjs/graphql';

import { Voucher } from '../seven-eleven/voucher/voucher.model';

@ObjectType()
export class NewAccount {
  @Field({ description: 'The account email address' })
  email: string;

  @Field({ description: 'The account password' })
  password: string;
}

@ObjectType()
export class AccountAndVoucher {
  @Field(() => NewAccount, { description: 'The newly registered account' })
  account: NewAccount;

  @Field(() => Voucher, { description: 'The lock in voucher', nullable: true })
  voucher?: Voucher;
}
