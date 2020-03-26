import { Account } from './account.model';
import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';
import { AccountService } from './account.service';
import { LoginInput, LogoutInput, RegisterAccountInput } from './account.dto';

@Resolver(() => Account)
export class AccountResolver {
  constructor(private accountService: AccountService) {}

  @Query(() => String, { name: 'dummy' })
  dummy(): string {
    return 'Dummy';
  }

  @Mutation(() => Boolean)
  async register(
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

  @Mutation(() => Account)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<Account> {
    return this.accountService.login(loginInput.email, loginInput.password);
  }

  @Mutation(() => Boolean)
  async logout(
    @Args('logoutInput') logoutInput: LogoutInput
  ): Promise<boolean> {
    return this.accountService.logout(
      logoutInput.deviceSecretToken,
      logoutInput.accessToken
    );
  }
}
