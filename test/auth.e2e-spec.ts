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
import { IAccessToken, IAuthMess } from '@src/auth/types'
import { ERoles } from '@src/role/types'
import * as cookieParser from 'cookie-parser'
import { SignInDto } from '@src/auth/dto'
import { extractToken } from '@libs/utils'
import { TokenService } from '@src/token/token.service'
import { JwtService } from '@nestjs/jwt'
import { Token } from '@src/token/entities'
import { createRoleDtoMock } from '@src/role/mocks'
import { IAuthTokens } from '@src/token/types'

jest.mock('../src/mail/templates/email.template')
jest.mock('@react-email/components', () => ({
    render: jest.fn(),
}))

describe('AuthController (e2e)', () => {
    let app: INestApplication<App>
    let userRepository: Repository<User>
    let roleRepository: Repository<Role>
    let tokenService: TokenService
    let tokenRepository: Repository<Token>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                { provide: getRepositoryToken(User), useClass: Repository },
                { provide: getRepositoryToken(Role), useClass: Repository },
                { provide: getRepositoryToken(Token), useClass: Repository },
                TokenService,
                JwtService,
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
        tokenService = moduleFixture.get<TokenService>(TokenService)

        await app.init()
    })

    afterAll(async () => {
        await app.close()
    })

    describe('/sign-up (POST)', () => {
        beforeAll(async () => {
            await roleRepository.query('TRUNCATE role CASCADE;')
            await roleRepository.query('TRUNCATE "user" CASCADE;')
            await roleRepository.save({ value: ERoles.USER })
        })

        it('should be signed-up', async () => {
            return request(app.getHttpServer())
                .post('/auth/sign-up')
                .send(signUpDtoMock)
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as IAuthMess

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

    describe('/email-confirm (GET)', () => {
        let tokens: IAuthTokens
        let user: User
        let role: Role
        let agent: string

        beforeAll(async () => {
            await roleRepository.query('TRUNCATE role CASCADE;')
            await userRepository.query('TRUNCATE "user" CASCADE;')

            agent = 'supertest'
            role = await roleRepository.save(createRoleDtoMock)
            user = await userRepository.save({
                ...signUpDtoMock,
                password: 'password',
                roles: [role],
            })
            tokens = await tokenService.authorization(user, agent)
        })

        it('should be confirmed', async () => {
            return request(app.getHttpServer())
                .get('/auth/email-confirm')
                .set('User-Agent', agent)
                .query({ token: tokens.accessToken })
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as IAccessToken

                    const payload = await tokenService.verifyAccessToken(
                        result.accessToken,
                    )
                    const signedUpUser = await userRepository.findOneBy({
                        id: payload?.id,
                    })

                    expect(res.status).toBe(HttpStatus.OK)
                    expect(signedUpUser?.isConfirm).toBe(true)
                })
        })
    })

    describe('/sign-in (POST)', () => {
        let signInDto: SignInDto

        beforeAll(async () => {
            await userRepository.query('TRUNCATE "user" CASCADE')
            await userRepository.query('TRUNCATE "role" CASCADE')
            await roleRepository.save({ value: ERoles.USER })
            await request(app.getHttpServer())
                .post('/auth/sign-up')
                .send(signUpDtoMock)
                .then(res => {
                    if (res.error) throw { ...res.error }
                })
            signInDto = {
                password: signUpDtoMock.password as string,
                loginOrEmail: signUpDtoMock.email as string,
            }
        })

        it('should signedIn', async () => {
            return request(app.getHttpServer())
                .post('/auth/sign-in')
                .set('User-Agent', 'test')
                .send(signInDto)
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as IAccessToken
                    const token = extractToken(res, 'token')

                    const accessPayload =
                        await tokenService.verifyAccessToken(token)
                    const refreshPayload =
                        await tokenService.verifyRefreshToken(token)
                    const user = await userRepository.findOneBy({
                        id: accessPayload?.id,
                    })

                    expect(accessPayload?.roles).toBeDefined()
                    expect(accessPayload?.id).toBe(refreshPayload?.id)
                    expect(accessPayload?.id).toBe(user!.id)
                    expect(res.status).toBe(HttpStatus.OK)
                    expect(result).toEqual({ accessToken: expect.any(String) })
                })
        })
    })

    describe('/logout (GET)', () => {
        let cookies: any

        beforeAll(async () => {
            await roleRepository.query('TRUNCATE "role" CASCADE')
            await userRepository.query('TRUNCATE "user" CASCADE')
            await userRepository.save({
                ...signUpDtoMock,
                password:
                    '$2a$04$rshjS4C4R1BOqrKbpPkn7u8xpSOtpTXEBgeRhTlmhxF5YCYc0JWUi',
            })
        })

        it('should be logout', async () => {
            await request(app.getHttpServer())
                .post('/auth/sign-in')
                .send({
                    loginOrEmail: signUpDtoMock.email,
                    password: signUpDtoMock.password,
                })
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    cookies = res.headers['set-cookie']
                })

            return request(app.getHttpServer())
                .get('/auth/logout')
                .set('Cookie', cookies)
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as { message: string }
                    const token = extractToken(res, 'token')
                    const tokenEnt = await tokenRepository.findOneBy({
                        refreshToken: token,
                    })

                    expect(result).toMatchObject({
                        message: expect.any(String),
                    })
                    expect(token).toBeFalsy()
                    expect(tokenEnt).toBeNull()
                })
        })
    })
})
