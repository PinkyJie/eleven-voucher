import { Injectable, Inject } from '@nestjs/common';

import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { ApiService } from '../../api/api.service';

import { EmailMessage, EmailMessageWithBody } from './email.model';

@Injectable()
export class EmailService {
  private loggerInfo = {
    emitter: 'EmailService',
  };
  private url = 'https://www.1secmail.com/api/v1/';

  constructor(
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private apiService: ApiService
  ) {}

  async getEmailMessages(email: string): Promise<EmailMessage[]> {
    this.logger.debug('Get all email messages', {
      ...this.loggerInfo,
      meta: { email },
    });
    const [login, domain] = email.split('@');
    const response = await this.apiService.request({
      url: this.url,
      method: 'GET',
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
    this.logger.debug('Get single email message', {
      ...this.loggerInfo,
      meta: {
        email,
        id,
      },
    });
    const [login, domain] = email.split('@');
    const response = await this.apiService.request({
      url: this.url,
      method: 'GET',
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
    this.logger.debug('Find activation email', {
      ...this.loggerInfo,
      meta: {
        email,
      },
    });
    if (!activationMessage) {
      return null;
    }
    const activationMessageWithBody = await this.getEmailMessage(
      email,
      activationMessage.id
    );
    const re = /verificationCode=(.*?)"/;
    const matched = re.exec(activationMessageWithBody.body);
    this.logger.debug('Try to match verification code', {
      ...this.loggerInfo,
      meta: {
        email,
        matched,
      },
    });
    if (matched && matched.length > 1) {
      return matched[1];
    }
    return null;
  }
}
