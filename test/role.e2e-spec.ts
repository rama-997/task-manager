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
import { createRoleDtoMock, updateRoleDtoMock } from '@src/role/mocks'
import { userPayloadMock } from '@src/token/mocks'
import { AuthTokens, UserPayload } from '@src/token/types'
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
        const { accessToken } = await tokenService.authTokens(
            userPayloadMock as UserPayload,
        )
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

    it('GET /role/:id', async () => {
        const role = await roleRepo.save(createRoleDtoMock)
        const { accessToken } = await tokenService.authTokens(
            userPayloadMock as UserPayload,
        )
        return request(app.getHttpServer())
            .get(`/role/${role.id}`)
            .auth(accessToken, { type: 'bearer' })
            .then(res => {
                if (res.error) throw { ...res.error }
                const result = res.body as Role

                expect(result).toEqual(expect.objectContaining(role))
                expect(result.id).toBe(role.id)
            })
    })

    it('PATCH /role/:id', async () => {
        const role = await roleRepo.save(createRoleDtoMock)
        const { accessToken } = await tokenService.authTokens(
            userPayloadMock as UserPayload,
        )
        return request(app.getHttpServer())
            .patch(`/role/${role.id}`)
            .auth(accessToken, { type: 'bearer' })
            .send(updateRoleDtoMock)
            .then(res => {
                if (res.error) throw { ...res.error }
                const result = res.body as Role

                expect(result).toEqual(
                    expect.objectContaining(updateRoleDtoMock),
                )
                expect(result.id).toBe(role.id)
            })
    })

    describe('DELETE /role/:id', () => {
        let role: Role
        let authTokens: AuthTokens

        beforeEach(async () => {
            role = await roleRepo.save(createRoleDtoMock)
            authTokens = await tokenService.authTokens(
                userPayloadMock as UserPayload,
            )
        })

        it('OK', async () => {
            return request(app.getHttpServer())
                .delete(`/role/${role.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .then(async res => {
                    if (res.error) throw { ...res.error }
                    const deletedRole = await roleRepo.findOneBy({
                        id: role.id,
                    })

                    expect(res.statusCode).toBe(HttpStatus.OK)
                    expect(deletedRole).toBe(null)
                })
        })

        it('BAD REQUEST', async () => {
            return request(app.getHttpServer())
                .delete(`/role/123`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .expect(HttpStatus.BAD_REQUEST)
        })

        it('UNAUTHORIZED', async () => {
            return request(app.getHttpServer())
                .delete(`/role/${role.id}`)
                .expect(HttpStatus.UNAUTHORIZED)
        })

        it('FORBIDDEN', async () => {
            const {accessToken:forbiddenToken} = await tokenService.authTokens({
                ...userPayloadMock,
                roles: [ERoles.USER],
            } as UserPayload)

            return request(app.getHttpServer())
                .delete(`/role/${role.id}`)
                .auth(forbiddenToken, { type: 'bearer' })
                .expect(HttpStatus.FORBIDDEN)
        })
    })
})
