import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { EmailMessage, EmailMessageWithBody } from './email.model';

@Injectable()
export class EmailService {
  private prefix = '711locker';
  private url = 'https://www.1secmail.com/api/v1';
  private domain = '1secmail.com';

  getEmailFleet(fuelType: any): string[] {
    const count = 5;
    return new Array(count)
      .fill(0)
      .map((_, idx) => `${this.prefix}-${fuelType}-${idx}@${this.domain}`);
  }

  async getEmailMessages(email: string): Promise<EmailMessage[]> {
    return axios.get(this.url, {
      data: {
        action: 'getMessages',
        login: email,
        domain: this.domain,
      },
    });
  }

  async getEmailMessage(
    email: string,
    id: number
  ): Promise<EmailMessageWithBody> {
    return axios.get(this.url, {
      data: {
        action: 'getMessage',
        login: email,
        domain: this.domain,
        id,
      },
    });
  }

  async visitActivationLink(messageBody: string): Promise<boolean> {
    const re = /href="(https:\/\/711-goodcall\.api\.tigerspike\.com\/link\/appredirect.*?)"/;
    const matched = re.exec(messageBody);
    if (matched && matched.length > 1) {
      const response = await axios.get(
        matched[1].replace('https://', 'http://')
      );
      if (response.status === 200) {
        return true;
      }
    }
    return Promise.resolve(false);
  }
}
