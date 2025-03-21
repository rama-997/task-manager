import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { configServiceMock, HttpExceptionFilter } from '@libs/common'
import * as cookieParser from 'cookie-parser'
import { createTaskDtoMock } from '@src/tasks/mocks'
import { TokenService } from '@src/token/token.service'
import { IAuthTokens, UserPayload } from '@src/token/types'
import { userPayloadMock } from '@src/token/mocks'
import { Task } from '@src/tasks/entities'
import { JwtService } from '@nestjs/jwt'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Token } from '@src/token/entities'
import { ConfigService } from '@nestjs/config'

describe('AppController (e2e)', () => {
    let app: INestApplication<App>
    let tokenService: TokenService
    let taskRepo: Repository<Task>

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                TokenService,
                JwtService,
                { provide: ConfigService, useValue: configServiceMock },
                { provide: getRepositoryToken(Token), useClass: Repository },
                { provide: getRepositoryToken(Task), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()

        app.useGlobalPipes(new ValidationPipe({ transform: true }))
        app.useGlobalFilters(new HttpExceptionFilter())
        app.use(cookieParser())

        tokenService = moduleFixture.get<TokenService>(TokenService)
        taskRepo = moduleFixture.get<Repository<Task>>(getRepositoryToken(Task))

        await app.init()
    })

    describe('/ (POST)', () => {
        let authTokens: IAuthTokens

        beforeAll(async () => {
            authTokens = await tokenService.authTokens(
                userPayloadMock as UserPayload,
            )
        })

        beforeEach(async () => {
            await taskRepo.query('TRUNCATE task CASCADE;')
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
