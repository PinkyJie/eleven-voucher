import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { EmailMessage, EmailMessageWithBody } from './email.model';

const logger = new Logger('EmailService');

@Injectable()
export class EmailService {
  private url = 'https://www.1secmail.com/api/v1/';

  async getEmailMessages(email: string): Promise<EmailMessage[]> {
    const [login, domain] = email.split('@');
    const response = await axios.get(this.url, {
      params: {
        action: 'getMessages',
        login,
        domain,
      },
    });
    logger.log(`Get emails for: ${email}`);
    logger.log(response.data);

    return response.data;
  }

  async getEmailMessage(
    email: string,
    id: number
  ): Promise<EmailMessageWithBody> {
    const [login, domain] = email.split('@');
    const response = await axios.get(this.url, {
      params: {
        action: 'readMessage',
        login,
        domain,
        id,
      },
    });
    logger.log(`Get single email: ${email} - ${id}`);
    logger.log(response.data);

    return response.data;
  }

  async findVerificationCodeInEmail(email: string): Promise<string> {
    const messages = await this.getEmailMessages(email);
    const activationMessage = messages.find(
      message =>
        message.from === 'donotreply@my7elevencard.com.au' &&
        message.subject === '7-Eleven Card Email Confirmation'
    );
    logger.log('Find matched email:');
    logger.log(activationMessage);
    if (!activationMessage) {
      return null;
    }
    const activationMessageWithBody = await this.getEmailMessage(
      email,
      activationMessage.id
    );
    const re = /verificationCode=(.*?)"/;
    const matched = re.exec(activationMessageWithBody.body);
    logger.log(`Try to match verification code: ${email}`);
    logger.log(matched);
    if (matched && matched.length > 1) {
      return matched[1];
    }
    return null;
  }
}
