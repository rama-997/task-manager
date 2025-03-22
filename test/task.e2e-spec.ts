import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { configServiceMock, HttpExceptionFilter } from '@libs/common'
import * as cookieParser from 'cookie-parser'
import { createTaskDtoMock } from '@src/tasks/mocks'
import { TokenService } from '@src/token/token.service'
import { IAuthTokens } from '@src/token/types'
import { Task } from '@src/tasks/entities'
import { JwtService } from '@nestjs/jwt'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from '@src/token/entities'
import { ConfigService } from '@nestjs/config'
import { User } from '@src/auth/entities'
import { userMock } from '@src/auth/mocks'
import { ERoles } from '@src/role/types'

describe('AppController (e2e)', () => {
    let app: INestApplication<App>
    let tokenService: TokenService
    let taskRepo: Repository<Task>
    let userRepo: Repository<User>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                TokenService,
                JwtService,
                { provide: ConfigService, useValue: configServiceMock },
                { provide: getRepositoryToken(Token), useClass: Repository },
                { provide: getRepositoryToken(Task), useClass: Repository },
                { provide: getRepositoryToken(User), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.useGlobalPipes(new ValidationPipe({ transform: true }))
        app.useGlobalFilters(new HttpExceptionFilter())
        app.use(cookieParser())

        tokenService = moduleFixture.get<TokenService>(TokenService)
        taskRepo = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task))
        userRepo = moduleFixture.get<Repository<User>>(getRepositoryToken(User))

        await app.init()
    })

    describe('/ (POST)', () => {
        let authTokens: IAuthTokens
        let user: User

        beforeEach(async () => {
            user = await userRepo.save(userMock)
            authTokens = await tokenService.authTokens({
                id: user.id,
                roles: [ERoles.ADMIN],
            })
        })

        it('should create task', async () => {
            return request(app.getHttpServer())
                .post('/tasks')
                .auth(authTokens.accessToken, { type: 'bearer' })
                .send(createTaskDtoMock)
                .then(res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as Task

                    expect(res.status).toBe(HttpStatus.CREATED)
                    expect(result).toEqual(
                        expect.objectContaining(createTaskDtoMock),
                    )
                })
        })
    })
})
