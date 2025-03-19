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

jest.mock('../src/mail/templates/email.template')
jest.mock('@react-email/components', () => ({
    render: jest.fn(),
}))

describe('AuthController (e2e)', () => {
    let app: INestApplication<App>
    let userRepository: Repository<User>
    let roleRepository: Repository<Role>
    let tokenService: TokenService

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

    describe.skip('/signin (POST)', () => {
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
                    const token = extractToken(res, 'token')
                    console.log(token)
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

    // describe.skip('/email-confirm (GET)', () => {
    //     let token:IAccessToken
    //
    //     beforeAll(async () => {
    //         await userRepository.query('TRUNCATE "user" CASCADE')
    //         await request(app.getHttpServer())
    //             .post('/auth/signup')
    //             .send(signUpDtoMock)
    //             .then(res => {
    //                 if(res.error) throw { ...res.error }
    //                 token=res.body as IAccessToken
    //                 console.log('res',token)
    //             })
    //     })
    //
    //     it('', async () => {
    //         return request(app.getHttpServer())
    //             .get('/auth/email-confirm')
    //             .set('User-Agent', 'test')
    //             .query({token:token.accessToken})
    //             .then(res=>{
    //                 if(res.error) throw {...res.error }
    //                 const result=res.body as IAccessToken
    //
    //                 expect(res.status).toBe(HttpStatus.OK)
    //                 expect(result).toBeDefined()
    //             })
    //     })
    // })
})
