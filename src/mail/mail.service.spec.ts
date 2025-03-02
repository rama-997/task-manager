import { Test, TestingModule } from '@nestjs/testing'
import { MailService } from './mail.service'
import { MailerService } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import * as reactEmail from '@react-email/components'
import { mailerMock } from '@src/mail/module-options/mocks'

jest.mock('./templates/email.template')
jest.mock('@react-email/components',()=>({
    render: jest.fn(),
}))

describe('MailService', () => {
    let service: MailService
    let mailerService: MailerService
    let configService: ConfigService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailService,
                { provide: MailerService, useFactory: mailerMock },
                ConfigService,
            ],
        }).compile()

        service = module.get<MailService>(MailService)
        mailerService = module.get<MailerService>(MailerService)
        configService = module.get<ConfigService>(ConfigService)
    })

    describe('signUpMail', () => {
        let domain: string
        let to: string
        let html: string

        beforeEach(() => {
            domain = 'domain'
            to = 'to'
            html = 'element'
        })

        it('should send a confirm email', async () => {
            jest.spyOn(configService, 'getOrThrow').mockReturnValue(domain)
            jest.spyOn(reactEmail, 'render').mockImplementationOnce(async()=>html)
            jest.spyOn(mailerService, 'sendMail').mockResolvedValue('')

            await service.signUpMail(domain, to)

            expect(configService.getOrThrow).toHaveBeenCalledTimes(2)
            expect(mailerService.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    html,
                    to,
                }),
            )
        })
    })
})
