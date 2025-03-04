import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { HttpExceptionFilter } from '@libs/common'
import { signUpDtoMock } from '@src/auth/mocks'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { Repository } from 'typeorm'

jest.mock('../src/mail/templates/email.template')
jest.mock('@react-email/components',()=>({
    render:jest.fn(),
}))

describe('AuthController (e2e)', () => {
    let app: INestApplication<App>
    let userRepository: Repository<User>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                { provide: getRepositoryToken(User), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.useGlobalPipes(new ValidationPipe({ transform: true }))
        app.useGlobalFilters(new HttpExceptionFilter())

        userRepository = moduleFixture.get<Repository<User>>(
            getRepositoryToken(User),
        )

        await app.init()
    })

    beforeEach(async () => {
        await userRepository.query('TRUNCATE "user" CASCADE;')
    })

    afterAll(async () => {
        await app.close()
    })

    it('/signup (POST)', async() => {
        return request(app.getHttpServer())
            .post('/auth/signup')
            .send(signUpDtoMock)
            .then(async(res) => {
                if (res.error) throw { ...res.error }
                const result = res.body as { message: string }

                const user = await userRepository.findOneBy({
                    email: signUpDtoMock.email,
                    login: signUpDtoMock.login,
                })

                expect(user).toBeDefined()
                expect(res.status).toBe(HttpStatus.OK)
                expect(result).toEqual({ message: expect.any(String) })
            })
    })
})
