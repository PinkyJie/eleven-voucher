import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';

import { SessionUser } from './user.model';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => SessionUser, {
    name: 'sessionUser',
    description: 'Retrieve current logged in session user.',
    nullable: true,
  })
  async getSessionUser(@Args('token') token: string): Promise<SessionUser> {
    return this.userService.getSessionUser(token);
  }

  @Mutation(() => SessionUser, {
    description: 'Sign up for new user.',
  })
  async signup(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('invitationCode') invitationCode: string
  ): Promise<SessionUser> {
    return this.userService.signup(email, password, invitationCode);
  }
}
