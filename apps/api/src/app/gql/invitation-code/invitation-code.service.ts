import { Injectable, Inject } from '@nestjs/common';
import { subHours } from 'date-fns';
import faker from 'faker';
import sgMail from '@sendgrid/mail';

import { WINSTON_LOGGER, Logger } from '../../logger/winston-logger';
import { ApiService } from '../../api/api.service';
import { DbService } from '../../db/db.service';

interface FormResponse {
  items: {
    submitted_at: string;
    answers: {
      email: string;
    }[];
  }[];
}

@Injectable()
export class InvitationCodeService {
  private loggerInfo = {
    emitter: 'InvitationCodeService',
  };
  private formUrl = 'https://api.typeform.com/forms/Ooi5qA';

  constructor(
    @Inject(WINSTON_LOGGER) private logger: Logger,
    private apiService: ApiService,
    private dbService: DbService
  ) {}

  private async getEmailsFromInvitationForm(
    lastHours: number
  ): Promise<string[]> {
    this.logger.info(`Retrieve emails submitted by last ${lastHours} hours`, {
      ...this.loggerInfo,
    });
    const response = await this.apiService.request({
      url: `${this.formUrl}/responses`,
      params: {
        since: subHours(new Date(), lastHours),
        completed: true,
      },
      headers: {
        Authorization: `Bearer ${process.env.TYPEFORM_TOKEN}`,
      },
    });
    const data: FormResponse = response.data;
    const emails = data.items.map(item => item.answers[0].email);
    this.logger.info(
      `${emails.length} Emails retrieved from the invitation form`,
      {
        ...this.loggerInfo,
        meta: {
          emails,
        },
      }
    );
    return emails;
  }

  async sendEmail(email: string, invitationCode: string) {
    this.logger.info(`Send invitation form to ${email}`, {
      ...this.loggerInfo,
      meta: {
        email,
        invitationCode,
      },
    });

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    try {
      await sgMail.send({
        to: email,
        from: {
          email: 'eleven.voucher@gmail.com',
          name: 'Eleven Voucher Team',
        },
        templateId: 'd-c229ada9ecf54cb7af2c5db02d7051c6',
        dynamicTemplateData: {
          invitationCode,
          signupLink: `https://eleven-voucher.web.app/#/signup?email=${email}&invitationCode=${invitationCode}`,
        },
      });
    } catch (error) {
      this.logger.error(`Send email ${email} error`, {
        ...this.loggerInfo,
        meta: {
          email,
          invitationCode,
          error: error.message,
        },
      });
    }
  }

  async processInvitationForm(lastHours: number): Promise<boolean> {
    const emails = await this.getEmailsFromInvitationForm(lastHours);
    for (const email of emails) {
      const invitationDoc = await this.dbService.getInvitationByEmail(email);
      if (!invitationDoc.exists) {
        const invitationCode = faker.finance.bic();
        await this.dbService.addEmailWithInvitationCode(email, invitationCode);
        await this.sendEmail(email, invitationCode);
      }
    }
    return true;
  }
}