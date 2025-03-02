import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { mailerOption } from '@src/mail/module-options'

@Module({
    imports: [MailerModule.forRootAsync(mailerOption)],
    providers: [MailService],
    exports:[MailService]
})
export class MailModule {}
