import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { EmailTemplate } from '@src/mail/templates'

@Injectable()
export class MailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async signUpMail(token: string, to: string) {
        const host = 'http://localhost:'
        const port = this.configService.getOrThrow<string>('APP_PORT')
        const domain = host + port
        const html = await render(EmailTemplate({ domain, token }))

        await this.mailerService.sendMail({
            from: this.configService.getOrThrow<string>('MAILER_USER'),
            to,
            subject: 'Подтверждение почты',
            html,
        })
    }
}