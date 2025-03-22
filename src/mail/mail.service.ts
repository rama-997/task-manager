import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'
import { EmailTemplate, ResetPassTemplate } from '@src/mail/templates'

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

    async resetPassMail(token: string, to: string) {
        const domain = this.configService.getOrThrow<string>('CLIENT_DOMAIN')
        const html = await render(ResetPassTemplate({ domain, token }))

        await this.mailerService.sendMail({
            from: this.configService.getOrThrow<string>('MAILER_USER'),
            to,
            subject: 'Сброс пароля',
            html,
        })
    }
}