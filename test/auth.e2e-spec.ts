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
import { Role } from '@src/role/entities'
import { Token } from '@src/token/entities'
import { createRoleDtoMock } from '@src/role/mocks'
import { IAccessToken } from '@src/auth/types'
import { ERoles } from '@src/role/types'
import * as cookieParser from 'cookie-parser'
import { SignInDto } from '@src/auth/dto'

jest.mock('../src/mail/templates/email.template')
jest.mock('@react-email/components', () => ({
    render: jest.fn(),
}))

describe('AuthController (e2e)', () => {
    let app: INestApplication<App>
    let userRepository: Repository<User>
    let tokenRepository: Repository<Token>
    let roleRepository: Repository<Role>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                { provide: getRepositoryToken(User), useClass: Repository },
                { provide: getRepositoryToken(Role), useClass: Repository },
                { provide: getRepositoryToken(Token), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.useGlobalPipes(new ValidationPipe({ transform: true }))
        app.useGlobalFilters(new HttpExceptionFilter())
        app.use(cookieParser())

        userRepository = moduleFixture.get<Repository<User>>(
            getRepositoryToken(User),
        )
        roleRepository = moduleFixture.get<Repository<Role>>(
            getRepositoryToken(Role),
        )
        tokenRepository = moduleFixture.get<Repository<Token>>(
            getRepositoryToken(Token),
        )

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    it.skip('/signup (POST)', async () => {
        await roleRepository.save({ value: ERoles.USER })

        return request(app.getHttpServer())
            .post('/auth/signup')
            .send(signUpDtoMock)
            .then(async res => {
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

    describe('/signin (POST)', () => {
        let signInDto: SignInDto

        beforeAll(async () => {
            await userRepository.query('TRUNCATE "user" CASCADE')
            await userRepository.query('TRUNCATE "role" CASCADE')
            await roleRepository.save({ value: ERoles.USER })
            await request(app.getHttpServer())
                .post('/auth/signup')
                .send(signUpDtoMock)
                .then(res => {
                    if (res.error) throw { ...res.error }
                })
            signInDto = {
                password: signUpDtoMock.password as string,
                loginOrEmail: signUpDtoMock.email as string,
            }
        })

        it('', async () => {
            return request(app.getHttpServer())
                .post('/auth/signin')
                .set('User-Agent', 'test')
                .send(signInDto)
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as IAccessToken

                    expect(res.status).toBe(HttpStatus.OK)
                    expect(result).toEqual({ accessToken: expect.any(String) })
                })
        })
    })
})
