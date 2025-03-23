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
import { createRoleDtoMock, roleMock, updateRoleDtoMock } from '@src/role/mocks'
import { userPayloadMock } from '@src/token/mocks'
import { IAuthTokens, UserPayload } from '@src/token/types'
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

    describe('POST /role', () => {
        let authToken: IAuthTokens

        beforeEach(async () => {
            authToken = await tokenService.authTokens(
                userPayloadMock as UserPayload,
            )
        })

        it('CREATED', async () => {
            return request(app.getHttpServer())
                .post('/role')
                .auth(authToken.accessToken, { type: 'bearer' })
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

        it('BAD_REQUEST', async () => {
            return request(app.getHttpServer())
                .post('/role')
                .auth(authToken.accessToken, { type: 'bearer' })
                .send({ value: 'bad value' })
                .expect(HttpStatus.BAD_REQUEST)
        })

        it('CONFLICT', async () => {
            await roleRepo.save(createRoleDtoMock)
            return request(app.getHttpServer())
                .post('/role')
                .auth(authToken.accessToken, { type: 'bearer' })
                .send(createRoleDtoMock)
                .expect(HttpStatus.CONFLICT)
        })
    })

    describe('GET /role/:id', () => {
        let role: Role
        let authTokens: IAuthTokens

        beforeEach(async () => {
            role = await roleRepo.save(createRoleDtoMock)
            authTokens = await tokenService.authTokens(
                userPayloadMock as UserPayload,
            )
        })

        it.skip('OK', async () => {
            return request(app.getHttpServer())
                .get(`/role/${role.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .then(res => {
                    if (res.error) throw { ...res.error }
                    const result = res.body as Role

                    expect(result).toEqual(expect.objectContaining(role))
                    expect(result.id).toBe(role.id)
                })
        })

        it('BAD_REQUEST', async () => {
            return request(app.getHttpServer())
                .get(`/role/123`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .expect(HttpStatus.BAD_REQUEST)
        })

        it.skip('NOT_FOUND', async () => {
            await roleRepo.delete(role.id)
            return request(app.getHttpServer())
                .get(`/role/${role.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .expect(HttpStatus.NOT_FOUND)
        })
    })

    describe('PATCH /role/:id', () => {
        let role: Role
        let authTokens: IAuthTokens

        beforeEach(async () => {
            role = await roleRepo.save(createRoleDtoMock)
            authTokens = await tokenService.authTokens(
                userPayloadMock as UserPayload,
            )
        })

        it('OK', async () => {
            return request(app.getHttpServer())
                .patch(`/role/${role.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
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

        it('BAD_REQUEST on param id', async () => {
            return request(app.getHttpServer())
                .patch(`/role/123`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .send(updateRoleDtoMock)
                .expect(HttpStatus.BAD_REQUEST)
        })

        it('BAD_REQUEST on dto', async () => {
            return request(app.getHttpServer())
                .patch(`/role/${role.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .send({ value: 'some value' })
                .expect(HttpStatus.BAD_REQUEST)
        })

        it('NOT_FOUND', async () => {
            return request(app.getHttpServer())
                .patch(`/role/${roleMock.id}`)
                .auth(authTokens.accessToken, { type: 'bearer' })
                .send(updateRoleDtoMock)
                .expect(HttpStatus.BAD_REQUEST)
        })

        it('FORBIDDEN', async () => {
            const { accessToken: forbiddenToken } =
                await tokenService.authTokens({
                    ...userPayloadMock,
                    roles: [ERoles.USER],
                } as UserPayload)

            return request(app.getHttpServer())
                .patch(`/role/${role.id}`)
                .auth(forbiddenToken, { type: 'bearer' })
                .send(updateRoleDtoMock)
                .expect(HttpStatus.FORBIDDEN)
        })
    })

    describe('DELETE /role/:id', () => {
        let role: Role
        let authTokens: IAuthTokens

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
            const { accessToken: forbiddenToken } =
                await tokenService.authTokens({
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
