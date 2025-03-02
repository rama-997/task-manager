import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface'
import { ConfigModule, ConfigService } from '@nestjs/config'

export const mailerOption:MailerAsyncOptions={
    imports:[ConfigModule],
    inject:[ConfigService],
    useFactory: (configService: ConfigService) => ({
        transport:{
            host:configService.getOrThrow<string>('MAILER_HOST'),
            port:Number(configService.getOrThrow<string>('MAILER_PORT')),
            secure:false,
            auth:{
                user:configService.getOrThrow<string>('MAILER_USER'),
                pass:configService.getOrThrow<string>('MAILER_PASS'),
            },
        }
    })
}