import { Test, TestingModule } from '@nestjs/testing'
import { TokenService } from './token.service'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/auth/entities'
import { userMock } from '@src/auth/mocks/user.mock'
import { UserPayload } from '@src/token/types'
import { userPayloadMock } from '@src/token/mocks'

describe('TokenService', () => {
    let service: TokenService
    let jwtService: JwtService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenService,JwtService],
        }).compile()

        service = module.get<TokenService>(TokenService)
        jwtService = module.get<JwtService>(JwtService)
    })

    describe('authTokens', () => {
        let userPayload:Partial<UserPayload>

        beforeEach(async () => {
            userPayload=userPayloadMock
        })

        it('should get tokens', async () => {
            jest.spyOn(jwtService,'signAsync').mockResolvedValueOnce('access')
            jest.spyOn(jwtService,'signAsync').mockResolvedValue('refresh')

            const res=await service.authTokens(userPayload as UserPayload)

            expect(res.accessToken).toBeDefined()
            expect(res.refreshToken).toBeDefined()
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(1,userPayload,{expiresIn: '1h'})
            expect(jwtService.signAsync).toHaveBeenNthCalledWith(2,userPayload,{expiresIn: '7d'})
            expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
        })
    })
})
