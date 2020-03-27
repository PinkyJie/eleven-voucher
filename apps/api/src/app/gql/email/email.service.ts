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

  async clickVerificationLinkInEmail(email: string): Promise<boolean> {
    const messages = await this.getEmailMessages(email);
    const activationMessage = messages.find(
      message =>
        message.from === 'donotreply@my7elevencard.com.au' &&
        message.subject === '7-Eleven Card Email Confirmation'
    );
    if (!activationMessage) {
      return false;
    }
    const activationMessageWithBody = await this.getEmailMessage(
      email,
      activationMessage.id
    );
    const re = /href="(https:\/\/711-goodcall\.api\.tigerspike\.com\/link\/appredirect.*?)"/;
    const matched = re.exec(activationMessageWithBody.body);
    if (matched && matched.length > 1) {
      const response = await axios.get(matched[1]);
      if (response.status === 200) {
        return true;
      }
    }
    return false;
  }
}
