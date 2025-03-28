import { Test, TestingModule } from '@nestjs/testing'
import { TokenService } from './token.service'
import { JwtService } from '@nestjs/jwt'
import { UserPayload } from '@src/token/types'
import { tokenMock, userPayloadMock } from '@src/token/mocks'
import { Repository } from 'typeorm'
import { Token } from '@src/token/entities'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from '@src/auth/entities'
import { userMock } from '@src/auth/mocks'
import { ConfigService } from '@nestjs/config'
import { configServiceMock } from '@libs/common'
import { UnauthorizedException } from '@nestjs/common'

describe('TokenService', () => {
    let service: TokenService
    let jwtService: JwtService
    let tokenRepository: Repository<Token>

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                JwtService,
                {
                    provide: getRepositoryToken(Token),
                    useClass: Repository,
                },
                { provide: ConfigService, useFactory: configServiceMock },
            ],
        }).compile()

        service = module.get<TokenService>(TokenService)
        jwtService = module.get<JwtService>(JwtService)
        tokenRepository = module.get<Repository<Token>>(
            getRepositoryToken(Token),
        )
    })

    describe('authTokens', () => {
        let userPayload: Partial<UserPayload>

        beforeEach(async () => {
            userPayload = userPayloadMock
        })

        it('should get tokens', async () => {
            jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('access')
            jest.spyOn(jwtService, 'signAsync').mockResolvedValue('refresh')

            const res = await service.authTokens(userPayload as UserPayload)

            expect(res.accessToken).toBeDefined()
            expect(res.refreshToken).toBeDefined()
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(
                1,
                userPayload,
                expect.objectContaining({ expiresIn: '1h' }),
            )
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(
                2,
                userPayload,
                expect.objectContaining({ expiresIn: '7d' }),
            )
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
        })
    })

    describe('updateAuthToken', () => {
        let token: Partial<Token>
        let refreshToken: string
        let agent: string
        let user: Partial<User>

        beforeEach(() => {
            token = tokenMock
            refreshToken = 'new token'
            agent = 'agent'
            user = userMock
        })

        it('should update token if it exist', async () => {
            jest.spyOn(tokenRepository, 'findOneBy').mockResolvedValueOnce(
                token as Token,
            )
            jest.spyOn(tokenRepository, 'save').mockResolvedValue({} as Token)

            await service.updateAuthToken(refreshToken, agent, userMock as User)

            expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
                refreshToken,
                userAgent: agent,
            })
            expect(tokenRepository.save).toHaveBeenCalledWith({
                ...token,
                refreshToken,
            })
            expect(tokenRepository.save).toHaveBeenCalledTimes(1)
        })

        it('should create token if it does not exist', async () => {
            jest.spyOn(tokenRepository, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(tokenRepository, 'save').mockResolvedValue({} as Token)

            await service.updateAuthToken(refreshToken, agent, userMock as User)

            expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
                refreshToken,
                userAgent: agent,
            })
            expect(tokenRepository.save).toHaveBeenCalledWith({
                userAgent: agent,
                users: [user],
                refreshToken,
            })
            expect(tokenRepository.save).toHaveBeenCalledTimes(1)
        })
    })

    describe('extractUserPayload', () => {
        let token: string
        let payload: UserPayload

        beforeEach(() => {
            token = 'jwt token'
            payload = userPayloadMock as UserPayload
        })

        it('should return user payload', async () => {
            jest.spyOn(tokenRepository, 'findOneBy').mockResolvedValueOnce({
                refreshToken: 'jwt',
            } as Token)
            jest.spyOn(service, 'verifyRefreshToken').mockResolvedValueOnce(
                payload,
            )

            const result = await service.extractUserPayload(token)

            expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
                refreshToken: token,
            })
            expect(service.verifyRefreshToken).toHaveBeenCalledWith(token)
            expect(result).toEqual(payload)
        })

        it('should throw if token does not exist', async () => {
            jest.spyOn(tokenRepository, 'findOneBy')
            jest.spyOn(service, 'verifyRefreshToken')

            await expect(service.extractUserPayload('')).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenRepository.findOneBy).not.toHaveBeenCalled()
            expect(service.verifyRefreshToken).not.toHaveBeenCalled()
        })

        it('should throw if token does not found', async () => {
            jest.spyOn(tokenRepository, 'findOneBy').mockResolvedValueOnce(null)
            jest.spyOn(service, 'verifyRefreshToken')

            await expect(service.extractUserPayload(token)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
                refreshToken: token,
            })
            expect(service.verifyRefreshToken).not.toHaveBeenCalled()
        })

        it('should throw if token invalid', async () => {
            jest.spyOn(tokenRepository, 'findOneBy').mockResolvedValueOnce({
                refreshToken: 'jwt',
            } as Token)
            jest.spyOn(service, 'verifyRefreshToken').mockResolvedValueOnce(
                null,
            )

            await expect(service.extractUserPayload(token)).rejects.toThrow(
                UnauthorizedException,
            )

            expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
                refreshToken: token,
            })
            expect(service.verifyRefreshToken).toHaveBeenCalledWith(token)
        })
    })
})
