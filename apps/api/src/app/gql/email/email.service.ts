import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { EmailMessage, EmailMessageWithBody } from './email.model';

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
    return response.data;
  }

  async findVerificationCodeInEmail(email: string): Promise<string> {
    const messages = await this.getEmailMessages(email);
    const activationMessage = messages.find(
      message =>
        message.from === 'donotreply@my7elevencard.com.au' &&
        message.subject === '7-Eleven Card Email Confirmation'
    );
    if (!activationMessage) {
      return null;
    }
    const activationMessageWithBody = await this.getEmailMessage(
      email,
      activationMessage.id
    );
    const re = /verificationCode=(.*?)"/;
    const matched = re.exec(activationMessageWithBody.body);
    if (matched && matched.length > 1) {
      return matched[1];
    }
    return null;
  }
}
