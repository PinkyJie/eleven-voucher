import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class EmailMessage {
  @Field(() => Int, { description: 'Message ID' })
  id: number;

  @Field({ description: 'Sender email address' })
  from: string;

  @Field({ description: 'Message subject' })
  subject: string;

  @Field({ description: 'Receive date' })
  date: string;
}

@ObjectType()
export class EmailMessageWithBody extends EmailMessage {
  @Field({ description: 'Message body' })
  body: string;
}
