import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';

import { Account } from './account.model';
import { AccountService } from './account.service';
import { LoginInput, LogoutInput, RegisterAccountInput } from './account.dto';

@Resolver()
export class AccountResolver {
  constructor(private accountService: AccountService) {}

  @Query(() => String, { description: 'Health check' })
  healthCheck(): string {
    return 'OK';
  }

  @Mutation(() => Boolean, { description: 'Register a new account' })
  async registerAccount(
    @Args('registerAccountInput') registerAccountInput: RegisterAccountInput
  ): Promise<boolean> {
    return this.accountService.register(
      registerAccountInput.email,
      registerAccountInput.password,
      registerAccountInput.firstName,
      registerAccountInput.lastName,
      registerAccountInput.phone,
      registerAccountInput.dobTimestamp
    );
  }

  @Mutation(() => Account, { description: 'Log in' })
  async loginAccount(
    @Args('loginInput') loginInput: LoginInput
  ): Promise<Account> {
    return this.accountService.login(loginInput.email, loginInput.password);
  }

  @Mutation(() => Boolean, { description: 'Log out' })
  async logoutAccount(
    @Args('logoutInput') logoutInput: LogoutInput
  ): Promise<boolean> {
    return this.accountService.logout(
      logoutInput.deviceSecretToken,
      logoutInput.accessToken
    );
  }

  @Mutation(() => Account, { description: 'Verify account' })
  async verifyAccount(
    @Args('verificationCode') verificationCode: string,
    @Args('email') email: string
  ): Promise<Account> {
    return this.accountService.verify(verificationCode, email);
  }
}
