import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) { }

    async sendMatchMail(email: string, name: string) {
        try {
            await this.mailerService.sendMail({
            to: email,
            subject: 'Look at you big boy!',
            template: './its_a_match',
            context: {
                name,
            },
        });    
        } catch(error) {
            throw new InternalServerErrorException("Unable to send match notification email at this time")
        }
    }
}
