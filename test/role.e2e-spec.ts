import { Test, TestingModule } from '@nestjs/testing'
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { App } from 'supertest/types'
import { AppModule } from '../src/app.module'
import { Repository } from 'typeorm'
import { Role } from '@src/role/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { HttpExceptionFilter } from '@libs/common'
import { TokenService } from '@src/token/token.service'
import { createRoleDtoMock } from '@src/role/mocks'
import { ERoles } from '@src/role/types'

describe('AppController (e2e)', () => {
    let app: INestApplication<App>
    let roleRepo: Repository<Role>
    let tokenService: TokenService

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                { provide: getRepositoryToken(Role), useClass: Repository },
            ],
        }).compile()

        app = moduleFixture.createNestApplication()
        app.useGlobalFilters(new HttpExceptionFilter())
        app.useGlobalPipes(new ValidationPipe({ transform: true }))

        roleRepo = moduleFixture.get<Repository<Role>>(getRepositoryToken(Role))
        tokenService = moduleFixture.get<TokenService>(TokenService)

        await app.init()
    })

    beforeEach(async () => {
        await roleRepo.query('TRUNCATE role CASCADE;')
    })

    afterAll(async () => {
        await app.close()
    })

    it('POST /role', async () => {
        const { accessToken } = await tokenService.authTokens({
            id: '550e8400-e29b-41d4-a716-446655440000',
            roles: [ERoles.ADMIN],
        })
        return request(app.getHttpServer())
            .post('/role')
            .auth(accessToken, { type: 'bearer' })
            .send(createRoleDtoMock)
            .then(res => {
                if (res.error) throw { ...res.error }
                const result = res.body as Role

                expect(res.statusCode).toBe(HttpStatus.CREATED)
                expect(result.id).toBeDefined()
                expect(result).toEqual(
                    expect.objectContaining(createRoleDtoMock),
                )
            })
    })
})
